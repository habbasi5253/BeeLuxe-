-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: 20240101000000_initial_schema
-- BeeLuxe Cleaners — Full database schema
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search on names/addresses

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULE 1: AI RECRUITMENT
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE candidates (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name            TEXT        NOT NULL,
  phone                TEXT        NOT NULL UNIQUE,
  email                TEXT,
  status               TEXT        NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new','interviewing','evaluated','approved','rejected')),
  score                NUMERIC(4,1) CHECK (score >= 0 AND score <= 100),
  ai_summary           TEXT,
  ai_recommendation    TEXT        CHECK (ai_recommendation IN ('hire','maybe','reject')),
  interview_transcript JSONB,
  source               TEXT,
  availability         TEXT,
  experience_years     SMALLINT    CHECK (experience_years >= 0),
  notes                TEXT
);

CREATE INDEX idx_candidates_status  ON candidates(status);
CREATE INDEX idx_candidates_phone   ON candidates(phone);

CREATE TABLE interview_sessions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  candidate_id UUID        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  session_type TEXT        NOT NULL CHECK (session_type IN ('sms','voice','web')),
  messages     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  score        NUMERIC(4,1) CHECK (score >= 0 AND score <= 100)
);

CREATE INDEX idx_interview_sessions_candidate ON interview_sessions(candidate_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULE 2: CRM
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE leads (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name    TEXT,
  contact_name    TEXT        NOT NULL,
  email           TEXT,
  phone           TEXT,
  lead_type       TEXT        NOT NULL
                    CHECK (lead_type IN ('construction_trailer','residential','commercial','industrial')),
  status          TEXT        NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  site_address    TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  project_value   NUMERIC(12,2) CHECK (project_value >= 0),
  next_follow_up  TIMESTAMPTZ,
  last_contacted  TIMESTAMPTZ,
  source          TEXT,
  notes           TEXT,
  aec_project_id  TEXT,            -- AEC industry project reference
  trailer_count   SMALLINT    CHECK (trailer_count > 0),
  assigned_to     UUID,            -- FK to auth.users in production
  tags            TEXT[]
);

CREATE INDEX idx_leads_status    ON leads(status);
CREATE INDEX idx_leads_type      ON leads(lead_type);
CREATE INDEX idx_leads_follow_up ON leads(next_follow_up) WHERE next_follow_up IS NOT NULL;
CREATE INDEX idx_leads_aec       ON leads(aec_project_id) WHERE aec_project_id IS NOT NULL;

CREATE TABLE lead_activities (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_id       UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT        NOT NULL
                  CHECK (activity_type IN ('call','email','sms','visit','note','status_change')),
  description   TEXT        NOT NULL,
  performed_by  UUID
);

CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CLIENTS (shared by scheduling + finance)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name        TEXT,
  contact_name        TEXT        NOT NULL,
  email               TEXT,
  phone               TEXT,
  billing_address     TEXT,
  client_type         TEXT        NOT NULL CHECK (client_type IN ('construction','residential','commercial')),
  status              TEXT        NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','inactive','prospect')),
  total_revenue       NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_revenue >= 0),
  outstanding_balance NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_type   ON clients(client_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULE 3: OPERATIONS & SCHEDULING
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE cleaners (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name         TEXT        NOT NULL,
  phone             TEXT        NOT NULL UNIQUE,
  email             TEXT,
  status            TEXT        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','inactive','on_leave')),
  hourly_rate       NUMERIC(8,2) CHECK (hourly_rate > 0),
  skills            TEXT[],
  preferred_areas   TEXT[],
  candidate_id      UUID        REFERENCES candidates(id) ON DELETE SET NULL,
  notification_pref TEXT        NOT NULL DEFAULT 'sms'
                      CHECK (notification_pref IN ('sms','push','both'))
);

CREATE INDEX idx_cleaners_status ON cleaners(status);

CREATE TABLE jobs (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title           TEXT        NOT NULL,
  client_id       UUID        REFERENCES clients(id) ON DELETE SET NULL,
  lead_id         UUID        REFERENCES leads(id)   ON DELETE SET NULL,
  address         TEXT        NOT NULL,
  city            TEXT,
  state           TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end   TIMESTAMPTZ NOT NULL CHECK (scheduled_end > scheduled_start),
  actual_start    TIMESTAMPTZ,
  actual_end      TIMESTAMPTZ,
  status          TEXT        NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  job_type        TEXT        NOT NULL
                    CHECK (job_type IN ('construction_trailer','residential','commercial','deep_clean','recurring')),
  price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  notes           TEXT,
  recurrence      TEXT         -- e.g. 'weekly', 'biweekly', RRULE string
);

CREATE INDEX idx_jobs_status          ON jobs(status);
CREATE INDEX idx_jobs_scheduled_start ON jobs(scheduled_start);
CREATE INDEX idx_jobs_client          ON jobs(client_id);
CREATE INDEX idx_jobs_type            ON jobs(job_type);

CREATE TABLE job_assignments (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  job_id       UUID        NOT NULL REFERENCES jobs(id)     ON DELETE CASCADE,
  cleaner_id   UUID        NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
  notified_at  TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  status       TEXT        NOT NULL DEFAULT 'assigned'
                 CHECK (status IN ('assigned','confirmed','completed','no_show')),
  UNIQUE (job_id, cleaner_id)
);

CREATE INDEX idx_job_assignments_cleaner ON job_assignments(cleaner_id);
CREATE INDEX idx_job_assignments_job     ON job_assignments(job_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULE 4: FINANCIAL INTELLIGENCE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE invoices (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoice_number TEXT        NOT NULL UNIQUE,
  client_id      UUID        NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  job_id         UUID        REFERENCES jobs(id) ON DELETE SET NULL,
  amount         NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  tax            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total          NUMERIC(10,2) NOT NULL GENERATED ALWAYS AS (amount + tax) STORED,
  status         TEXT        NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  issued_date    DATE        NOT NULL,
  due_date       DATE        NOT NULL CHECK (due_date >= issued_date),
  paid_date      DATE,
  notes          TEXT,
  CONSTRAINT chk_paid_date CHECK (paid_date IS NULL OR status = 'paid')
);

CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due    ON invoices(due_date) WHERE status NOT IN ('paid','cancelled');

CREATE TABLE contractor_payouts (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cleaner_id   UUID        NOT NULL REFERENCES cleaners(id) ON DELETE RESTRICT,
  job_id       UUID        NOT NULL REFERENCES jobs(id)     ON DELETE RESTRICT,
  hours_worked NUMERIC(6,2) NOT NULL CHECK (hours_worked > 0),
  hourly_rate  NUMERIC(8,2) NOT NULL CHECK (hourly_rate > 0),
  amount       NUMERIC(10,2) NOT NULL GENERATED ALWAYS AS (hours_worked * hourly_rate) STORED,
  bonus        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (bonus >= 0),
  status       TEXT        NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','paid')),
  paid_date    DATE,
  notes        TEXT,
  UNIQUE (cleaner_id, job_id)
);

CREATE INDEX idx_payouts_cleaner ON contractor_payouts(cleaner_id);
CREATE INDEX idx_payouts_status  ON contractor_payouts(status);

CREATE TABLE expenses (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category    TEXT        NOT NULL
                CHECK (category IN ('supplies','equipment','fuel','marketing','insurance','other')),
  description TEXT        NOT NULL,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  date        DATE        NOT NULL,
  receipt_url TEXT,
  job_id      UUID        REFERENCES jobs(id) ON DELETE SET NULL
);

CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date     ON expenses(date);
