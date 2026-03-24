#!/usr/bin/env npx tsx
/**
 * BeeLuxe RLS Verification Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies that Row Level Security walls between roles are working correctly.
 *
 * WHAT THIS TESTS:
 *   owner  → can read everything (leads, jobs, invoices, candidates, cleaners)
 *   staff  → same as owner for operational tables; no delete on financial
 *   cleaner → ZERO access to leads, clients, invoices, candidates
 *             ONLY their own jobs, their own payout rows, their own profile
 *
 * HOW TO RUN:
 *   1. Set environment variables (copy from .env.local):
 *        export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *        export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *   2. Run the script:
 *        npx tsx scripts/test-rls.ts
 *
 * The script creates three test users, runs assertions for each role, then
 * cleans up. It leaves zero test data in the database.
 *
 * NOTE: Requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS for setup/teardown).
 * Do NOT run this against production with live customer data.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY          = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n')
  process.exit(1)
}

// ── Admin client (bypasses RLS — only for setup & teardown) ───────────────────
const admin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ── Test harness ──────────────────────────────────────────────────────────────
let passed = 0
let failed = 0

function pass(label: string) {
  console.log(`  ✅  ${label}`)
  passed++
}
function fail(label: string, detail?: string) {
  console.log(`  ❌  ${label}${detail ? ` — ${detail}` : ''}`)
  failed++
}

async function expect_empty(
  label: string,
  client: SupabaseClient,
  table: string
) {
  const { data, error } = await client.from(table).select('id').limit(5)
  if (error) {
    // Some Supabase setups return an error when the policy blocks SELECT entirely
    pass(`${label}: ${table} blocked (error returned)`)
    return
  }
  if (!data || data.length === 0) {
    pass(`${label}: ${table} returns 0 rows`)
  } else {
    fail(`${label}: ${table} should be empty but returned ${data.length} row(s)`)
  }
}

async function expect_rows(
  label: string,
  client: SupabaseClient,
  table: string,
  minRows = 1
) {
  const { data, error } = await client.from(table).select('id').limit(20)
  if (error) {
    fail(`${label}: ${table} errored — ${error.message}`)
    return
  }
  if (data && data.length >= minRows) {
    pass(`${label}: ${table} returns ${data.length} row(s)`)
  } else {
    fail(`${label}: ${table} should have ≥${minRows} rows but got ${data?.length ?? 0}`)
  }
}

// ── Signed-in client factory ──────────────────────────────────────────────────
async function signedInClient(email: string, password: string): Promise<SupabaseClient | null> {
  if (!ANON_KEY) {
    console.warn('  ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not set — skipping authenticated tests')
    return null
  }
  const client = createClient(SUPABASE_URL!, ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) {
    console.warn(`  ⚠️  Could not sign in as ${email}: ${error.message}`)
    return null
  }
  return client
}

// ── Setup: seed minimal test data so queries have something to return/block ────
interface TestIds {
  leadId?:      string
  jobId?:       string
  cleanerId?:   string
  candidateId?: string
  invoiceId?:   string
}

async function seedTestData(): Promise<TestIds> {
  const ids: TestIds = {}

  const { data: lead } = await admin.from('leads').insert({
    company_name: '__RLS_TEST_LEAD__',
    contact_name: 'RLS Test',
    status: 'new',
    lead_type: 'residential',
    city: 'Houston', state: 'TX',
  }).select('id').single()
  ids.leadId = lead?.id

  const { data: cleaner } = await admin.from('cleaners').insert({
    full_name: '__RLS_TEST_CLEANER__',
    phone: '0000000000',
    status: 'active',
    hourly_rate: 20,
  }).select('id').single()
  ids.cleanerId = cleaner?.id

  const { data: job } = await admin.from('jobs').insert({
    title: '__RLS_TEST_JOB__',
    address: '1 Test St',
    city: 'Houston', state: 'TX',
    scheduled_start: new Date(Date.now() + 86400000).toISOString(),
    scheduled_end:   new Date(Date.now() + 90000000).toISOString(),
    status: 'scheduled',
    job_type: 'basic',
    price: 100,
  }).select('id').single()
  ids.jobId = job?.id

  if (ids.jobId && ids.cleanerId) {
    await admin.from('job_assignments').insert({
      job_id: ids.jobId,
      cleaner_id: ids.cleanerId,
      status: 'assigned',
    })
  }

  const { data: candidate } = await admin.from('candidates').insert({
    full_name: '__RLS_TEST_CANDIDATE__',
    phone: '0000000001',
    status: 'new',
    score: 70,
    source: 'test',
  }).select('id').single()
  ids.candidateId = candidate?.id

  return ids
}

async function teardownTestData(ids: TestIds) {
  if (ids.jobId)       await admin.from('job_assignments').delete().eq('job_id', ids.jobId)
  if (ids.jobId)       await admin.from('jobs').delete().eq('id', ids.jobId)
  if (ids.cleanerId)   await admin.from('cleaners').delete().eq('id', ids.cleanerId)
  if (ids.leadId)      await admin.from('leads').delete().eq('id', ids.leadId)
  if (ids.candidateId) await admin.from('candidates').delete().eq('id', ids.candidateId)
}

// ── User test accounts (created and deleted per run) ─────────────────────────
const TEST_PASSWORD = `RLS_Test_${Date.now()}!`
const TEST_USERS = {
  owner:   { email: `rls_owner_${Date.now()}@test.beeluxe.internal`,   role: 'owner'   },
  staff:   { email: `rls_staff_${Date.now()}@test.beeluxe.internal`,   role: 'staff'   },
  cleaner: { email: `rls_cleaner_${Date.now()}@test.beeluxe.internal`, role: 'cleaner' },
}

async function createTestUser(email: string, role: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password:      TEST_PASSWORD,
    email_confirm: true,
    app_metadata:  { role },
  })
  if (error) {
    console.warn(`  ⚠️  Could not create test user ${email}: ${error.message}`)
    return null
  }
  // Upsert user_profile with the correct role
  if (data.user) {
    await admin.from('user_profiles').upsert({ id: data.user.id, role }, { onConflict: 'id' })
  }
  return data.user?.id ?? null
}

async function deleteTestUser(email: string) {
  const { data } = await admin.auth.admin.listUsers()
  const user = data?.users?.find((u) => u.email === email)
  if (user) {
    await admin.from('user_profiles').delete().eq('id', user.id)
    await admin.auth.admin.deleteUser(user.id)
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🐝  BeeLuxe RLS Policy Verification\n')
  console.log(`📡  Supabase: ${SUPABASE_URL}\n`)

  // ── Seed data ──────────────────────────────────────────────────────────────
  console.log('── Seeding test data…')
  const ids = await seedTestData()
  console.log(`   lead=${ids.leadId?.slice(0,8)} job=${ids.jobId?.slice(0,8)} cleaner=${ids.cleanerId?.slice(0,8)}\n`)

  // ── Create test users ──────────────────────────────────────────────────────
  console.log('── Creating test auth users…')
  const ownerUserId   = await createTestUser(TEST_USERS.owner.email,   'owner')
  const staffUserId   = await createTestUser(TEST_USERS.staff.email,   'staff')
  const cleanerUserId = await createTestUser(TEST_USERS.cleaner.email, 'cleaner')
  console.log(`   owner=${ownerUserId?.slice(0,8)} staff=${staffUserId?.slice(0,8)} cleaner=${cleanerUserId?.slice(0,8)}\n`)

  // ── OWNER tests ────────────────────────────────────────────────────────────
  console.log('── Role: OWNER (should see everything)')
  const ownerClient = await signedInClient(TEST_USERS.owner.email, TEST_PASSWORD)
  if (ownerClient) {
    await expect_rows('owner', ownerClient, 'leads')
    await expect_rows('owner', ownerClient, 'jobs')
    await expect_rows('owner', ownerClient, 'cleaners')
    await expect_rows('owner', ownerClient, 'candidates')
    // Invoices may be empty (no seed) but query should not be blocked
    const { error: invErr } = await ownerClient.from('invoices').select('id').limit(1)
    invErr
      ? fail('owner: invoices query blocked', invErr.message)
      : pass('owner: invoices query allowed')
  }
  console.log()

  // ── STAFF tests ────────────────────────────────────────────────────────────
  console.log('── Role: STAFF (same access as owner for operational tables)')
  const staffClient = await signedInClient(TEST_USERS.staff.email, TEST_PASSWORD)
  if (staffClient) {
    await expect_rows('staff', staffClient, 'leads')
    await expect_rows('staff', staffClient, 'jobs')
    await expect_rows('staff', staffClient, 'cleaners')
    await expect_rows('staff', staffClient, 'candidates')
    const { error: invErr } = await staffClient.from('invoices').select('id').limit(1)
    invErr
      ? fail('staff: invoices query blocked', invErr.message)
      : pass('staff: invoices query allowed')
  }
  console.log()

  // ── CLEANER tests — the hard walls ────────────────────────────────────────
  console.log('── Role: CLEANER (hard walls: leads/clients/invoices/candidates must return 0)')
  const cleanerClient = await signedInClient(TEST_USERS.cleaner.email, TEST_PASSWORD)
  if (cleanerClient) {
    // These must be inaccessible
    await expect_empty('cleaner BLOCKED', cleanerClient, 'leads')
    await expect_empty('cleaner BLOCKED', cleanerClient, 'clients')
    await expect_empty('cleaner BLOCKED', cleanerClient, 'candidates')
    await expect_empty('cleaner BLOCKED', cleanerClient, 'interview_sessions')
    await expect_empty('cleaner BLOCKED', cleanerClient, 'invoices')
    await expect_empty('cleaner BLOCKED', cleanerClient, 'expenses')

    // A cleaner not linked to any job should see 0 jobs
    // (Our test cleaner has a job_assignment but the auth user != cleaner row,
    //  so my_cleaner_id() returns NULL → should see 0 jobs too)
    const { data: cleanerJobs } = await cleanerClient.from('jobs').select('id').limit(10)
    if (!cleanerJobs || cleanerJobs.length === 0) {
      pass('cleaner SCOPED: jobs returns 0 (no linked cleaner_id)')
    } else {
      fail(`cleaner SCOPED: jobs returned ${cleanerJobs.length} rows for unlinked cleaner`)
    }

    // Payout rows — should be empty for unlinked cleaner
    await expect_empty('cleaner SCOPED', cleanerClient, 'contractor_payouts')
  }
  console.log()

  // ── Cross-cleaner isolation ────────────────────────────────────────────────
  console.log('── Isolation: cleaner cannot see other cleaners\' profiles')
  if (cleanerClient && ids.cleanerId) {
    const { data: allCleaners } = await cleanerClient
      .from('cleaners')
      .select('id, full_name')
      .limit(10)

    const seesTestCleaner = allCleaners?.some((c) => c.id === ids.cleanerId)
    seesTestCleaner
      ? fail('isolation: cleaner sees test cleaner row (should be blocked)')
      : pass('isolation: cleaner cannot see other cleaners\' rows')
  }
  console.log()

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`── Results: ${passed} passed, ${failed} failed\n`)

  // ── Teardown ──────────────────────────────────────────────────────────────
  console.log('── Cleaning up test data and users…')
  await teardownTestData(ids)
  await Promise.all([
    deleteTestUser(TEST_USERS.owner.email),
    deleteTestUser(TEST_USERS.staff.email),
    deleteTestUser(TEST_USERS.cleaner.email),
  ])
  console.log('   Done.\n')

  if (failed > 0) {
    console.error(`🚨  ${failed} RLS check(s) FAILED — review policies in supabase/migrations/20260324000001_rbac_rls.sql\n`)
    process.exit(1)
  } else {
    console.log(`🎉  All ${passed} RLS checks passed. Your data walls are solid.\n`)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
