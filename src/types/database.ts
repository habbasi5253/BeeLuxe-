export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Candidate ────────────────────────────────────────────────────────────────
export interface CandidateRow {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  phone: string
  email: string | null
  status: 'new' | 'interviewing' | 'evaluated' | 'approved' | 'rejected'
  score: number | null
  ai_summary: string | null
  ai_recommendation: 'hire' | 'maybe' | 'reject' | null
  interview_transcript: Json | null
  source: string | null
  availability: string | null
  experience_years: number | null
  notes: string | null
}
export interface CandidateInsert {
  full_name: string
  phone: string
  email?: string | null
  status?: 'new' | 'interviewing' | 'evaluated' | 'approved' | 'rejected'
  score?: number | null
  ai_summary?: string | null
  ai_recommendation?: 'hire' | 'maybe' | 'reject' | null
  interview_transcript?: Json | null
  source?: string | null
  availability?: string | null
  experience_years?: number | null
  notes?: string | null
}

// ── InterviewSession ──────────────────────────────────────────────────────────
export interface InterviewSessionRow {
  id: string
  created_at: string
  candidate_id: string
  session_type: 'sms' | 'voice' | 'web'
  messages: Json
  completed_at: string | null
  score: number | null
}
export interface InterviewSessionInsert {
  candidate_id: string
  session_type: 'sms' | 'voice' | 'web'
  messages?: Json
  completed_at?: string | null
  score?: number | null
}

// ── Lead ─────────────────────────────────────────────────────────────────────
export interface LeadRow {
  id: string
  created_at: string
  updated_at: string
  company_name: string | null
  contact_name: string
  email: string | null
  phone: string | null
  lead_type: 'construction_trailer' | 'residential' | 'commercial' | 'industrial'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  site_address: string | null
  city: string | null
  state: string | null
  zip: string | null
  project_value: number | null
  next_follow_up: string | null
  last_contacted: string | null
  source: string | null
  notes: string | null
  aec_project_id: string | null
  trailer_count: number | null
  assigned_to: string | null
  tags: string[] | null
}
export interface LeadInsert {
  company_name?: string | null
  contact_name: string
  email?: string | null
  phone?: string | null
  lead_type: 'construction_trailer' | 'residential' | 'commercial' | 'industrial'
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  site_address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  project_value?: number | null
  next_follow_up?: string | null
  last_contacted?: string | null
  source?: string | null
  notes?: string | null
  aec_project_id?: string | null
  trailer_count?: number | null
  assigned_to?: string | null
  tags?: string[] | null
}

// ── LeadActivity ──────────────────────────────────────────────────────────────
export interface LeadActivityRow {
  id: string
  created_at: string
  lead_id: string
  activity_type: 'call' | 'email' | 'sms' | 'visit' | 'note' | 'status_change'
  description: string
  performed_by: string | null
}
export interface LeadActivityInsert {
  lead_id: string
  activity_type: 'call' | 'email' | 'sms' | 'visit' | 'note' | 'status_change'
  description: string
  performed_by?: string | null
}

// ── Client ────────────────────────────────────────────────────────────────────
export interface ClientRow {
  id: string
  created_at: string
  updated_at: string
  company_name: string | null
  contact_name: string
  email: string | null
  phone: string | null
  billing_address: string | null
  client_type: 'construction' | 'residential' | 'commercial'
  status: 'active' | 'inactive' | 'prospect'
  total_revenue: number
  outstanding_balance: number
}
export interface ClientInsert {
  company_name?: string | null
  contact_name: string
  email?: string | null
  phone?: string | null
  billing_address?: string | null
  client_type: 'construction' | 'residential' | 'commercial'
  status?: 'active' | 'inactive' | 'prospect'
  total_revenue?: number
  outstanding_balance?: number
}

// ── Cleaner ───────────────────────────────────────────────────────────────────
export interface CleanerRow {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  phone: string
  email: string | null
  status: 'active' | 'inactive' | 'on_leave'
  hourly_rate: number | null
  skills: string[] | null
  preferred_areas: string[] | null
  candidate_id: string | null
  notification_pref: 'sms' | 'push' | 'both'
}
export interface CleanerInsert {
  full_name: string
  phone: string
  email?: string | null
  status?: 'active' | 'inactive' | 'on_leave'
  hourly_rate?: number | null
  skills?: string[] | null
  preferred_areas?: string[] | null
  candidate_id?: string | null
  notification_pref?: 'sms' | 'push' | 'both'
}

