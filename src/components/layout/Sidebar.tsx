'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronRight,
  HardHat,
  Send,
  ClipboardList,
} from 'lucide-react'
import { clsx } from 'clsx'

const nav = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Recruitment',
    href: '/recruitment',
    icon: Users,
    badge: 'AI',
  },
  {
    label: 'Growth CRM',
    href: '/crm',
    icon: Building2,
  },
  {
    label: 'Scheduling',
    href: '/scheduling',
    icon: CalendarDays,
  },
  {
    label: 'Financials',
    href: '/finance',
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-luxe-100 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-luxe-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-bee flex items-center justify-center text-xl shadow-sm">
          🐝
        </div>
        <div>
          <p className="font-bold text-luxe-900 leading-tight">BeeLuxe</p>
          <p className="text-xs text-luxe-400 leading-tight">Cleaners Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'sidebar-link',
                active && 'active'
              )}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" size={18} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-bee-100 text-bee-700">
                  {item.badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-bee-500" />}
            </Link>
          )
        })}

        <div className="pt-4 pb-1">
          <p className="px-4 text-[10px] font-bold text-luxe-300 uppercase tracking-widest mb-1">
            Sprint 1
          </p>
        </div>

        <Link
          href="/construction"
          className={clsx('sidebar-link', pathname.startsWith('/construction') && 'active')}
        >
          <HardHat size={18} className="shrink-0" />
          <span>Trailer CRM</span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-orange-100 text-orange-700">HTX</span>
        </Link>

        <Link
          href="/outreach"
          className={clsx('sidebar-link', pathname.startsWith('/outreach') && 'active')}
        >
          <Send size={18} className="shrink-0" />
          <span>Outreach</span>
        </Link>

        <Link
          href="/apply"
          target="_blank"
          className="sidebar-link"
        >
          <ClipboardList size={18} className="shrink-0" />
          <span>Apply Link</span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-luxe-100 text-luxe-500">↗</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-luxe-100">
        <Link href="/settings" className="sidebar-link">
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        <div className="mt-3 mx-1 p-3 rounded-xl bg-bee-50 border border-bee-100">
          <p className="text-xs font-semibold text-bee-800">BeeLuxe v1.0</p>
          <p className="text-[11px] text-bee-600 mt-0.5">Business-in-a-Box</p>
        </div>
      </div>
    </aside>
  )
}
