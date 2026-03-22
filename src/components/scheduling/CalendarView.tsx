'use client'

import { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import type { EventInput, EventClickArg } from '@fullcalendar/core'
import { JobDetailPopup } from './JobDetailPopup'

const jobColors: Record<string, string> = {
  construction_trailer: '#f97316',
  residential: '#3b82f6',
  commercial: '#8b5cf6',
  deep_clean: '#06b6d4',
  recurring: '#10b981',
}

const mockEvents: EventInput[] = [
  {
    id: '1', title: 'Apex Trailer #4 — Maria G.', start: new Date(Date.now() - 2 * 3600000).toISOString(),
    end: new Date(Date.now() - 0 * 3600000).toISOString(),
    color: jobColors.construction_trailer, extendedProps: { type: 'construction_trailer', cleaner: 'Maria Gonzalez', address: '1200 Industrial Blvd, Dallas', price: 380, status: 'in_progress' },
  },
  {
    id: '2', title: 'Greenfield Home — James W.', start: new Date(Date.now() + 3 * 3600000).toISOString(),
    end: new Date(Date.now() + 5 * 3600000).toISOString(),
    color: jobColors.residential, extendedProps: { type: 'residential', cleaner: 'James Wright', address: '405 Oak Lane, Plano', price: 220, status: 'scheduled' },
  },
  {
    id: '3', title: 'Metro Office Suite — Aisha P.', start: new Date(Date.now() + 7 * 3600000).toISOString(),
    end: new Date(Date.now() + 10 * 3600000).toISOString(),
    color: jobColors.commercial, extendedProps: { type: 'commercial', cleaner: 'Aisha Patel', address: '800 Commerce St, Dallas', price: 540, status: 'scheduled' },
  },
  {
    id: '4', title: 'BuildRight Trailer #3 — Maria G.', start: new Date(Date.now() + 24 * 3600000).toISOString(),
    end: new Date(Date.now() + 27 * 3600000).toISOString(),
    color: jobColors.construction_trailer, extendedProps: { type: 'construction_trailer', cleaner: 'Maria Gonzalez', address: '550 Commerce Park Dr, Irving', price: 380, status: 'scheduled' },
  },
  {
    id: '5', title: 'Sunrise Apt Move-Out (Unassigned)', start: new Date(Date.now() + 26 * 3600000).toISOString(),
    end: new Date(Date.now() + 29 * 3600000).toISOString(),
    color: '#94a3b8', extendedProps: { type: 'residential', cleaner: null, address: '222 Riverside Dr, Garland', price: 310, status: 'scheduled' },
  },
  {
    id: '6', title: 'Greenfield Home (Weekly) — James W.', start: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    end: new Date(Date.now() + 7 * 24 * 3600000 + 2 * 3600000).toISOString(),
    color: jobColors.recurring, extendedProps: { type: 'recurring', cleaner: 'James Wright', address: '405 Oak Lane, Plano', price: 180, status: 'scheduled' },
  },
]

export function CalendarView() {
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null)

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info)
  }

  return (
    <div className="card h-full !p-0 overflow-hidden flex flex-col">
      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-luxe-100 bg-luxe-50/50">
        {Object.entries(jobColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-xs text-luxe-500 capitalize">{type.replace('_', ' ')}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-luxe-300" />
          <span className="text-xs text-luxe-500">Unassigned</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={mockEvents}
          eventClick={handleEventClick}
          editable={true}
          selectable={true}
          height="100%"
          slotMinTime="05:00:00"
          slotMaxTime="22:00:00"
          nowIndicator={true}
          eventDisplay="block"
          eventBorderColor="transparent"
          dayMaxEvents={3}
        />
      </div>

      {selectedEvent && (
        <JobDetailPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}
