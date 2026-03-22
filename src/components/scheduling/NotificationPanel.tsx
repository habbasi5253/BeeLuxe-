'use client'

import { useState } from 'react'
import { Bell, MessageSquare, Send, CheckCircle2, Loader2, Users } from 'lucide-react'
import { clsx } from 'clsx'

const notifications = [
  { id: '1', type: 'sms', recipient: 'Maria Gonzalez', message: 'Your job at Apex Trailer #4 starts at 7:00 AM tomorrow. Address: 1200 Industrial Blvd, Dallas.', sent_at: '2 hours ago', status: 'delivered' },
  { id: '2', type: 'sms', recipient: 'James Wright', message: 'New job assigned: Greenfield Home Deep Clean — Today 10:30 AM. Confirm receipt.', sent_at: '3 hours ago', status: 'delivered' },
  { id: '3', type: 'push', recipient: 'Aisha Patel', message: 'Schedule update: Metro Office Suite moved to 2:00 PM today.', sent_at: '5 hours ago', status: 'delivered' },
  { id: '4', type: 'sms', recipient: 'Kevin Okafor', message: 'Reminder: Sunrise Apt job tomorrow at 8:00 AM. Please confirm ASAP.', sent_at: '1 day ago', status: 'sent' },
]

const cleaners = ['All Cleaners', 'Maria Gonzalez', 'James Wright', 'Aisha Patel', 'Kevin Okafor', 'Rosa Medina']

export function NotificationPanel() {
  const [to, setTo] = useState('All Cleaners')
  const [type, setType] = useState<'sms' | 'push'>('sms')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sentList, setSentList] = useState(notifications)

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    await new Promise((r) => setTimeout(r, 1100))
    setSentList((prev) => [{
      id: String(Date.now()), type, recipient: to, message, sent_at: 'just now', status: 'sent'
    }, ...prev])
    setMessage('')
    setSending(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Compose */}
      <div className="card flex flex-col gap-4">
        <div>
          <p className="font-semibold text-luxe-800 mb-1">Send Notification</p>
          <p className="text-xs text-luxe-400">Push SMS or in-app alerts to cleaners</p>
        </div>

        <div>
          <label className="label">Recipient</label>
          <select className="select" value={to} onChange={(e) => setTo(e.target.value)}>
            {cleaners.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Channel</label>
          <div className="flex gap-2">
            {(['sms', 'push'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                  type === t
                    ? 'bg-bee-500 border-bee-500 text-white'
                    : 'border-luxe-200 text-luxe-600 hover:bg-luxe-50'
                )}
              >
                {t === 'sms' ? <MessageSquare size={14} /> : <Bell size={14} />}
                {t.toUpperCase()}
              </button>
            ))}
          </div>
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
          {to === 'All Cleaners' ? '5 recipients' : '1 recipient'}
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="btn-primary justify-center"
        >
          {sending ? (
            <><Loader2 size={14} className="animate-spin" />Sending…</>
          ) : (
            <><Send size={14} />Send Notification</>
          )}
        </button>
      </div>

      {/* Log */}
      <div className="card !p-0 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-luxe-100">
          <p className="font-semibold text-luxe-800">Notification Log</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-luxe-50">
          {sentList.map((n) => (
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
                      n.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-luxe-100 text-luxe-500'
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
