-- ── Archive tables ──────────────────────────────────────────────────────────────
-- Purpose: Move old records out of the primary tables to stay within Supabase
-- free tier (500 MB database storage limit).
--
-- Strategy: Records older than 90 days that are in terminal states (won/lost
-- leads, completed/cancelled jobs, rejected/hired candidates) are moved to
-- shadow archive tables with identical schema. The auto-archiver API route
-- runs daily via Vercel Cron and calls this logic.
--
-- Archive tables are identical to their source but have:
--   - archived_at TIMESTAMPTZ: when the row was archived
--   - No foreign key constraints (keeps archives self-contained)

-- ── archived_leads ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS archived_leads (
  LIKE leads INCLUDING ALL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop FKs inherited from LIKE (archives are read-only cold storage)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'archived_leads'::regclass AND contype = 'f'
  LOOP
    EXECUTE 'ALTER TABLE archived_leads DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END$$;

-- ── archived_jobs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS archived_jobs (
  LIKE jobs INCLUDING ALL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'archived_jobs'::regclass AND contype = 'f'
  LOOP
    EXECUTE 'ALTER TABLE archived_jobs DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END$$;

-- ── archived_candidates ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS archived_candidates (
  LIKE candidates INCLUDING ALL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'archived_candidates'::regclass AND contype = 'f'
  LOOP
    EXECUTE 'ALTER TABLE archived_candidates DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END$$;

-- ── RLS: archive tables are read-only for authenticated users ──────────────────
ALTER TABLE archived_leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_candidates  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read archived_leads"
  ON archived_leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read archived_jobs"
  ON archived_jobs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read archived_candidates"
  ON archived_candidates FOR SELECT TO authenticated USING (true);

-- Service role (used by auto-archiver API) can do everything
CREATE POLICY "Service role full access archived_leads"
  ON archived_leads TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access archived_jobs"
  ON archived_jobs TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access archived_candidates"
  ON archived_candidates TO service_role USING (true) WITH CHECK (true);

-- ── push_subscription column for Web Push notifications ───────────────────────
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS push_subscription JSONB DEFAULT NULL;

COMMENT ON COLUMN cleaners.push_subscription IS
  'Web Push PushSubscription JSON. Populated when cleaner grants notification permission in portal.';
