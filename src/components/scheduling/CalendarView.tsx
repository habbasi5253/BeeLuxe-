'use client'

import { useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import type { EventInput, EventClickArg, EventDropArg, DateSelectArg, EventContentArg } from '@fullcalendar/core'
import type { Job } from '@/lib/scheduling'
import { JOB_COLORS } from '@/lib/scheduling'

interface Props {
  jobs: Job[]
  onJobClick: (jobId: string) => void
  onJobDrop: (jobId: string, start: string, end: string) => void
  onNewJobSlot: (slot: { start: string; end: string }) => void
}

function jobToEvent(job: Job): EventInput {
  const color = job.cleaner_id ? JOB_COLORS[job.job_type] : '#94a3b8'
  return {
    id: job.id,
    title: job.title,
    start: job.scheduled_start,
    end: job.scheduled_end,
    backgroundColor: color,
    borderColor: 'transparent',
    extendedProps: {
      job_type: job.job_type,
      cleaner_name: job.cleaner_name,
      status: job.status,
      price: job.price,
      unassigned: !job.cleaner_id,
    },
  }
}

function EventContent({ info }: { info: EventContentArg }) {
  const { cleaner_name, unassigned, status } = info.event.extendedProps as {
    cleaner_name: string | null
    unassigned: boolean
    status: string
  }

  return (
    <div className="px-1.5 py-0.5 overflow-hidden h-full flex flex-col justify-center gap-0.5">
      <div className="text-[11px] font-semibold leading-tight truncate text-white">
        {info.event.title}
      </div>
      <div className="flex items-center gap-1">
        {unassigned ? (
          <span className="text-[9px] font-bold uppercase tracking-wide bg-white/25 text-white rounded px-1">
            Unassigned
          </span>
        ) : cleaner_name ? (
          <span className="text-[9px] text-white/80 truncate">{cleaner_name.split(' ')[0]}</span>
        ) : null}
        {status === 'in_progress' && (
          <span className="text-[9px] font-bold uppercase tracking-wide bg-emerald-400/40 text-white rounded px-1">
            Active
          </span>
        )}
      </div>
    </div>
  )
}

const LEGEND_TYPES: Array<[string, string]> = [
  ['Construction', JOB_COLORS.construction_trailer],
  ['Residential',  JOB_COLORS.residential],
  ['Commercial',   JOB_COLORS.commercial],
  ['Deep Clean',   JOB_COLORS.deep_clean],
  ['Airbnb',       JOB_COLORS.airbnb],
  ['Move In/Out',  JOB_COLORS.move_in_out],
  ['Recurring',    JOB_COLORS.recurring],
  ['Unassigned',   '#94a3b8'],
]

export function CalendarView({ jobs, onJobClick, onJobDrop, onNewJobSlot }: Props) {
  const calRef = useRef<InstanceType<typeof FullCalendar>>(null)

  const handleEventClick = (info: EventClickArg) => {
    onJobClick(info.event.id)
  }

  const handleEventDrop = (info: EventDropArg) => {
    const { id, startStr, endStr } = info.event
    if (!startStr) { info.revert(); return }
    onJobDrop(id, startStr, endStr ?? startStr)
  }

  const handleSelect = (info: DateSelectArg) => {
    onNewJobSlot({ start: info.startStr, end: info.endStr })
    calRef.current?.getApi().unselect()
  }

  return (
    <div className="card h-full !p-0 overflow-hidden flex flex-col">
      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-b border-luxe-100 bg-luxe-50/50">
        {LEGEND_TYPES.map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-xs text-luxe-500">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={jobs.map(jobToEvent)}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          select={handleSelect}
          editable={true}
          selectable={true}
          selectMirror={true}
          height="100%"
          slotMinTime="05:00:00"
          slotMaxTime="22:00:00"
          nowIndicator={true}
          eventDisplay="block"
          dayMaxEvents={3}
          eventContent={(info) => <EventContent info={info} />}
        />
      </div>
    </div>
  )
}
