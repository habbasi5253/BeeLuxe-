/**
 * BeeLuxe Scheduling — Unit Tests
 *
 * Covers:
 *  1. overlapsInterval()       — interval math primitives
 *  2. detectConflict()         — double-booking detection
 *  3. getCancellationStatus()  — en-route & in-progress guards
 */

import { describe, it, expect } from 'vitest'
import {
  overlapsInterval,
  detectConflict,
  getCancellationStatus,
  EN_ROUTE_WINDOW_MINUTES,
  buildChecklist,
} from './scheduling'
import type { Job } from './scheduling'

// ── Helpers ───────────────────────────────────────────────────────────────────

function iso(offsetMinutes: number): string {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString()
}

function makeJob(overrides: Partial<Job> & { id: string }): Job {
  const base: Job = {
    id: overrides.id,
    title: `Test Job ${overrides.id}`,
    job_type: 'construction_trailer',
    address: '100 Test St',
    city: 'Houston',
    state: 'TX',
    scheduled_start: iso(60),
    scheduled_end:   iso(180),
    status: 'scheduled',
    cleaner_id: 'cleaner-1',
    cleaner_name: 'Maria Gonzalez',
    cleaner_phone: '(713) 555-1001',
    price: 380,
    notes: null,
    checklist: buildChecklist('construction_trailer'),
  }
  return { ...base, ...overrides }
}

// ── 1. overlapsInterval ───────────────────────────────────────────────────────

describe('overlapsInterval()', () => {
  const d = (h: number) => new Date(2026, 0, 1, h)   // Jan 1 2026 at hour h

  it('returns true for full overlap (A contains B)', () => {
    expect(overlapsInterval(d(8), d(14), d(9), d(12))).toBe(true)
  })

  it('returns true for partial overlap — A starts before B ends', () => {
    expect(overlapsInterval(d(8), d(11), d(10), d(13))).toBe(true)
  })

  it('returns true for partial overlap — B starts before A ends', () => {
    expect(overlapsInterval(d(10), d(13), d(8), d(11))).toBe(true)
  })

  it('returns true for identical intervals', () => {
    expect(overlapsInterval(d(8), d(11), d(8), d(11))).toBe(true)
  })

  it('returns false for back-to-back (A ends exactly when B starts)', () => {
    // End of first = start of second → allowed, NOT a conflict
    expect(overlapsInterval(d(8), d(10), d(10), d(12))).toBe(false)
  })

  it('returns false when A is entirely before B', () => {
    expect(overlapsInterval(d(7), d(9), d(10), d(12))).toBe(false)
  })

  it('returns false when A is entirely after B', () => {
    expect(overlapsInterval(d(13), d(15), d(8), d(11))).toBe(false)
  })

  it('returns false for same-day but non-overlapping blocks', () => {
    expect(overlapsInterval(d(7), d(9), d(13), d(15))).toBe(false)
  })
})

// ── 2. detectConflict ────────────────────────────────────────────────────────

