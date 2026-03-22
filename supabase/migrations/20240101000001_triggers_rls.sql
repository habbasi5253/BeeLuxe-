-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: 20240101000001_triggers_rls
-- Auto-update timestamps + Row Level Security policies
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── updated_at trigger function ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'candidates','leads','clients','cleaners','jobs','invoices'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ─── Auto-mark overdue invoices ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_overdue_invoices()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE invoices
  SET status = 'overdue'
  WHERE status = 'sent'
    AND due_date < CURRENT_DATE;
END;
$$;

-- ─── Update client total_revenue when invoice is paid ────────────────────────
CREATE OR REPLACE FUNCTION public.sync_client_revenue()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') THEN
    UPDATE clients
    SET total_revenue = total_revenue + NEW.total
    WHERE id = NEW.client_id;
  END IF;

  IF OLD.status = 'paid' AND NEW.status != 'paid' THEN
    UPDATE clients
    SET total_revenue = GREATEST(0, total_revenue - OLD.total)
    WHERE id = NEW.client_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_client_revenue
AFTER UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION public.sync_client_revenue();

-- ─── Update client outstanding_balance from invoices ─────────────────────────
CREATE OR REPLACE FUNCTION public.sync_outstanding_balance()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE clients
  SET outstanding_balance = (
    SELECT COALESCE(SUM(total), 0)
    FROM invoices
    WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)
      AND status IN ('sent','overdue')
  )
  WHERE id = COALESCE(NEW.client_id, OLD.client_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_outstanding_balance
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION public.sync_outstanding_balance();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE candidates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses           ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admins/staff) can do everything.
-- Scope down per role in production using auth.jwt() claims.
DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'candidates','interview_sessions','leads','lead_activities',
    'clients','cleaners','jobs','job_assignments',
    'invoices','contractor_payouts','expenses'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "%s_authenticated_all"
       ON %s FOR ALL
       TO authenticated
       USING (true)
       WITH CHECK (true)',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Service role (API routes using SUPABASE_SERVICE_ROLE_KEY) bypasses RLS.
-- No additional policy needed — service_role is a superuser in Supabase.