// ── Job ───────────────────────────────────────────────────────────────────────
export interface JobRow {
  id: string
  created_at: string
  updated_at: string
  title: string
  client_id: string | null
  lead_id: string | null
  address: string
  city: string | null
  state: string | null
  scheduled_start: string
  scheduled_end: string
  actual_start: string | null
  actual_end: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  job_type: 'construction_trailer' | 'residential' | 'commercial' | 'deep_clean' | 'recurring'
  price: number
  notes: string | null
  recurrence: string | null
}
export interface JobInsert {
  title: string
  client_id?: string | null
  lead_id?: string | null
  address: string
  city?: string | null
  state?: string | null
  scheduled_start: string
  scheduled_end: string
  actual_start?: string | null
  actual_end?: string | null
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  job_type: 'construction_trailer' | 'residential' | 'commercial' | 'deep_clean' | 'recurring'
  price: number
  notes?: string | null
  recurrence?: string | null
}

// ── JobAssignment ─────────────────────────────────────────────────────────────
export interface JobAssignmentRow {
  id: string
  created_at: string
  job_id: string
  cleaner_id: string
  notified_at: string | null
  confirmed_at: string | null
  status: 'assigned' | 'confirmed' | 'completed' | 'no_show'
}
export interface JobAssignmentInsert {
  job_id: string
  cleaner_id: string
  notified_at?: string | null
  confirmed_at?: string | null
  status?: 'assigned' | 'confirmed' | 'completed' | 'no_show'
}

// ── Invoice ───────────────────────────────────────────────────────────────────
export interface InvoiceRow {
  id: string
  created_at: string
  updated_at: string
  invoice_number: string
  client_id: string
  job_id: string | null
  amount: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issued_date: string
  due_date: string
  paid_date: string | null
  notes: string | null
}
export interface InvoiceInsert {
  invoice_number: string
  client_id: string
  job_id?: string | null
  amount: number
  tax?: number
  total: number
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issued_date: string
  due_date: string
  paid_date?: string | null
  notes?: string | null
}

// ── ContractorPayout ──────────────────────────────────────────────────────────
export interface ContractorPayoutRow {
  id: string
  created_at: string
  cleaner_id: string
  job_id: string
  hours_worked: number
  hourly_rate: number
  amount: number
  bonus: number
  status: 'pending' | 'approved' | 'paid'
  paid_date: string | null
  notes: string | null
}
export interface ContractorPayoutInsert {
  cleaner_id: string
  job_id: string
  hours_worked: number
  hourly_rate: number
  amount: number
  bonus?: number
  status?: 'pending' | 'approved' | 'paid'
  paid_date?: string | null
  notes?: string | null
}

// ── Expense ───────────────────────────────────────────────────────────────────
export interface ExpenseRow {
  id: string
  created_at: string
  category: 'supplies' | 'equipment' | 'fuel' | 'marketing' | 'insurance' | 'other'
  description: string
  amount: number
  date: string
  receipt_url: string | null
  job_id: string | null
}
export interface ExpenseInsert {
  category: 'supplies' | 'equipment' | 'fuel' | 'marketing' | 'insurance' | 'other'
  description: string
  amount: number
  date: string
  receipt_url?: string | null
  job_id?: string | null
}

type Rel = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}[]

// Table helper — satisfies GenericTable with empty Relationships
type T<R, I, U> = { Row: R; Insert: I; Update: U; Relationships: Rel }

// ── Database (Supabase generic) ───────────────────────────────────────────────
export interface Database {
  // Tell supabase-js to use PostgREST protocol v11 (avoids stricter v12 inference)
  __InternalSupabase: { PostgrestVersion: '11' }
  public: {
    Tables: {
      candidates:         T<CandidateRow,        CandidateInsert,        Partial<CandidateInsert>>
      interview_sessions: T<InterviewSessionRow, InterviewSessionInsert, Partial<InterviewSessionInsert>>
      leads:              T<LeadRow,             LeadInsert,             Partial<LeadInsert>>
      lead_activities:    T<LeadActivityRow,     LeadActivityInsert,     Partial<LeadActivityInsert>>
      clients:            T<ClientRow,           ClientInsert,           Partial<ClientInsert>>
      cleaners:           T<CleanerRow,          CleanerInsert,          Partial<CleanerInsert>>
      jobs:               T<JobRow,              JobInsert,              Partial<JobInsert>>
      job_assignments:    T<JobAssignmentRow,    JobAssignmentInsert,    Partial<JobAssignmentInsert>>
      invoices:           T<InvoiceRow,          InvoiceInsert,          Partial<InvoiceInsert>>
      contractor_payouts: T<ContractorPayoutRow, ContractorPayoutInsert, Partial<ContractorPayoutInsert>>
      expenses:           T<ExpenseRow,          ExpenseInsert,          Partial<ExpenseInsert>>
    }
    Views:          Record<string, never>
    Functions:      Record<string, never>
    Enums:          Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
