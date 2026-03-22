-- Sprint 1: Add construction trailer-specific fields to leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS project_duration_months SMALLINT,
  ADD COLUMN IF NOT EXISTS cleaning_frequency TEXT
    CHECK (cleaning_frequency IN ('daily','weekly','biweekly','monthly','custom'));
