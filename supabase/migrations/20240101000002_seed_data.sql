-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: 20240101000002_seed_data
-- Demo seed data for BeeLuxe Cleaners
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Clients ─────────────────────────────────────────────────────────────────
INSERT INTO clients (id, company_name, contact_name, email, phone, client_type, status, total_revenue, outstanding_balance) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Apex Construction LLC',   'Mike Torres',   'mike@apexconstruction.com', '555-0101', 'construction', 'active', 18500.00, 0),
  ('11111111-0000-0000-0000-000000000002', 'Greenfield Homes',        'Sara Jenkins',  'sara@greenfieldh.com',      '555-0102', 'residential',  'active',  4200.00, 420.00),
  ('11111111-0000-0000-0000-000000000003', 'Metro Commercial Props',  'David Chang',   'david@metroprops.com',      '555-0103', 'commercial',   'active',  9800.00, 980.00),
  ('11111111-0000-0000-0000-000000000004', 'Ridgeline Homes Dev',     'Carlos Vega',   'carlos@ridgeline.com',      '555-0104', 'construction', 'active',  7200.00, 0),
  ('11111111-0000-0000-0000-000000000005', 'Skyline Properties',      'Angela Reed',   'angela@skyline.com',        '555-0105', 'commercial',   'active',  3800.00, 1900.00);

-- ─── Cleaners ────────────────────────────────────────────────────────────────
INSERT INTO cleaners (id, full_name, phone, email, status, hourly_rate, skills, notification_pref) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Maria Gonzalez', '555-1001', 'maria@beeluxe.com', 'active', 22.00, ARRAY['deep_clean','construction','industrial'], 'both'),
  ('22222222-0000-0000-0000-000000000002', 'James Wright',   '555-1002', 'james@beeluxe.com', 'active', 20.00, ARRAY['residential','commercial'],             'sms'),
  ('22222222-0000-0000-0000-000000000003', 'Aisha Patel',    '555-1003', 'aisha@beeluxe.com', 'active', 22.00, ARRAY['construction','industrial','deep_clean'], 'sms'),
  ('22222222-0000-0000-0000-000000000004', 'Kevin Okafor',   '555-1004', 'kevin@beeluxe.com', 'active', 20.00, ARRAY['residential','commercial'],             'push'),
  ('22222222-0000-0000-0000-000000000005', 'Rosa Medina',    '555-1005', 'rosa@beeluxe.com',  'on_leave', 21.00, ARRAY['deep_clean','residential'],           'sms');

-- ─── Candidates ───────────────────────────────────────────────────────────────
INSERT INTO candidates (full_name, phone, email, status, score, ai_recommendation, ai_summary, experience_years, source) VALUES
  ('Darius Lee',   '555-2001', 'darius@mail.com', 'interviewing', NULL, NULL, NULL, 3, 'Indeed'),
  ('Rosa Medina',  '555-2002', 'rosa2@mail.com',  'evaluated', 91, 'hire',
   'Excellent communicator. 5 years commercial cleaning. Flexible schedule. Highly recommended.', 5, 'Referral'),
  ('Kevin Okafor', '555-2003', 'kevin2@mail.com', 'approved', 88, 'hire',
   'Strong construction site experience. Reliable with own transport. Green flag.', 4, 'ZipRecruiter'),
  ('Linda Park',   '555-2004', NULL,              'evaluated', 62, 'maybe',
   'Limited experience but showed genuine interest. Suggested 90-day probation.', 1, 'Craigslist'),
  ('Marcus Bell',  '555-2005', 'marcus@mail.com', 'rejected', 34, 'reject',
   'No-show for follow-up. Inconsistent answers on availability. Not recommended.', 0, 'Indeed'),
  ('Priya Sharma', '555-2006', 'priya@mail.com',  'new', NULL, NULL, NULL, 2, 'Referral');

-- ─── Leads ───────────────────────────────────────────────────────────────────
INSERT INTO leads (company_name, contact_name, phone, lead_type, status, site_address, city, state, project_value, next_follow_up, trailer_count, aec_project_id, notes) VALUES
  ('Apex Construction LLC', 'Mike Torres',   '555-0101', 'construction_trailer', 'new',       '1200 Industrial Blvd', 'Dallas',  'TX', 12000, NOW() + interval '3 days', 4, 'AEC-2024-0441', 'Large multi-phase project. 4 trailers on site.'),
  (NULL,                    'Sarah Chen',    '555-0201', 'residential',          'new',       '8802 Oak Lane',        'Plano',   'TX',   280, NOW() + interval '1 day',  NULL, NULL,           '3BR home, bi-weekly. Referred by Maria G.'),
  ('BuildRight Corp',       'Tom Hughes',    '555-0301', 'construction_trailer', 'contacted', '550 Commerce Park Dr', 'Irving',  'TX',  8400, NOW() + interval '4 days', 3, 'AEC-2024-0389', 'Need to schedule site visit.'),
  ('Skyline Properties',    'Angela Reed',   '555-0401', 'commercial',           'contacted', '100 Main St Ste 200',  'Dallas',  'TX',  5200, NOW() + interval '2 days', NULL, NULL,           'Office complex, 3 floors. Monthly contract possible.'),
  ('Ridgeline Homes Dev',   'Carlos Vega',   '555-0501', 'construction_trailer', 'qualified', '3300 Ridgeline Pkwy',  'Frisco',  'TX', 19200, NOW() + interval '6 days', 8, 'AEC-2024-0512', 'Largest pipeline deal. 8-trailer subdivision.'),
  (NULL,                    'James Park',    '555-0601', 'residential',          'qualified', '404 Elm Court',        'Richardson','TX', 180, NOW() + interval '3 days', NULL, NULL,           'Weekly cleaning, flexible schedule.'),
  ('Metro Office Mgmt',     'Linda Shaw',    '555-0701', 'commercial',           'proposal',  '700 Akard St',         'Dallas',  'TX',  7800, NULL,                      NULL, NULL,           'Proposal sent. Follow up if no response by week 2.'),
  ('Apex Construction LLC', 'Mike Torres',   '555-0101', 'construction_trailer', 'won',       '900 Industrial Blvd',  'Dallas',  'TX',  4800, NULL,                      2,    'AEC-2023-0388', 'Converted! Monthly recurring.');