describe('detectConflict()', () => {
  const CLEANER = 'cleaner-1'

  it('flags a direct double-booking (exact same window)', () => {
    const existing = makeJob({
      id: 'job-existing',
      cleaner_id: CLEANER,
      scheduled_start: iso(60),
      scheduled_end: iso(180),
      status: 'scheduled',
    })

    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(60),
      proposed_end: iso(180),
      jobs: [existing],
    })

    expect(result.hasConflict).toBe(true)
    expect(result.conflictingJob?.id).toBe('job-existing')
    expect(result.minutesOverlap).toBe(120)
  })

  it('flags a partial overlap (new job starts during existing)', () => {
    const existing = makeJob({
      id: 'job-existing',
      cleaner_id: CLEANER,
      scheduled_start: iso(0),
      scheduled_end: iso(120),
      status: 'scheduled',
    })

    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(60),   // starts 1h into existing
      proposed_end: iso(180),
      jobs: [existing],
    })

    expect(result.hasConflict).toBe(true)
    expect(result.minutesOverlap).toBe(60)
  })

  it('allows back-to-back scheduling (end = start of next)', () => {
    const existing = makeJob({
      id: 'job-morning',
      cleaner_id: CLEANER,
      scheduled_start: iso(0),
      scheduled_end: iso(120),
      status: 'scheduled',
    })

    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(120),  // starts exactly when morning job ends
      proposed_end: iso(240),
      jobs: [existing],
    })

    expect(result.hasConflict).toBe(false)
    expect(result.conflictingJob).toBeNull()
  })

  it('allows scheduling for a different cleaner on the same window', () => {
    const existing = makeJob({
      id: 'job-other-cleaner',
      cleaner_id: 'cleaner-2',   // different cleaner
      scheduled_start: iso(60),
      scheduled_end: iso(180),
      status: 'scheduled',
    })

    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(60),
      proposed_end: iso(180),
      jobs: [existing],
    })

    expect(result.hasConflict).toBe(false)
  })

  it('ignores cancelled jobs when checking for conflicts', () => {
    const cancelled = makeJob({
      id: 'job-cancelled',
      cleaner_id: CLEANER,
      scheduled_start: iso(60),
      scheduled_end: iso(180),
      status: 'cancelled',
    })

    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(60),
      proposed_end: iso(180),
      jobs: [cancelled],
    })

    expect(result.hasConflict).toBe(false)
  })

  it('ignores completed jobs when checking for conflicts', () => {
    const completed = makeJob({
      id: 'job-done',
      cleaner_id: CLEANER,
      scheduled_start: iso(-120),
      scheduled_end: iso(-30),
      status: 'completed',
    })

    // Propose a job that would have overlapped if it were active
    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(-90),
      proposed_end: iso(60),
      jobs: [completed],
    })

    expect(result.hasConflict).toBe(false)
  })

  it('skips the job being rescheduled (exclude_job_id)', () => {
    const self = makeJob({
      id: 'job-self',
      cleaner_id: CLEANER,
      scheduled_start: iso(60),
      scheduled_end: iso(180),
      status: 'scheduled',
    })

    // Rescheduling the same job to a slightly shifted window — should not conflict with itself
    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(90),
      proposed_end: iso(210),
      jobs: [self],
      exclude_job_id: 'job-self',
    })

    expect(result.hasConflict).toBe(false)
  })

  it('throws RangeError when proposed_end is not after proposed_start', () => {
    expect(() =>
      detectConflict({
        cleaner_id: CLEANER,
        proposed_start: iso(180),
        proposed_end: iso(60),   // end before start
        jobs: [],
      })
    ).toThrow(RangeError)
  })

  it('detects conflict when cleaner has two construction trailers at the same time', () => {
    const trailerA = makeJob({
      id: 'trailer-a',
      title: 'Apex Trailer #1',
      job_type: 'construction_trailer',
      cleaner_id: CLEANER,
      scheduled_start: iso(0),
      scheduled_end: iso(180),
      status: 'scheduled',
    })

    // PM tries to assign same cleaner to a second trailer that overlaps
    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(30),  // 30 min into trailer-a
      proposed_end: iso(210),
      jobs: [trailerA],
    })

    expect(result.hasConflict).toBe(true)
    expect(result.conflictingJob?.title).toBe('Apex Trailer #1')
    expect(result.minutesOverlap).toBe(150)
  })

  it('returns no conflict when cleaner has no jobs at all', () => {
    const result = detectConflict({
      cleaner_id: CLEANER,
      proposed_start: iso(0),
      proposed_end: iso(120),
      jobs: [],
    })

    expect(result.hasConflict).toBe(false)
    expect(result.minutesOverlap).toBe(0)
  })
})

// ── 3. getCancellationStatus ──────────────────────────────────────────────────

