-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: 20260324000000_indexes_and_constraints
-- BeeLuxe Cleaners — Performance indexes, missing constraints, schema hardening
--
-- Performance context:
--   At 10 leads → full-seq scans are fine.
--   At 1 000 leads / 10 000 jobs you WILL feel missing indexes on every page load.
--   These additions keep query time < 5 ms even at 100 k rows.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Fix job_type CHECK on jobs ─────────────────────────────────────────────
-- The original schema was missing 'airbnb' and 'move_in_out' (added in Sprint 3).
-- Drop the old constraint and add the full set.
ALTER TABLE jobs
  DROP CONSTRAINT IF EXISTS jobs_job_type_check;

ALTER TABLE jobs
  ADD CONSTRAINT jobs_job_type_check
    CHECK (job_type IN (
      'construction_trailer',
      'residential',
      'commercial',
      'deep_clean',
      'airbnb',
      'move_in_out',
      'recurring'
    ));

-- ── 2. leads — high-cardinality query columns ─────────────────────────────────

-- Houston metro filtering: WHERE city = 'Houston' OR city ILIKE '%Katy%' etc.
CREATE INDEX IF NOT EXISTS idx_leads_city
  ON leads(city);

-- Lead-source growth analytics: GROUP BY source
CREATE INDEX IF NOT EXISTS idx_leads_source
  ON leads(source)
  WHERE source IS NOT NULL;

-- Most-recent-first default sort
CREATE INDEX IF NOT EXISTS idx_leads_created_at_desc
  ON leads(created_at DESC);

-- Array containment queries: WHERE 'houston' = ANY(tags)
CREATE INDEX IF NOT EXISTS idx_leads_tags_gin
  ON leads USING GIN (tags);

-- Fuzzy full-text search: company_name % 'apex' (pg_trgm)
-- Requires: CREATE EXTENSION pg_trgm  (already in 20240101000000_initial_schema.sql)
CREATE INDEX IF NOT EXISTS idx_leads_company_trgm
  ON leads USING GIN (company_name gin_trgm_ops)
  WHERE company_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_contact_trgm
  ON leads USING GIN (contact_name gin_trgm_ops);

-- ── 3. candidates — recruitment analytics ────────────────────────────────────

-- Auto-vetting: WHERE score >= 78 ORDER BY score DESC
CREATE INDEX IF NOT EXISTS idx_candidates_score
  ON candidates(score DESC)
  WHERE score IS NOT NULL;

-- Recent applicants dashboard
CREATE INDEX IF NOT EXISTS idx_candidates_created_at_desc
  ON candidates(created_at DESC);

-- AI recommendation filter: WHERE ai_recommendation = 'hire'
CREATE INDEX IF NOT EXISTS idx_candidates_recommendation
  ON candidates(ai_recommendation)
  WHERE ai_recommendation IS NOT NULL;

-- ── 4. jobs — scheduling & conflict-detection ─────────────────────────────────

-- The overlap query is:
--   SELECT j.* FROM jobs j
--   JOIN job_assignments ja ON ja.job_id = j.id
--   WHERE ja.cleaner_id = $1
--     AND j.status NOT IN ('cancelled','completed')
--     AND j.scheduled_start < $proposed_end
--     AND j.scheduled_end   > $proposed_start
--
-- Composite index covers the range scan on both columns together.
CREATE INDEX IF NOT EXISTS idx_jobs_start_end
  ON jobs(scheduled_start, scheduled_end)
  WHERE status NOT IN ('cancelled', 'completed');

-- Calendar dashboard: jobs in a date range, ordered by start
-- (idx_jobs_scheduled_start already exists; this partial variant is faster for
--  the common case of only future/active jobs)
CREATE INDEX IF NOT EXISTS idx_jobs_start_active
  ON jobs(scheduled_start)
  WHERE status IN ('scheduled', 'in_progress');

-- Revenue reports: GROUP BY job_type for the financial dashboard
-- (idx_jobs_type already exists — keep it)

-- BRIN index for append-only created_at column (very cheap, great for time series)
CREATE INDEX IF NOT EXISTS idx_jobs_created_at_brin
  ON jobs USING BRIN (created_at);

-- ── 5. job_assignments — conflict detection join ──────────────────────────────

-- The conflict check joins job_assignments → jobs.
-- We need fast lookup of a cleaner's non-terminal assignments.
CREATE INDEX IF NOT EXISTS idx_job_assignments_cleaner_active
  ON job_assignments(cleaner_id, job_id)
  WHERE status IN ('assigned', 'confirmed');

-- ── 6. invoices — finance dashboard ──────────────────────────────────────────

-- Outstanding invoices view: WHERE status = 'overdue' ORDER BY due_date
-- (idx_invoices_due already partial — add a plain due_date index for the
--  finance dashboard's full view)
CREATE INDEX IF NOT EXISTS idx_invoices_due_all
  ON invoices(due_date DESC);

-- Aggregate by client for the client ledger
-- (idx_invoices_client already exists)

-- ── 7. contractor_payouts — payroll view ─────────────────────────────────────

-- Month-end payroll: WHERE status = 'pending' OR 'approved', ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_payouts_pending
  ON contractor_payouts(created_at DESC)
  WHERE status IN ('pending', 'approved');

-- ── 8. expenses — P&L calculations ───────────────────────────────────────────

-- Monthly expense rollup: WHERE date BETWEEN $start AND $end
-- (idx_expenses_date already exists — nothing extra needed)

-- ── 9. Statistics helper: track query performance ────────────────────────────
-- Uncomment in production to log slow queries (> 100 ms):
-- ALTER SYSTEM SET log_min_duration_statement = '100';
-- SELECT pg_reload_conf();

-- ── 10. Comment all new indexes for future maintainers ───────────────────────
COMMENT ON INDEX idx_leads_city
  IS 'Filters leads by Houston-metro city; used in TrailerDashboard';
COMMENT ON INDEX idx_leads_tags_gin
  IS 'GIN array index for tag-based lead filtering';
COMMENT ON INDEX idx_leads_company_trgm
  IS 'pg_trgm fuzzy search on company names in Outreach Generator';
COMMENT ON INDEX idx_candidates_score
  IS 'Descending score for auto-vetting (score >= 78) in CandidateTable';
COMMENT ON INDEX idx_jobs_start_end
  IS 'Composite index for scheduling conflict-overlap queries';
COMMENT ON INDEX idx_job_assignments_cleaner_active
  IS 'Fast cleaner→active-job lookup for double-booking detection';
