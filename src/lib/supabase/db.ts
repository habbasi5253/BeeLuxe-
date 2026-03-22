/**
 * Typed Supabase query helper.
 *
 * supabase-js v2.99 uses PostgREST protocol v12 which has stricter
 * generic inference than hand-written Database types can satisfy.
 * This helper casts to `any` at the boundary while keeping full
 * TypeScript safety on returned data via explicit return types.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CandidateRow, CandidateInsert,
  LeadRow, LeadInsert,
  ClientRow,
  CleanerRow,
  JobRow, JobInsert,
  JobAssignmentInsert,
  InvoiceRow,
  ContractorPayoutRow,
  ExpenseRow,
} from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>

export function db(supabase: AnyClient) {
  const q = supabase as AnyClient

  return {
    // ── Candidates ─────────────────────────────────────────────────────────
    candidates: {
      select: () => q.from('candidates').select('*').returns<CandidateRow[]>(),
      insert: (data: CandidateInsert) => q.from('candidates').insert(data).select().single<CandidateRow>(),
      update: (id: string, data: Partial<CandidateInsert>) =>
        q.from('candidates').update(data).eq('id', id).select().single<CandidateRow>(),
    },

    // ── Leads ──────────────────────────────────────────────────────────────
    leads: {
      select: (filters?: { type?: string; status?: string }) => {
        let query = q.from('leads').select('*').order('created_at', { ascending: false })
        if (filters?.type)   query = query.eq('lead_type', filters.type)
        if (filters?.status) query = query.eq('status', filters.status)
        return query.returns<LeadRow[]>()
      },
      insert: (data: LeadInsert) => q.from('leads').insert(data).select().single<LeadRow>(),
      update: (id: string, data: Partial<LeadInsert>) =>
        q.from('leads').update(data).eq('id', id).select().single<LeadRow>(),
    },

    // ── Clients ────────────────────────────────────────────────────────────
    clients: {
      select: () => q.from('clients').select('*, invoices ( total, status )').order('total_revenue', { ascending: false }).returns<ClientRow[]>(),
    },

    // ── Cleaners ───────────────────────────────────────────────────────────
    cleaners: {
      select: () => q.from('cleaners').select('*').eq('status', 'active').returns<CleanerRow[]>(),
    },

    // ── Jobs ───────────────────────────────────────────────────────────────
    jobs: {
      schedule: (from: string, to: string) =>
        q.from('jobs')
          .select('*, job_assignments ( cleaner_id, status, cleaners ( full_name, phone ) )')
          .gte('scheduled_start', from)
          .lte('scheduled_start', to)
          .order('scheduled_start')
          .returns<JobRow[]>(),
      insert: (data: JobInsert) => q.from('jobs').insert(data).select().single<JobRow>(),
    },

    // ── Job Assignments ────────────────────────────────────────────────────
    jobAssignments: {
      insert: (data: JobAssignmentInsert) => q.from('job_assignments').insert(data),
    },

    // ── Finance ────────────────────────────────────────────────────────────
    invoices: {
      paid: () => q.from('invoices').select('amount, total, status, issued_date').eq('status', 'paid').returns<Pick<InvoiceRow, 'amount' | 'total' | 'status' | 'issued_date'>[]>(),
    },
    payouts: {
      select: () => q.from('contractor_payouts').select('amount, bonus, status').returns<Pick<ContractorPayoutRow, 'amount' | 'bonus' | 'status'>[]>(),
      list: () => q.from('contractor_payouts').select('*, cleaners ( full_name ), jobs ( title, scheduled_start )').order('created_at', { ascending: false }).limit(50),
    },
    expenses: {
      select: () => q.from('expenses').select('amount, category, date').returns<Pick<ExpenseRow, 'amount' | 'category' | 'date'>[]>(),
    },
  }
}