describe('getCancellationStatus()', () => {

  it('blocks cancellation of an in-progress job', () => {
    const job = makeJob({
      id: 'job-active',
      status: 'in_progress',
      scheduled_start: iso(-60),
      scheduled_end: iso(60),
    })

    const status = getCancellationStatus(job)
    expect(status.allowed).toBe(false)
    expect((status as Extract<typeof status, { allowed: false }>).reason).toBe('in_progress')
  })

  it('blocks cancellation when cleaner is en route (< 30 min until start)', () => {
    const startOffset = EN_ROUTE_WINDOW_MINUTES - 5   // 25 min from now
    const job = makeJob({
      id: 'job-en-route',
      status: 'scheduled',
      scheduled_start: iso(startOffset),
      scheduled_end: iso(startOffset + 120),
    })

    const status = getCancellationStatus(job)
    expect(status.allowed).toBe(false)
    expect((status as Extract<typeof status, { allowed: false }>).reason).toBe('en_route')
  })

  it('blocks cancellation at exactly the en-route window boundary (30 min out)', () => {
    const job = makeJob({
      id: 'job-boundary',
      status: 'scheduled',
      scheduled_start: iso(EN_ROUTE_WINDOW_MINUTES),
      scheduled_end: iso(EN_ROUTE_WINDOW_MINUTES + 120),
    })

    // Rounding means exactly 30 min is still in the window
    const status = getCancellationStatus(job)
    expect(status.allowed).toBe(false)
    expect((status as Extract<typeof status, { allowed: false }>).reason).toBe('en_route')
  })

  it('allows cancellation when job starts more than 30 min from now', () => {
    const job = makeJob({
      id: 'job-future',
      status: 'scheduled',
      scheduled_start: iso(EN_ROUTE_WINDOW_MINUTES + 10),  // 40 min out
      scheduled_end: iso(EN_ROUTE_WINDOW_MINUTES + 130),
    })

    const status = getCancellationStatus(job)
    expect(status.allowed).toBe(true)
  })

  it('allows cancellation of a far-future job (e.g. 3 days out)', () => {
    const job = makeJob({
      id: 'job-far-future',
      status: 'scheduled',
      scheduled_start: iso(3 * 24 * 60),   // 3 days
      scheduled_end: iso(3 * 24 * 60 + 180),
    })

    expect(getCancellationStatus(job).allowed).toBe(true)
  })

  it('allows cancellation of an already-cancelled job (idempotent)', () => {
    const job = makeJob({
      id: 'job-already-cancelled',
      status: 'cancelled',
      scheduled_start: iso(10),
      scheduled_end: iso(130),
    })

    expect(getCancellationStatus(job).allowed).toBe(true)
  })

  it('allows cancellation of a completed job (terminal state, no harm)', () => {
    const job = makeJob({
      id: 'job-completed',
      status: 'completed',
      scheduled_start: iso(-120),
      scheduled_end: iso(-30),
    })

    expect(getCancellationStatus(job).allowed).toBe(true)
  })

  it('uses the nowIso override for deterministic testing', () => {
    // Job starts Jan 2 2026 at 09:00
    const jobStart = new Date(2026, 0, 2, 9, 0).toISOString()
    const jobEnd   = new Date(2026, 0, 2, 12, 0).toISOString()

    const job = makeJob({
      id: 'job-deterministic',
      status: 'scheduled',
      scheduled_start: jobStart,
      scheduled_end: jobEnd,
    })

    // 20 min before start → en route
    const enRoute = new Date(2026, 0, 2, 8, 40).toISOString()
    const enRouteStatus = getCancellationStatus(job, enRoute)
    expect(enRouteStatus.allowed).toBe(false)
    expect((enRouteStatus as Extract<typeof enRouteStatus, { allowed: false }>).reason).toBe('en_route')

    // 2 hours before start → allowed
    const twoHoursBefore = new Date(2026, 0, 2, 7, 0).toISOString()
    const earlyStatus = getCancellationStatus(job, twoHoursBefore)
    expect(earlyStatus.allowed).toBe(true)
  })

  it('PM cancels job 25 min out — cleaner already driving to construction trailer', () => {
    // Scenario: Maria is driving to Apex Trailer. PM tries to cancel 25 min before.
    const job = makeJob({
      id: 'apex-trailer',
      title: 'Apex Trailer #4',
      job_type: 'construction_trailer',
      cleaner_id: '1',
      cleaner_name: 'Maria Gonzalez',
      status: 'scheduled',
      scheduled_start: iso(25),   // 25 min from now
      scheduled_end: iso(205),
    })

    const result = getCancellationStatus(job)
    expect(result.allowed).toBe(false)

    if (!result.allowed && result.reason === 'en_route') {
      expect(result.message).toMatch(/en route/i)
      expect(result.minutesUntilStart).toBeGreaterThan(0)
      expect(result.minutesUntilStart).toBeLessThanOrEqual(EN_ROUTE_WINDOW_MINUTES)
    }
  })
})
