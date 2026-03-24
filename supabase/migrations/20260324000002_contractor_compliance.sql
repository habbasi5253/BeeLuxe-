-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: 20260324000002_contractor_compliance
-- BeeLuxe Cleaners — Contractor vs Employee compliance fields
--
-- LEGAL CONTEXT (Texas / US):
--   1099 Independent Contractor (most BeeLuxe cleaners):
--     - No payroll taxes withheld by BeeLuxe
--     - Cleaner responsible for self-employment tax (~15.3%)
--     - IRS Form 1099-NEC issued if paid ≥ $600/year
--     - No minimum wage / overtime obligation under FLSA
--     - No workers' comp requirement (Texas is the only at-will opt-out state)
--     - BeeLuxe CANNOT direct the method of work (only the result)
--
--   W-2 Employee (if BeeLuxe hires directly):
--     - Payroll taxes withheld (FICA, Medicare, federal/state income tax)
--     - Subject to FLSA overtime (>40h/week at 1.5x)
--     - Texas Workforce Commission UI taxes apply
--     - Workers' comp recommended (not required in TX but common)
--     - IRS Form W-2 issued
--
-- MISCLASSIFICATION RISK:
--   Classifying a de-facto employee as a contractor is the #1 labor law risk
--   for cleaning businesses. The financial ledger MUST clearly segregate the
--   two categories for tax reporting and audit defence.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Add employment type to cleaners ───────────────────────────────────────

ALTER TABLE cleaners
  ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT '1099_contractor'
    CHECK (employment_type IN ('1099_contractor', 'w2_employee')),
  ADD COLUMN IF NOT EXISTS tax_id_collected  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS w9_on_file        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS i9_on_file        BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN cleaners.employment_type IS
  '1099_contractor: independent contractor (default for BeeLuxe). '
  'w2_employee: direct employee. Determines payroll tax treatment and form type.';

COMMENT ON COLUMN cleaners.tax_id_collected IS
  'TRUE once SSN/EIN has been collected for IRS 1099-NEC or W-2 filing.';

COMMENT ON COLUMN cleaners.w9_on_file IS
  'TRUE once a signed W-9 has been collected for 1099 contractors.';

COMMENT ON COLUMN cleaners.i9_on_file IS
  'TRUE once Form I-9 (employment eligibility verification) is on file.';

-- ── 2. Add tax form type to contractor_payouts ───────────────────────────────

ALTER TABLE contractor_payouts
  ADD COLUMN IF NOT EXISTS tax_form TEXT
    CHECK (tax_form IN ('1099_nec', 'w2', NULL)),
  ADD COLUMN IF NOT EXISTS ytd_total NUMERIC(12,2) GENERATED ALWAYS AS (
    -- Placeholder — in production compute this with a window function or trigger.
    -- The column signals intent; update the generated expression for your DB version.
    amount + bonus
  ) STORED;

COMMENT ON COLUMN contractor_payouts.tax_form IS
  '1099_nec for independent contractors (≥$600/yr triggers reporting). '
  'w2 for direct employees. NULL until employment type confirmed.';

-- ── 3. Yearly 1099 threshold view ─────────────────────────────────────────────
-- Use this view at year-end to identify which contractors need a 1099-NEC.
-- IRS threshold: $600 cumulative in a calendar year.

CREATE OR REPLACE VIEW v_1099_candidates AS
SELECT
  c.id           AS cleaner_id,
  c.full_name,
  c.phone,
  c.employment_type,
  c.w9_on_file,
  c.tax_id_collected,
  EXTRACT(YEAR FROM cp.created_at)::INT   AS tax_year,
  SUM(cp.amount + cp.bonus)               AS total_paid,
  COUNT(*)                                AS job_count,
  CASE
    WHEN SUM(cp.amount + cp.bonus) >= 600 AND c.employment_type = '1099_contractor'
      THEN TRUE
    ELSE FALSE
  END AS requires_1099_nec
FROM contractor_payouts cp
JOIN cleaners c ON c.id = cp.cleaner_id
WHERE cp.status = 'paid'
GROUP BY c.id, c.full_name, c.phone, c.employment_type, c.w9_on_file,
         c.tax_id_collected, EXTRACT(YEAR FROM cp.created_at)
ORDER BY tax_year DESC, total_paid DESC;

COMMENT ON VIEW v_1099_candidates IS
  'Year-end 1099-NEC filing list. Filter WHERE requires_1099_nec = TRUE. '
  'Verify w9_on_file = TRUE before filing.';

-- ── 4. Separate financial reporting view ──────────────────────────────────────
-- The dashboard shows "contractor payouts" as a single line item.
-- This view separates the two categories for accurate P&L and tax prep.

CREATE OR REPLACE VIEW v_payroll_by_type AS
SELECT
  c.employment_type,
  DATE_TRUNC('month', cp.created_at)      AS pay_month,
  COUNT(DISTINCT c.id)                    AS headcount,
  COUNT(*)                                AS job_count,
  SUM(cp.amount)                          AS gross_labor,
  SUM(cp.bonus)                           AS bonuses,
  SUM(cp.amount + cp.bonus)               AS total_cost,
  CASE c.employment_type
    WHEN '1099_contractor' THEN 0          -- BeeLuxe pays no payroll tax
    WHEN 'w2_employee'     THEN
      ROUND(SUM(cp.amount + cp.bonus) * 0.0765, 2)  -- employer FICA ~7.65%
  END AS estimated_payroll_tax
FROM contractor_payouts cp
JOIN cleaners c ON c.id = cp.cleaner_id
GROUP BY c.employment_type, DATE_TRUNC('month', cp.created_at)
ORDER BY pay_month DESC, employment_type;

COMMENT ON VIEW v_payroll_by_type IS
  'P&L labor cost split by employment type. '
  'W-2 rows include estimated employer FICA (7.65%) for accurate expense reporting.';

-- ── 5. Index for year-end tax queries ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_cleaners_employment_type
  ON cleaners(employment_type);

CREATE INDEX IF NOT EXISTS idx_payouts_cleaner_year
  ON contractor_payouts(cleaner_id, EXTRACT(YEAR FROM created_at));

-- ── 6. Compliance checklist function ─────────────────────────────────────────
-- Returns cleaners who are missing compliance documents.

CREATE OR REPLACE FUNCTION public.compliance_gaps()
RETURNS TABLE (
  cleaner_id    UUID,
  full_name     TEXT,
  employment_type TEXT,
  missing       TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    full_name,
    employment_type,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN NOT tax_id_collected THEN 'SSN/EIN not collected' END,
      CASE WHEN employment_type = '1099_contractor' AND NOT w9_on_file THEN 'W-9 not on file' END,
      CASE WHEN employment_type = 'w2_employee'     AND NOT i9_on_file THEN 'I-9 not on file' END
    ], NULL) AS missing
  FROM cleaners
  WHERE status = 'active'
    AND (NOT tax_id_collected
      OR (employment_type = '1099_contractor' AND NOT w9_on_file)
      OR (employment_type = 'w2_employee'     AND NOT i9_on_file))
  ORDER BY full_name
$$;

COMMENT ON FUNCTION public.compliance_gaps() IS
  'Returns active cleaners with incomplete compliance documentation. '
  'Run before year-end tax filing. Output: cleaner_id, name, type, missing docs.';
