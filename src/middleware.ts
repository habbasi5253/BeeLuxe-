import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Demo mode: env vars not configured yet — let all requests through
const IS_DEMO = !SUPABASE_URL ||
                SUPABASE_URL === 'your_supabase_project_url' ||
                !SUPABASE_KEY ||
                SUPABASE_KEY === 'your_supabase_anon_key'

// ── Route permission map ───────────────────────────────────────────────────────
// Routes that require a specific minimum role.
// All unlisted dashboard routes default to requiring 'staff' or above.
//
//   owner  → full access
//   staff  → everything except cannot permanently delete financial records
//   cleaner → only /portal/* and /scheduling (read-only view of their jobs)
//
const CLEANER_ALLOWED_PREFIXES = [
  '/portal',      // their job portal (public or auth-gated)
  '/auth',        // login / logout
]

// These routes are completely blocked for the cleaner role.
// Any route not in the allow list above is also blocked, but these are
// explicitly listed for auditability.
const CLEANER_BLOCKED_PREFIXES = [
  '/finance',         // Revenue, invoices, margin data
  '/crm',             // Lead pipeline & client billing
  '/construction',    // Construction CRM (lead values visible)
  '/outreach',        // Prospect contact data
  '/recruitment',     // Applicant PII & AI scores
  '/dashboard',       // Owner KPI overview
  '/settings',        // Platform config
]

type AppRole = 'owner' | 'staff' | 'cleaner'

export async function middleware(request: NextRequest) {
  // Pass through in demo mode (no real Supabase credentials yet)
  if (IS_DEMO) return NextResponse.next({ request })

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session — keeps JWT fresh on every request
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // API routes, public pages, and static assets pass through
  const isPublicRoute = pathname.startsWith('/apply') ||
                        pathname.startsWith('/auth')  ||
                        pathname.startsWith('/api/')  ||
                        pathname === '/'

  // ── 1. Unauthenticated users → redirect to login ──────────────────────────
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // ── 2. Role-based route enforcement ──────────────────────────────────────
  if (user) {
    // Role is stored in app_metadata (set by service role on user creation
    // via the handle_new_user trigger + Supabase admin). Falls back to 'cleaner'
    // (least privilege) if not set — fail-secure.
    const role: AppRole = (user.app_metadata?.role as AppRole) ?? 'cleaner'

    if (role === 'cleaner') {
      const isAllowed = CLEANER_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
      const isBlocked = CLEANER_BLOCKED_PREFIXES.some((p) => pathname.startsWith(p))

      if (isBlocked || !isAllowed) {
        // Send cleaners to their portal instead of showing a 403.
        // The portal URL uses their cleaner_id from app_metadata.
        const cleanerId = (user.app_metadata?.cleaner_id as string) ?? '1'
        const url = request.nextUrl.clone()
        url.pathname = `/portal/${cleanerId}`
        return NextResponse.redirect(url)
      }
    }

    // owner and staff have no route restrictions — RLS handles data scoping.
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
