'use client'

import { useState } from 'react'
import { CalendarView } from './CalendarView'
import { CleanerRoster } from './CleanerRoster'
import { JobFormModal } from './JobFormModal'
import { NotificationPanel } from './NotificationPanel'
import { clsx } from 'clsx'

type ViewTab = 'calendar' | 'roster' | 'notifications'

export function SchedulingHub() {
  const [tab, setTab] = useState<ViewTab>('calendar')
  const [newJobOpen, setNewJobOpen] = useState(false)

  const tabs: { key: ViewTab; label: string }[] = [
    { key: 'calendar', label: 'Calendar' },
    { key: 'roster', label: 'Cleaner Roster' },
    { key: 'notifications', label: 'Notifications' },
  ]

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Tab bar + action */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white border border-luxe-100 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t.key
                  ? 'bg-bee-500 text-white shadow-sm'
                  : 'text-luxe-600 hover:bg-luxe-50'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setNewJobOpen(true)} className="btn-primary">
          + Schedule Job
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'calendar' && <CalendarView />}
        {tab === 'roster' && <CleanerRoster />}
        {tab === 'notifications' && <NotificationPanel />}
      </div>

      {newJobOpen && <JobFormModal onClose={() => setNewJobOpen(false)} />}
    </div>
  )
}
