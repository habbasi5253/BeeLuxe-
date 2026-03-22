// ── Shared types ─────────────────────────────────────────────────────────────

export type JobType = 'construction_trailer' | 'residential' | 'commercial' | 'deep_clean' | 'airbnb' | 'move_in_out' | 'recurring'
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Job {
  id: string
  title: string
  job_type: JobType
  address: string
  city: string
  state: string
  scheduled_start: string   // ISO
  scheduled_end: string     // ISO
  status: JobStatus
  cleaner_id: string | null
  cleaner_name: string | null
  cleaner_phone: string | null
  price: number
  notes: string | null
  checklist: ChecklistItem[]
}

export interface Cleaner {
  id: string
  name: string
  phone: string
  email: string
  status: 'active' | 'on_leave' | 'inactive'
  hourly_rate: number
  skills: string[]
  rating: number
}

// ── Checklist templates by job type ─────────────────────────────────────────

export const CHECKLIST_TEMPLATES: Record<JobType, string[]> = {
  construction_trailer: [
    'Sweep & mop all floor areas',
    'Wipe down all surfaces & countertops',
    'Clean microwave & break area',
    'Sanitize restroom / portable facilities',
    'Empty & reline all trash bins',
    'Wipe interior windows & mirrors',
    'Remove debris from entry / doormat',
    'Restock paper products (if supplied)',
    'Vacuum any carpeted sections',
    'Final walkthrough & photo documentation',
  ],
  residential: [
    'Vacuum all rooms',
    'Mop all hard floors',
    'Clean bathrooms (toilet, sink, tub/shower)',
    'Wipe kitchen surfaces & appliances',
    'Clean microwave (inside & out)',
    'Empty all trash bins',
    'Dust furniture & surfaces',
    'Clean mirrors & glass',
    'Wipe light switches & door handles',
  ],
  commercial: [
    'Vacuum all carpeted areas',
    'Mop all hard floors',
    'Clean & sanitize all restrooms',
    'Empty & reline all trash bins',
    'Wipe all desks & work surfaces',
    'Clean break room (microwave, counters, sink)',
    'Sanitize high-touch points (handles, switches)',
    'Wipe glass doors & windows',
    'Dust blinds & ledges',
  ],
  deep_clean: [
    'Full standard clean (vacuum, mop, bathrooms, kitchen)',
    'Clean inside oven',
    'Clean inside refrigerator',
    'Wipe all baseboards & trim',
    'Clean ceiling fans & light fixtures',
    'Wipe window sills & tracks',
    'Clean inside all cabinets & drawers',
    'Scrub grout & tile',
    'Clean behind/under appliances',
  ],
  airbnb: [
    'Strip & replace all bed linens',
    'Replace towels & guest toiletries',
    'Vacuum all rooms & mop floors',
    'Clean bathrooms top to bottom',
    'Wipe all surfaces & appliances',
    'Clean inside fridge — remove old food',
    'Check & restock consumables (soap, TP, coffee)',
    'Inspect for damage or missing items',
    'Final staging & listing photos',
  ],
  move_in_out: [
    'Clean inside all cabinets & drawers',
    'Clean inside oven & fridge',
    'Vacuum & mop all floors',
    'Scrub all bathrooms',
    'Wipe all surfaces & baseboards',
    'Clean interior windows & sills',
    'Wipe down all appliances',
    'Remove any leftover items / debris',
  ],
  recurring: [
    'Vacuum all rooms',
    'Mop hard floors',
    'Clean bathrooms',
    'Wipe kitchen surfaces',
    'Empty trash bins',
    'Dust surfaces & furniture',
  ],
}

export function buildChecklist(jobType: JobType): ChecklistItem[] {
  return (CHECKLIST_TEMPLATES[jobType] ?? CHECKLIST_TEMPLATES.residential).map((text, i) => ({
    id: `${i}`,
    text,
    completed: false,
  }))
}

// ── Job type colours ─────────────────────────────────────────────────────────

export const JOB_COLORS: Record<JobType, string> = {
  construction_trailer: '#f97316',
  residential:          '#3b82f6',
  commercial:           '#8b5cf6',
  deep_clean:           '#06b6d4',
  airbnb:               '#ec4899',
  move_in_out:          '#84cc16',
  recurring:            '#10b981',
}

// ── Mock cleaners (vetted / active) ─────────────────────────────────────────

export const MOCK_CLEANERS: Cleaner[] = [
  { id: '1', name: 'Maria Gonzalez', phone: '(713) 555-1001', email: 'maria@example.com', status: 'active', hourly_rate: 22, skills: ['Deep Clean', 'Construction', 'Industrial'], rating: 4.9 },
  { id: '2', name: 'James Wright',   phone: '(713) 555-1002', email: 'james@example.com', status: 'active', hourly_rate: 20, skills: ['Residential', 'Commercial'], rating: 4.7 },
  { id: '3', name: 'Aisha Patel',    phone: '(713) 555-1003', email: 'aisha@example.com', status: 'active', hourly_rate: 22, skills: ['Construction', 'Industrial', 'Deep Clean'], rating: 4.8 },
  { id: '4', name: 'Kevin Okafor',   phone: '(713) 555-1004', email: 'kevin@example.com', status: 'active', hourly_rate: 20, skills: ['Residential', 'Commercial'], rating: 4.6 },
  { id: '5', name: 'Rosa Medina',    phone: '(713) 555-1005', email: 'rosa@example.com',  status: 'on_leave', hourly_rate: 21, skills: ['Deep Clean', 'Residential'], rating: 4.9 },
]

