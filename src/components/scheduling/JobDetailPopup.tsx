'use client'

import { X, MapPin, User, DollarSign, Clock, Send, Bell, Loader2, CheckCircle2 } from 'lucide-react'
import type { EventClickArg } from '@fullcalendar/core'
import { useState } from 'react'
import { clsx } from 'clsx'

interface Props {
  event: EventClickArg
  onClose: () => void
}

const cleaners = ['Maria Gonzalez', 'James Wright', 'Aisha Patel', 'Kevin Okafor', 'Rosa Medina']

export function JobDetailPopup({ event, onClose }: Props) {
  const { title, extendedProps, start, end } = event.event
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified] = useState(false)
  const [assignedCleaner, setAssignedCleaner] = useState(extendedProps.cleaner || '')

  const handleNotify = async () => {
    setNotifying(true)
    await new Promise((r) => setTimeout(r, 1200))
    setNotifying(false)
    setNotified(true)
  }

  const statusColors: Record<string, string> = {
    scheduled: 'bg-luxe-100 text-luxe-600',
    in_progress: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-500',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-luxe-100">
          <p className="font-bold text-luxe-900 text-base">{title}</p>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-luxe-100 text-luxe-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className={clsx('badge', statusColors[extendedProps.status ?? 'scheduled'])}>
              {(extendedProps.status as string)?.replace('_', ' ') ?? 'scheduled'}
            </span>
            <span className="badge bg-luxe-100 text-luxe-600 capitalize">
              {(extendedProps.type as string)?.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-luxe-700">
              <MapPin size={14} className="text-luxe-400" />
              {extendedProps.address as string}
            </div>
            <div className="flex items-center gap-2 text-sm text-luxe-700">
              <Clock size={14} className="text-luxe-400" />
              {start?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} —{' '}
              {end?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-2 text-sm text-luxe-700">
              <DollarSign size={14} className="text-luxe-400" />
              ${extendedProps.price as number} job value
            </div>
          </div>

          {/* Cleaner Assignment */}
          <div>
            <label className="label">Assign Cleaner</label>
            <select
              value={assignedCleaner}
              onChange={(e) => setAssignedCleaner(e.target.value)}
              className="select"
            >
              <option value="">— Unassigned —</option>
              {cleaners.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Notification */}
          {assignedCleaner && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-800 mb-2">Notify {assignedCleaner}</p>
              {!notified ? (
                <button
                  onClick={handleNotify}
                  disabled={notifying}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  {notifying ? (
                    <><Loader2 size={12} className="animate-spin" />Sending notification…</>
                  ) : (
                    <><Bell size={12} />Send SMS + Push Notification</>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 size={13} />
                  Notification sent to {assignedCleaner}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-luxe-100">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button className="btn-primary">Save Assignment</button>
        </div>
      </div>
    </div>
  )
}