-- ─── Jobs ─────────────────────────────────────────────────────────────────────
INSERT INTO jobs (id, title, client_id, address, city, state, scheduled_start, scheduled_end, status, job_type, price) VALUES
  ('33333333-0000-0000-0000-000000000001',
   'Apex Trailer #4 — Morning Clean',
   '11111111-0000-0000-0000-000000000001',
   '1200 Industrial Blvd', 'Dallas', 'TX',
   NOW()::date + interval '7 hours', NOW()::date + interval '10 hours',
   'scheduled', 'construction_trailer', 380.00),
  ('33333333-0000-0000-0000-000000000002',
   'Greenfield Home Deep Clean',
   '11111111-0000-0000-0000-000000000002',
   '405 Oak Lane', 'Plano', 'TX',
   NOW()::date + interval '10 hours 30 minutes', NOW()::date + interval '12 hours 30 minutes',
   'scheduled', 'residential', 220.00),
  ('33333333-0000-0000-0000-000000000003',
   'Metro Office Suite',
   '11111111-0000-0000-0000-000000000003',
   '800 Commerce St', 'Dallas', 'TX',
   NOW()::date + interval '14 hours', NOW()::date + interval '17 hours',
   'scheduled', 'commercial', 540.00);

-- ─── Job Assignments ──────────────────────────────────────────────────────────
INSERT INTO job_assignments (job_id, cleaner_id, status) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'confirmed'), -- Maria → Apex
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'assigned'),  -- James → Greenfield
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'assigned');  -- Aisha → Metro

-- ─── Invoices ─────────────────────────────────────────────────────────────────
INSERT INTO invoices (invoice_number, client_id, job_id, amount, tax, status, issued_date, due_date, paid_date) VALUES
  ('BL-0048', '11111111-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001',
   4200.00, 0, 'paid', CURRENT_DATE - 15, CURRENT_DATE - 1, CURRENT_DATE - 8),
  ('BL-0047', '11111111-0000-0000-0000-000000000003', NULL,
   1960.00, 0, 'overdue', CURRENT_DATE - 20, CURRENT_DATE - 5, NULL),
  ('BL-0046', '11111111-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002',
   840.00, 0, 'overdue', CURRENT_DATE - 22, CURRENT_DATE - 7, NULL),
  ('BL-0045', '11111111-0000-0000-0000-000000000004', NULL,
   2400.00, 0, 'paid', CURRENT_DATE - 25, CURRENT_DATE - 10, CURRENT_DATE - 12),
  ('BL-0044', '11111111-0000-0000-0000-000000000005', NULL,
   1900.00, 0, 'overdue', CURRENT_DATE - 27, CURRENT_DATE - 12, NULL),
  ('BL-0043', '11111111-0000-0000-0000-000000000002', NULL,
   520.00, 0, 'paid', CURRENT_DATE - 29, CURRENT_DATE - 14, CURRENT_DATE - 16);

-- ─── Contractor Payouts ───────────────────────────────────────────────────────
INSERT INTO contractor_payouts (cleaner_id, job_id, hours_worked, hourly_rate, bonus, status) VALUES
  ('22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 3.5, 22.00, 20.00, 'paid'),
  ('22222222-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', 4.0, 20.00,  0.00, 'approved'),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000003', 5.5, 22.00, 30.00, 'pending');

-- ─── Expenses ─────────────────────────────────────────────────────────────────
INSERT INTO expenses (category, description, amount, date) VALUES
  ('supplies',   'Cleaning chemicals — bulk order',  480.00, CURRENT_DATE - 5),
  ('fuel',       'Fleet fuel reimbursements',         320.00, CURRENT_DATE - 3),
  ('marketing',  'Google Ads — construction leads',   840.00, CURRENT_DATE - 10),
  ('insurance',  'Monthly liability premium',         500.00, CURRENT_DATE - 1);
