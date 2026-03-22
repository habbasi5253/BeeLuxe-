import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date().toISOString()
  const to = searchParams.get('to') ?? new Date(Date.now() + 7 * 86400000).toISOString()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      job_assignments (
        cleaner_id,
        status,
        cleaners ( full_name, phone )
      )
    `)
    .gte('scheduled_start', from)
    .lte('scheduled_start', to)
    .order('scheduled_start')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { job, cleaner_id } = await req.json()

  const { data: jobData, error: jobError } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single()

  if (jobError) return NextResponse.json({ error: jobError.message }, { status: 500 })

  if (cleaner_id) {
    await supabase.from('job_assignments').insert({
      job_id: jobData.id,
      cleaner_id,
      status: 'assigned',
    })
  }

  return NextResponse.json(jobData, { status: 201 })
}
