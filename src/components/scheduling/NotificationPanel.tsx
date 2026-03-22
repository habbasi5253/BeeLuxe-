'use client'

import { useState } from 'react'
import { Bell, MessageSquare, Send, CheckCircle2, Loader2, Users, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import type { Job, Cleaner } from '@/lib/scheduling'

interface Props {
  jobs: Job[]
  cleaners: Cleaner[]
}

interface LogEntry {
  id: string
  type: 'sms' | 'push'
  recipient: string
  message: string
  sent_at: string
  status: 'sent' | 'delivered' | 'error'
}

const INITIAL_LOG: LogEntry[] = [
  { id: '1', type: 'sms', recipient: 'Maria Gonzalez', message: 'Your job at Apex Trailer #4 starts at 7:00 AM today. Address: 1200 Industrial Blvd, Houston.', sent_at: '2 hours ago', status: 'delivered' },
  { id: '2', type: 'sms', recipient: 'James Wright',   message: 'New job assigned: Greenfield Home — Today 10:30 AM. Reply CONFIRM to acknowledge.', sent_at: '3 hours ago', status: 'delivered' },
]

export function NotificationPanel({ jobs, cleaners }: Props) {
  const [to,       setTo]       = useState('')
  const [message,  setMessage]  = useState('')
  const [sending,  setSending]  = useState(false)
  const [blasting, setBlasting] = useState(false)
  const [log,      setLog]      = useState<LogEntry[]>(INITIAL_LOG)

  const addLog = (entry: Omit<LogEntry, 'id' | 'sent_at'>) =>
    setLog((prev) => [{ ...entry, id: String(Date.now()), sent_at: 'just now' }, ...prev])

  // ── Send custom message ───────────────────────────────────────────────────
  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)

    const targets = to
      ? [cleaners.find((c) => c.id === to)].filter(Boolean) as Cleaner[]
      : cleaners.filter((c) => c.status === 'active')

    await Promise.all(
      targets.map((c) =>
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'custom', phone: c.phone, cleaner_name: c.name, message }),
        })
          .then(async (res) => {
            const data = await res.json()
            addLog({ type: 'sms', recipient: c.name, message, status: res.ok ? 'sent' : 'error' })
          })
          .catch(() => addLog({ type: 'sms', recipient: c.name, message, status: 'error' }))
      )
    )

    setMessage('')
    setSending(false)
  }

  // ── Blast 24hr reminders ──────────────────────────────────────────────────
  const blast24h = async () => {
    setBlasting(true)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()

    const targets = jobs.filter((j) => {
      const d = new Date(j.scheduled_start)
      return d.toDateString() === tomorrowStr && j.cleaner_id && j.cleaner_phone
    })

    if (targets.length === 0) {
      addLog({ type: 'sms', recipient: 'System', message: 'No jobs scheduled for tomorrow with assigned cleaners.', status: 'sent' })
      setBlasting(false)
      return
    }

    await Promise.all(
      targets.map((j) =>
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reminder_24h',
            phone: j.cleaner_phone!,
            cleaner_name: j.cleaner_name!,
            job_title: j.title,
            address: j.address,
            city: j.city,
            start_time: j.scheduled_start,
          }),
        })
          .then(() => addLog({ type: 'sms', recipient: j.cleaner_name!, message: `24h reminder: ${j.title}`, status: 'sent' }))
          .catch(() => addLog({ type: 'sms', recipient: j.cleaner_name!, message: `24h reminder: ${j.title}`, status: 'error' }))
      )
    )

    setBlasting(false)
  }

  const recipientLabel = to
    ? cleaners.find((c) => c.id === to)?.name ?? 'Selected'
    : `All active cleaners (${cleaners.filter((c) => c.status === 'active').length})`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">

      {/* Compose panel */}
      <div className="card flex flex-col gap-4">
        <div>
          <p className="font-semibold text-luxe-800 mb-0.5">Send Custom SMS</p>
          <p className="text-xs text-luxe-400">Push a message to one or all active cleaners via Twilio</p>
        </div>

        {/* 24hr blast shortcut */}
        <button
          onClick={blast24h}
          disabled={blasting}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bee-50 border border-bee-200 text-bee-700 text-sm font-medium hover:bg-bee-100 transition-colors disabled:opacity-60"
        >
          {blasting
            ? <><Loader2 size={14} className="animate-spin" />Sending reminders…</>
            : <><Zap size={14} />Blast 24h Reminders for Tomorrow's Jobs</>
          }
        </button>

        <div className="border-t border-luxe-100" />

        <div>
          <label className="label">Recipient</label>
          <select className="select" value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">All Active Cleaners</option>
            {cleaners.filter((c) => c.status === 'active').map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="label">Message</label>
          <textarea
            className="input resize-none h-36"
            placeholder="Your job at [address] starts at [time]. Reply CONFIRM to acknowledge."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center text-xs text-luxe-400">
          <Users size={13} />
          {recipientLabel}
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="btn-primary justify-center"
        >
          {sending
            ? <><Loader2 size={14} className="animate-spin" />Sending…</>
            : <><Send size={14} />Send SMS</>
          }
        </button>
      </div>

      {/* Log */}
      <div className="card !p-0 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-luxe-100">
          <p className="font-semibold text-luxe-800">Notification Log</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-luxe-50">
          {log.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-luxe-400">No messages sent yet</div>
          )}
          {log.map((n) => (
            <div key={n.id} className="px-5 py-3.5">
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  n.type === 'sms' ? 'bg-bee-100 text-bee-700' : 'bg-blue-100 text-blue-700'
                )}>
                  {n.type === 'sms' ? <MessageSquare size={13} /> : <Bell size={13} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-luxe-800">{n.recipient}</p>
                    <span className={clsx(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                      n.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      n.status === 'error'     ? 'bg-red-100 text-red-600' :
                      'bg-luxe-100 text-luxe-500'
                    )}>
                      {n.status}
                    </span>
                  </div>
                  <p className="text-xs text-luxe-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-luxe-300 mt-1">{n.sent_at}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
