export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ── RECRUITMENT ──────────────────────────────────────────────────────────
      candidates: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['candidates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>
      }

      interview_sessions: {
        Row: {
          id: string
          created_at: string
          candidate_id: string
          session_type: 'sms' | 'voice' | 'web'
          messages: Json
          completed_at: string | null
          score: number | null
        }
        Insert: Omit<Database['public']['Tables']['interview_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['interview_sessions']['Insert']>
      }

      // ── CRM ──────────────────────────────────────────────────────────────────
      leads: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }

      lead_activities: {
        Row: {
          id: string
          created_at: string
          lead_id: string
          activity_type: 'call' | 'email' | 'sms' | 'visit' | 'note' | 'status_change'
          description: string
          performed_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['lead_activities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lead_activities']['Insert']>
      }

      // ── OPERATIONS & SCHEDULING ───────────────────────────────────────────────
      cleaners: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['cleaners']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cleaners']['Insert']>
      }

      jobs: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }

      job_assignments: {
        Row: {
          id: string
          created_at: string
          job_id: string
          cleaner_id: string
          notified_at: string | null
          confirmed_at: string | null
          status: 'assigned' | 'confirmed' | 'completed' | 'no_show'
        }
        Insert: Omit<Database['public']['Tables']['job_assignments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['job_assignments']['Insert']>
      }

      // ── FINANCIALS ────────────────────────────────────────────────────────────
      clients: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }

      invoices: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }

      contractor_payouts: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['contractor_payouts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contractor_payouts']['Insert']>
      }

      expenses: {
        Row: {
          id: string
          created_at: string
          category: 'supplies' | 'equipment' | 'fuel' | 'marketing' | 'insurance' | 'other'
          description: string
          amount: number
          date: string
          receipt_url: string | null
          job_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
