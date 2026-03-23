// ── Shared financial data layer ───────────────────────────────────────────

export type LeadSource = 'linkedin' | 'site_visit' | 'cold_email' | 'referral' | 'google' | 'direct'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface CompletedJob {
  id: string
  job_type: 'construction_trailer' | 'commercial' | 'residential' | 'deep_clean' | 'airbnb' | 'move_in_out' | 'recurring'
  description: string
  client_name: string
  client_company: string
  address: string
  city: string
  completed_date: string    // ISO
  hours: number
  gross_revenue: number     // what client pays
  contractor_payout: number // what cleaner gets
  cleaner_name: string
  lead_source: LeadSource
  invoice_id: string | null
}

export interface InvoiceRecord {
  id: string
  invoice_number: string
  client_company: string
  client_contact: string
  client_address: string
  client_city: string
  issued_date: string
  due_date: string
  job_ids: string[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  status: InvoiceStatus
  paid_date: string | null
  notes: string
}

export interface LeadSourceMetric {
  source: LeadSource
  label: string
  color: string
  total_leads: number
  converted: number
  total_revenue: number
  avg_contract_value: number
  avg_margin_pct: number
  total_jobs: number
}

// ── Completed jobs (source of truth for invoicing) ────────────────────────
export const COMPLETED_JOBS: CompletedJob[] = [
  {
    id: 'j001', job_type: 'construction_trailer', description: 'Apex Trailer Site A — Full Clean',
    client_name: 'Brad Holloway', client_company: 'Apex Construction LLC',
    address: '1200 Industrial Blvd', city: 'Houston',
    completed_date: '2026-01-06', hours: 3.5, gross_revenue: 420, contractor_payout: 147,
    cleaner_name: 'Maria Gonzalez', lead_source: 'site_visit', invoice_id: 'inv001',
  },
  {
    id: 'j002', job_type: 'construction_trailer', description: 'Apex Trailer Site B — Full Clean',
    client_name: 'Brad Holloway', client_company: 'Apex Construction LLC',
    address: '1220 Industrial Blvd', city: 'Houston',
    completed_date: '2026-01-13', hours: 3.0, gross_revenue: 380, contractor_payout: 133,
    cleaner_name: 'Maria Gonzalez', lead_source: 'site_visit', invoice_id: 'inv001',
  },
  {
    id: 'j003', job_type: 'construction_trailer', description: 'Apex Trailer Site C — Full Clean',
    client_name: 'Brad Holloway', client_company: 'Apex Construction LLC',
    address: '1240 Industrial Blvd', city: 'Houston',
    completed_date: '2026-01-20', hours: 4.0, gross_revenue: 460, contractor_payout: 161,
    cleaner_name: 'Kevin Okafor', lead_source: 'site_visit', invoice_id: null,
  },
  {
    id: 'j004', job_type: 'construction_trailer', description: 'BuildRight Trailer #1 — Weekly Clean',
    client_name: 'Tara Simmons', client_company: 'BuildRight Development',
    address: '550 Commerce Park Dr', city: 'Houston',
    completed_date: '2026-01-07', hours: 3.0, gross_revenue: 360, contractor_payout: 126,
    cleaner_name: 'Maria Gonzalez', lead_source: 'linkedin', invoice_id: 'inv002',
  },
  {
    id: 'j005', job_type: 'construction_trailer', description: 'BuildRight Trailer #2 — Weekly Clean',
    client_name: 'Tara Simmons', client_company: 'BuildRight Development',
    address: '550 Commerce Park Dr', city: 'Houston',
    completed_date: '2026-01-14', hours: 3.0, gross_revenue: 360, contractor_payout: 126,
    cleaner_name: 'Maria Gonzalez', lead_source: 'linkedin', invoice_id: null,
  },
  {
    id: 'j006', job_type: 'construction_trailer', description: 'Ridgeline Site Office — Deep Clean',
    client_name: 'Marcus Webb', client_company: 'Ridgeline Homes Dev',
    address: '800 Ridgeline Pkwy', city: 'Katy',
    completed_date: '2026-01-09', hours: 5.0, gross_revenue: 580, contractor_payout: 203,
    cleaner_name: 'Aisha Patel', lead_source: 'cold_email', invoice_id: 'inv003',
  },
  {
    id: 'j007', job_type: 'commercial', description: 'Metro Office Suite — Monthly Clean',
    client_name: 'Lisa Chang', client_company: 'Metro Commercial Props',
    address: '800 Commerce St', city: 'Houston',
    completed_date: '2026-01-05', hours: 5.5, gross_revenue: 540, contractor_payout: 189,
    cleaner_name: 'Aisha Patel', lead_source: 'google', invoice_id: 'inv004',
  },
  {
    id: 'j008', job_type: 'commercial', description: 'Metro Office Suite — Bi-Weekly',
    client_name: 'Lisa Chang', client_company: 'Metro Commercial Props',
    address: '800 Commerce St', city: 'Houston',
    completed_date: '2026-01-19', hours: 4.5, gross_revenue: 440, contractor_payout: 154,
    cleaner_name: 'James Wright', lead_source: 'google', invoice_id: null,
  },
  {
    id: 'j009', job_type: 'residential', description: 'Greenfield Home — Deep Clean',
    client_name: 'Sarah & Tom Green', client_company: 'Greenfield Homes',
    address: '405 Oak Lane', city: 'Katy',
    completed_date: '2026-01-03', hours: 4.0, gross_revenue: 280, contractor_payout: 112,
    cleaner_name: 'James Wright', lead_source: 'referral', invoice_id: 'inv005',
  },
  {
    id: 'j010', job_type: 'airbnb', description: 'Airbnb Turnover — Memorial Listing',
    client_name: 'Chris Park', client_company: 'Various Residential',
    address: '312 Memorial Dr', city: 'Houston',
    completed_date: '2026-01-10', hours: 2.5, gross_revenue: 195, contractor_payout: 78,
    cleaner_name: 'Rosa Medina', lead_source: 'direct', invoice_id: null,
  },
  {
    id: 'j011', job_type: 'construction_trailer', description: 'Apex Trailer Site D — Emergency Clean',
    client_name: 'Brad Holloway', client_company: 'Apex Construction LLC',
    address: '1300 Industrial Blvd', city: 'Houston',
    completed_date: '2026-01-22', hours: 3.5, gross_revenue: 450, contractor_payout: 158,
    cleaner_name: 'Kevin Okafor', lead_source: 'site_visit', invoice_id: null,
  },
  {
    id: 'j012', job_type: 'construction_trailer', description: 'BuildRight Trailer #3 — Bi-Weekly',
    client_name: 'Tara Simmons', client_company: 'BuildRight Development',
    address: '560 Commerce Park Dr', city: 'Houston',
    completed_date: '2026-01-21', hours: 3.0, gross_revenue: 360, contractor_payout: 126,
    cleaner_name: 'Maria Gonzalez', lead_source: 'linkedin', invoice_id: null,
  },
  {
    id: 'j013', job_type: 'move_in_out', description: 'Sunrise Apt Move-Out Clean',
    client_name: 'Devon Carter', client_company: 'Various Residential',
    address: '222 Riverside Dr', city: 'Houston',
    completed_date: '2026-01-15', hours: 5.0, gross_revenue: 380, contractor_payout: 152,
    cleaner_name: 'Rosa Medina', lead_source: 'google', invoice_id: null,
  },
]

// ── Invoice records ───────────────────────────────────────────────────────
export const INVOICE_RECORDS: InvoiceRecord[] = [
  {
    id: 'inv001', invoice_number: 'BL-0048',
    client_company: 'Apex Construction LLC', client_contact: 'Brad Holloway',
    client_address: '4200 Main St, Suite 100', client_city: 'Houston, TX 77002',
    issued_date: '2026-01-23', due_date: '2026-02-06',
    job_ids: ['j001', 'j002'],
    subtotal: 800, tax_rate: 0, tax_amount: 0, total: 800,
    status: 'paid', paid_date: '2026-01-30',
    notes: 'Net 14 days. Thank you for your continued business.',
  },
  {
    id: 'inv002', invoice_number: 'BL-0047',
    client_company: 'BuildRight Development', client_contact: 'Tara Simmons',
    client_address: '700 Commerce Park Dr, Suite 210', client_city: 'Houston, TX 77084',
    issued_date: '2026-01-15', due_date: '2026-01-29',
    job_ids: ['j004'],
    subtotal: 360, tax_rate: 0, tax_amount: 0, total: 360,
    status: 'overdue', paid_date: null,
    notes: 'Net 14 days.',
  },
  {
    id: 'inv003', invoice_number: 'BL-0046',
    client_company: 'Ridgeline Homes Dev', client_contact: 'Marcus Webb',
    client_address: '8000 Ridgeline Pkwy, Suite 305', client_city: 'Katy, TX 77450',
    issued_date: '2026-01-12', due_date: '2026-01-26',
    job_ids: ['j006'],
    subtotal: 580, tax_rate: 0, tax_amount: 0, total: 580,
    status: 'paid', paid_date: '2026-01-24',
    notes: 'Net 14 days.',
  },
  {
    id: 'inv004', invoice_number: 'BL-0045',
    client_company: 'Metro Commercial Props', client_contact: 'Lisa Chang',
    client_address: '1000 Commerce St, Floor 12', client_city: 'Houston, TX 77002',
    issued_date: '2026-01-08', due_date: '2026-01-22',
    job_ids: ['j007'],
    subtotal: 540, tax_rate: 0, tax_amount: 0, total: 540,
    status: 'overdue', paid_date: null,
    notes: 'Net 14 days.',
  },
  {
    id: 'inv005', invoice_number: 'BL-0044',
    client_company: 'Greenfield Homes', client_contact: 'Sarah & Tom Green',
    client_address: '405 Oak Lane', client_city: 'Katy, TX 77450',
    issued_date: '2026-01-05', due_date: '2026-01-19',
    job_ids: ['j009'],
    subtotal: 280, tax_rate: 0, tax_amount: 0, total: 280,
    status: 'paid', paid_date: '2026-01-17',
    notes: 'Thank you!',
  },
]

// ── Lead source analytics ─────────────────────────────────────────────────
export const LEAD_SOURCE_METRICS: LeadSourceMetric[] = [
  {
    source: 'site_visit', label: 'Site Visits', color: '#f97316',
    total_leads: 8, converted: 6,
    total_revenue: 22400, avg_contract_value: 3733, avg_margin_pct: 65, total_jobs: 42,
  },
  {
    source: 'linkedin', label: 'LinkedIn', color: '#0077b5',
    total_leads: 12, converted: 5,
    total_revenue: 14400, avg_contract_value: 2880, avg_margin_pct: 65, total_jobs: 28,
  },
  {
    source: 'cold_email', label: 'Cold Email', color: '#8b5cf6',
    total_leads: 25, converted: 4,
    total_revenue: 9800, avg_contract_value: 2450, avg_margin_pct: 65, total_jobs: 18,
  },
  {
    source: 'google', label: 'Google / SEO', color: '#4285f4',
    total_leads: 18, converted: 6,
    total_revenue: 7620, avg_contract_value: 1270, avg_margin_pct: 60, total_jobs: 24,
  },
  {
    source: 'referral', label: 'Referral', color: '#10b981',
    total_leads: 6, converted: 5,
    total_revenue: 6400, avg_contract_value: 1280, avg_margin_pct: 58, total_jobs: 19,
  },
  {
    source: 'direct', label: 'Direct / Walk-in', color: '#94a3b8',
    total_leads: 9, converted: 4,
    total_revenue: 3200, avg_contract_value: 800, avg_margin_pct: 60, total_jobs: 16,
  },
]

// ── Monthly trend (for analytics chart) ──────────────────────────────────
export const MONTHLY_BY_SOURCE = [
  { month: 'Aug', site_visit: 4200, linkedin: 2800, cold_email: 1200, google: 1100, referral: 900, direct: 600 },
  { month: 'Sep', site_visit: 5100, linkedin: 3100, cold_email: 1400, google: 1300, referral: 1100, direct: 700 },
  { month: 'Oct', site_visit: 4800, linkedin: 2600, cold_email: 1600, google: 1200, referral: 900, direct: 550 },
  { month: 'Nov', site_visit: 6200, linkedin: 3500, cold_email: 2000, google: 1500, referral: 1200, direct: 800 },
  { month: 'Dec', site_visit: 7400, linkedin: 3800, cold_email: 2400, google: 1800, referral: 1400, direct: 900 },
  { month: 'Jan', site_visit: 9200, linkedin: 4400, cold_email: 2800, google: 2000, referral: 1600, direct: 1000 },
]

// ── Helpers ───────────────────────────────────────────────────────────────
export function nextInvoiceNumber(existing: InvoiceRecord[]): string {
  const nums = existing.map((i) => parseInt(i.invoice_number.replace('BL-', ''), 10))
  const next = Math.max(...nums, 48) + 1
  return `BL-${String(next).padStart(4, '0')}`
}

export function fmtCurrency(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
