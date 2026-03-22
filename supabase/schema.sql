-- BeeLuxe Cleaners - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- ─────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- RECRUITMENT MODULE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE candidates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name        TEXT NOT NULL,
  phone            TEXT NOT NULL UNIQUE,
  email            TEXT,
  status           TEXT NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new','interviewing','evaluated','approved','rejected')),
  score            NUMERIC(4,1),
  ai_summary       TEXT,
  ai_recommendation TEXT CHECK (ai_recommendation IN ('hire','maybe','reject')),
  interview_transcript JSONB,
  source           TEXT,
  availability     TEXT,
  experience_years SMALLINT,
  notes            TEXT
);

CREATE TABLE interview_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('sms','voice','web')),
  messages     JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  score        NUMERIC(4,1)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CRM MODULE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name    TEXT,
  contact_name    TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  lead_type       TEXT NOT NULL
                    CHECK (lead_type IN ('construction_trailer','residential','commercial','industrial')),
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  site_address    TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  project_value   NUMERIC(12,2),
  next_follow_up  TIMESTAMPTZ,
  last_contacted  TIMESTAMPTZ,
  source          TEXT,
  notes           TEXT,
  aec_project_id          TEXT,
  trailer_count           SMALLINT,
  project_duration_months SMALLINT,
  cleaning_frequency      TEXT CHECK (cleaning_frequency IN ('daily','weekly','biweekly','monthly','custom')),
  assigned_to             UUID,
  tags                    TEXT[]
);

CREATE TABLE lead_activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_id       UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL
                  CHECK (activity_type IN ('call','email','sms','visit','note','status_change')),
  description   TEXT NOT NULL,
  performed_by  UUID
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name        TEXT,
  contact_name        TEXT NOT NULL,
  email               TEXT,
  phone               TEXT,
  billing_address     TEXT,
  client_type         TEXT NOT NULL CHECK (client_type IN ('construction','residential','commercial')),
  status              TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','inactive','prospect')),
  total_revenue       NUMERIC(14,2) NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC(14,2) NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────────────────────
-- OPERATIONS & SCHEDULING MODULE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE cleaners (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name         TEXT NOT NULL,
  phone             TEXT NOT NULL UNIQUE,
  email             TEXT,
  status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','inactive','on_leave')),
  hourly_rate       NUMERIC(8,2),
  skills            TEXT[],
  preferred_areas   TEXT[],
  candidate_id      UUID REFERENCES candidates(id),
  notification_pref TEXT NOT NULL DEFAULT 'sms'
                      CHECK (notification_pref IN ('sms','push','both'))
);

CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title           TEXT NOT NULL,
  client_id       UUID REFERENCES clients(id),
  lead_id         UUID REFERENCES leads(id),
  address         TEXT NOT NULL,
  city            TEXT,
  state           TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end   TIMESTAMPTZ NOT NULL,
  actual_start    TIMESTAMPTZ,
  actual_end      TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  job_type        TEXT NOT NULL
                    CHECK (job_type IN ('construction_trailer','residential','commercial','deep_clean','recurring')),
  price           NUMERIC(10,2) NOT NULL,
  notes           TEXT,
  recurrence      TEXT
);

CREATE TABLE job_assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  cleaner_id   UUID NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
  notified_at  TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'assigned'
                 CHECK (status IN ('assigned','confirmed','completed','no_show')),
  UNIQUE (job_id, cleaner_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- FINANCIAL MODULE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id      UUID NOT NULL REFERENCES clients(id),
  job_id         UUID REFERENCES jobs(id),
  amount         NUMERIC(10,2) NOT NULL,
  tax            NUMERIC(10,2) NOT NULL DEFAULT 0,
  total          NUMERIC(10,2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  issued_date    DATE NOT NULL,
  due_date       DATE NOT NULL,
  paid_date      DATE,
  notes          TEXT
);

CREATE TABLE contractor_payouts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cleaner_id   UUID NOT NULL REFERENCES cleaners(id),
  job_id       UUID NOT NULL REFERENCES jobs(id),
  hours_worked NUMERIC(6,2) NOT NULL,
  hourly_rate  NUMERIC(8,2) NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  bonus        NUMERIC(10,2) NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','paid')),
  paid_date    DATE,
  notes        TEXT
);

CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category    TEXT NOT NULL
                CHECK (category IN ('supplies','equipment','fuel','marketing','insurance','other')),
  description TEXT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  date        DATE NOT NULL,
  receipt_url TEXT,
  job_id      UUID REFERENCES jobs(id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS: auto-update updated_at
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['candidates','leads','clients','cleaners','jobs','invoices']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl, tbl);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (enable & configure)
-- ─────────────────────────────────────────────────────────────────────────────
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

-- Allow authenticated users full access (tighten per role in production)
DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'candidates','interview_sessions','leads','lead_activities',
    'clients','cleaners','jobs','job_assignments',
    'invoices','contractor_payouts','expenses'
  ] LOOP
    EXECUTE format('CREATE POLICY "%s_auth_all" ON %s FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SAMPLE SEED DATA
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO clients (company_name, contact_name, email, phone, client_type, status, total_revenue) VALUES
  ('Apex Construction LLC', 'Mike Torres', 'mike@apexconstruction.com', '555-0101', 'construction', 'active', 18500.00),
  ('Greenfield Homes', 'Sara Jenkins', 'sara@greenfieldh.com', '555-0102', 'residential', 'active', 4200.00),
  ('Metro Commercial Props', 'David Chang', 'david@metroprops.com', '555-0103', 'commercial', 'active', 9800.00);

INSERT INTO cleaners (full_name, phone, email, status, hourly_rate, skills) VALUES
  ('Maria Gonzalez', '555-1001', 'maria@example.com', 'active', 22.00, ARRAY['deep_clean','construction']),
  ('James Wright', '555-1002', 'james@example.com', 'active', 20.00, ARRAY['residential','commercial']),
  ('Aisha Patel', '555-1003', 'aisha@example.com', 'active', 22.00, ARRAY['construction','industrial']);