// ── Mock jobs (shared across scheduling module) ──────────────────────────────

const now = Date.now()
const h = 3_600_000
const d = 86_400_000

export const INITIAL_JOBS: Job[] = [
  {
    id: '1', title: 'Apex Trailer #4 — Maria G.',
    job_type: 'construction_trailer',
    address: '1200 Industrial Blvd', city: 'Houston', state: 'TX',
    scheduled_start: new Date(now - 2 * h).toISOString(),
    scheduled_end:   new Date(now).toISOString(),
    status: 'in_progress',
    cleaner_id: '1', cleaner_name: 'Maria Gonzalez', cleaner_phone: '(713) 555-1001',
    price: 380, notes: 'Access code: 4421. Two trailers on east side of lot.',
    checklist: buildChecklist('construction_trailer'),
  },
  {
    id: '2', title: 'Greenfield Home — James W.',
    job_type: 'residential',
    address: '8802 Oak Lane', city: 'Houston', state: 'TX',
    scheduled_start: new Date(now + 3 * h).toISOString(),
    scheduled_end:   new Date(now + 5 * h).toISOString(),
    status: 'scheduled',
    cleaner_id: '2', cleaner_name: 'James Wright', cleaner_phone: '(713) 555-1002',
    price: 220, notes: '3BR home. Dog (friendly) will be home.',
    checklist: buildChecklist('residential'),
  },
  {
    id: '3', title: 'Metro Office Suite — Aisha P.',
    job_type: 'commercial',
    address: '800 Commerce St', city: 'Houston', state: 'TX',
    scheduled_start: new Date(now + 7 * h).toISOString(),
    scheduled_end:   new Date(now + 10 * h).toISOString(),
    status: 'scheduled',
    cleaner_id: '3', cleaner_name: 'Aisha Patel', cleaner_phone: '(713) 555-1003',
    price: 540, notes: 'After-hours entry. Key in lockbox #302.',
    checklist: buildChecklist('commercial'),
  },
  {
    id: '4', title: 'BuildRight Trailer #3',
    job_type: 'construction_trailer',
    address: '550 Commerce Park Dr', city: 'Katy', state: 'TX',
    scheduled_start: new Date(now + 1 * d).toISOString(),
    scheduled_end:   new Date(now + 1 * d + 3 * h).toISOString(),
    status: 'scheduled',
    cleaner_id: null, cleaner_name: null, cleaner_phone: null,
    price: 380, notes: 'UNASSIGNED — needs cleaner before EOD.',
    checklist: buildChecklist('construction_trailer'),
  },
  {
    id: '5', title: 'Sunrise Apt Move-Out',
    job_type: 'move_in_out',
    address: '222 Riverside Dr', city: 'Pasadena', state: 'TX',
    scheduled_start: new Date(now + 1 * d + 2 * h).toISOString(),
    scheduled_end:   new Date(now + 1 * d + 5 * h).toISOString(),
    status: 'scheduled',
    cleaner_id: null, cleaner_name: null, cleaner_phone: null,
    price: 310, notes: null,
    checklist: buildChecklist('move_in_out'),
  },
  {
    id: '6', title: 'Airbnb Turnover — Heights',
    job_type: 'airbnb',
    address: '904 Heights Blvd', city: 'Houston', state: 'TX',
    scheduled_start: new Date(now + 2 * d).toISOString(),
    scheduled_end:   new Date(now + 2 * d + 2 * h).toISOString(),
    status: 'scheduled',
    cleaner_id: '1', cleaner_name: 'Maria Gonzalez', cleaner_phone: '(713) 555-1001',
    price: 175, notes: 'New guests check in at 3 PM. Must finish by 2:30.',
    checklist: buildChecklist('airbnb'),
  },
  {
    id: '7', title: 'Greenfield Home (Weekly) — James W.',
    job_type: 'recurring',
    address: '8802 Oak Lane', city: 'Houston', state: 'TX',
    scheduled_start: new Date(now + 7 * d).toISOString(),
    scheduled_end:   new Date(now + 7 * d + 2 * h).toISOString(),
    status: 'scheduled',
    cleaner_id: '2', cleaner_name: 'James Wright', cleaner_phone: '(713) 555-1002',
    price: 180, notes: 'Weekly recurring.',
    checklist: buildChecklist('recurring'),
  },
]

// ── Portal token → cleaner ID map ────────────────────────────────────────────
// In production replace with DB lookup + proper auth.
export const PORTAL_CLEANER_MAP: Record<string, string> = {
  '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
}
