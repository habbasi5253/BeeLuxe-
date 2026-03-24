/**
 * GET /api/archive?secret=<ARCHIVE_SECRET>
 *
 * Auto-archiver — moves stale records from live tables into archive tables.
 * Triggered by Vercel Cron every Sunday at 2 AM (see vercel.json).
 *
 * WHAT GETS ARCHIVED:
 *   leads      — status IN ('won','lost')   AND created_at < NOW() - 90 days
 *   jobs       — status IN ('completed','cancelled') AND scheduled_end < NOW() - 60 days
 *   candidates — status IN ('hired','rejected')      AND created_at < NOW() - 90 days
 *
 * GOAL: Keep the primary tables under ~100k rows so Supabase free tier
 * (500 MB) lasts years, not months.
 *
 * Returns a JSON summary of how many rows were archived per table.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Uses the service-role key so it can bypass RLS for archiving
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

interface ArchiveResult {
  table:    string
  archived: number
  error?:   string
}

async function archiveTable(
  supabase:      ReturnType<typeof adminClient>,
  source:        string,
  dest:          string,
  statusValues:  string[],
  dateField:     string,
  daysOld:       number
): Promise<ArchiveResult> {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString()

  try {
    // Step 1 — copy matching rows into the archive table
    const { error: insertError } = await supabase.rpc('archive_rows', {
      p_source:   source,
      p_dest:     dest,
      p_statuses: statusValues,
      p_field:    dateField,
      p_cutoff:   cutoff,
    })

    // Fallback if the RPC doesn't exist yet: use raw SQL via a view
    // In practice, operators can create the function or handle via pg_cron
    if (insertError) {
      // Direct approach: insert then delete (two queries, still atomic-ish for MVP)
      const { data: rows, error: selectError } = await supabase
        .from(source)
        .select('*')
        .in('status', statusValues)
        .lt(dateField, cutoff)
        .limit(500)   // batch cap — don't time out the serverless function

      if (selectError) throw selectError
      if (!rows || rows.length === 0) return { table: source, archived: 0 }

      const { error: archiveError } = await supabase
        .from(dest)
        .insert(rows.map((r) => ({ ...r, archived_at: new Date().toISOString() })))

      if (archiveError) throw archiveError

      const ids = rows.map((r) => r.id)
      const { error: deleteError } = await supabase
        .from(source)
        .delete()
        .in('id', ids)

      if (deleteError) throw deleteError
      return { table: source, archived: rows.length }
    }

    return { table: source, archived: -1 }   // RPC succeeded — count unknown
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('general', `Archive failed for ${source}: ${msg}`)
    return { table: source, archived: 0, error: msg }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  if (secret !== (process.env.ARCHIVE_SECRET ?? 'beeluxe-archive')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = adminClient()

  const [leads, jobs, candidates] = await Promise.all([
    archiveTable(supabase, 'leads',      'archived_leads',      ['won', 'lost'],                  'created_at',    90),
    archiveTable(supabase, 'jobs',       'archived_jobs',       ['completed', 'cancelled'],        'scheduled_end', 60),
    archiveTable(supabase, 'candidates', 'archived_candidates', ['hired', 'rejected'],             'created_at',    90),
  ])

  const results = [leads, jobs, candidates]
  const totalArchived = results.reduce((s, r) => s + Math.max(r.archived, 0), 0)
  const hasErrors     = results.some((r) => r.error)

  logger.info('general', 'Auto-archive run complete', { totalArchived })

  return NextResponse.json(
    {
      status:  hasErrors ? 'partial' : 'ok',
      results,
      total_archived: totalArchived,
      run_at: new Date().toISOString(),
    },
    { status: hasErrors ? 207 : 200 }
  )
}
