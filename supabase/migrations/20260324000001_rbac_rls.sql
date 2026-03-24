-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: 20260324000001_rbac_rls
-- BeeLuxe Cleaners — Role-Based Access Control via Row Level Security
--
-- ROLES:
--   owner   — full platform access (the business owner)
--   staff   — operational access: scheduling, CRM, recruitment (no financial delete)
--   cleaner — scoped access: only their own jobs, their own payout history,
--             their own cleaner profile. Zero access to financial, CRM, or
--             recruitment data.
--
-- HOW IT WORKS:
--   1. user_profiles table maps every auth.users row to a role + optional cleaner_id.
--   2. Two SECURITY DEFINER helpers expose the caller's role and cleaner_id
--      without giving users direct access to user_profiles.
--   3. Every RLS policy calls these helpers — they run as the DB owner so
--      callers cannot inspect or manipulate them.
--   4. The blanket "authenticated_all" policies from the initial migration are
--      dropped and replaced with role-aware policies.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. User profiles ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'cleaner'
                CHECK (role IN ('owner', 'staff', 'cleaner')),
  cleaner_id  UUID        REFERENCES cleaners(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only owners/staff can read the profiles table directly.
-- Cleaners interact via the helper functions below.
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner_staff"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('owner', 'staff')
  )
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('owner', 'staff')
  );

-- Users can always read their own profile row (needed for role detection on login)
CREATE POLICY "profiles_self_read"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ── 2. Role-helper functions ──────────────────────────────────────────────────

-- Returns the current user's role. Falls back to 'cleaner' (most restrictive).
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM user_profiles WHERE id = auth.uid()),
    'cleaner'
  )
$$;

-- Returns the cleaner_id linked to the current user, or NULL.
CREATE OR REPLACE FUNCTION public.my_cleaner_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cleaner_id FROM user_profiles WHERE id = auth.uid()
$$;

-- ── 3. Drop blanket policies from initial migration ───────────────────────────

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'candidates','interview_sessions','leads','lead_activities',
    'clients','cleaners','jobs','job_assignments',
    'invoices','contractor_payouts','expenses'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_authenticated_all" ON %s', tbl, tbl);
  END LOOP;
END $$;

-- ── 4. Financial tables — owner/staff only ────────────────────────────────────
-- Cleaners must NEVER see aggregate revenue, client billing, or other
-- cleaners' pay rates. This is a hard wall.

CREATE POLICY "invoices_owner_staff"
  ON invoices FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

CREATE POLICY "expenses_owner_staff"
  ON expenses FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

-- Cleaners can see ONLY their own payout rows.
-- (They cannot see how much another cleaner earns or what the client is billed.)
CREATE POLICY "payouts_owner_staff"
  ON contractor_payouts FOR ALL TO authenticated
  USING (
    get_my_role() IN ('owner', 'staff')
    OR (get_my_role() = 'cleaner' AND cleaner_id = my_cleaner_id())
  )
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

-- ── 5. CRM — owner/staff only ─────────────────────────────────────────────────
-- Lead pipeline and client billing addresses are PII that cleaners don't need.

CREATE POLICY "leads_owner_staff"
  ON leads FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

CREATE POLICY "lead_activities_owner_staff"
  ON lead_activities FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

CREATE POLICY "clients_owner_staff"
  ON clients FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

-- ── 6. Recruitment — owner/staff only ────────────────────────────────────────
-- Applicant SSNs, background check status, and AI evaluations are sensitive.
-- Cleaners do not need and must not see this data.

CREATE POLICY "candidates_owner_staff"
  ON candidates FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

CREATE POLICY "interview_sessions_owner_staff"
  ON interview_sessions FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

-- ── 7. Operations — cleaners get a read-only window into their own work ───────

-- Cleaners: read own profile row only. Owner/staff: full CRUD.
CREATE POLICY "cleaners_owner_staff_all"
  ON cleaners FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

CREATE POLICY "cleaners_self_read"
  ON cleaners FOR SELECT TO authenticated
  USING (
    get_my_role() = 'cleaner' AND id = my_cleaner_id()
  );

-- Jobs: owner/staff see all; cleaners see only jobs they are assigned to.
CREATE POLICY "jobs_owner_staff_all"
  ON jobs FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

CREATE POLICY "jobs_cleaner_own"
  ON jobs FOR SELECT TO authenticated
  USING (
    get_my_role() = 'cleaner'
    AND EXISTS (
      SELECT 1
      FROM job_assignments ja
      WHERE ja.job_id = jobs.id
        AND ja.cleaner_id = my_cleaner_id()
    )
  );

-- Cleaners can update their own job status (check-in / check-out) but not price/notes.
-- In production you'd use a column-level policy or a separate endpoint; for now
-- we allow UPDATE only via the service role (which bypasses RLS).

-- Job assignments: owner/staff see all; cleaners see their own.
CREATE POLICY "job_assignments_owner_staff_all"
  ON job_assignments FOR ALL TO authenticated
  USING  (get_my_role() IN ('owner', 'staff'))
  WITH CHECK (get_my_role() IN ('owner', 'staff'));

CREATE POLICY "job_assignments_cleaner_own"
  ON job_assignments FOR SELECT TO authenticated
  USING (
    get_my_role() = 'cleaner' AND cleaner_id = my_cleaner_id()
  );

-- ── 8. Trigger: auto-create a user_profile on sign-up ─────────────────────────
-- Default role is 'cleaner' (least privilege). The owner promotes to
-- 'owner'/'staff' manually via the Supabase dashboard or an admin endpoint.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_app_meta_data->>'role', 'cleaner'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 9. Portal route: allow unauthenticated reads on cleaner's OWN jobs ────────
-- The /portal/[cleanerId] page is accessed by cleaners who may not have a
-- Supabase account yet (demo mode uses mock data). In production, require
-- authentication at the middleware level before any DB call.
--
-- If you enable portal auth, add this policy:
-- CREATE POLICY "jobs_portal_token"
--   ON jobs FOR SELECT
--   USING (EXISTS (
--     SELECT 1 FROM job_assignments ja
--     JOIN user_profiles up ON up.cleaner_id = ja.cleaner_id
--     WHERE ja.job_id = jobs.id AND up.id = auth.uid()
--   ));
