import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/supabase/db'
import type { JobInsert } from '@/types/database'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date().toISOString()
  const to   = searchParams.get('to')   ?? new Date(Date.now() + 7 * 86400000).toISOString()

  const { data, error } = await db(supabase).jobs.schedule(from, to)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json() as { job: JobInsert; cleaner_id?: string }
  const { job, cleaner_id } = body

  const { data: jobData, error: jobError } = await db(supabase).jobs.insert(job)
  if (jobError) return NextResponse.json({ error: jobError.message }, { status: 500 })

  if (cleaner_id && jobData) {
    await db(supabase).jobAssignments.insert({
      job_id: jobData.id,
      cleaner_id,
      status: 'assigned',
    })
  }

  return NextResponse.json(jobData, { status: 201 })
}
