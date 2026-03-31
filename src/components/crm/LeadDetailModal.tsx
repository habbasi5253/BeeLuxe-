'use client'

import { useState } from 'react'
import {
  X, MapPin, Phone, Mail, Calendar, DollarSign, HardHat, MessageSquare,
  Building2, Home, PhoneCall, Send, FileText, CheckCircle, Loader2,
  KeyRound, Camera, AlertTriangle, Trash2
} from 'lucide-react'
import { clsx } from 'clsx'
import type { Lead } from './LeadKanban'

interface Props {
  lead: Lead
  onClose: () => void
  onDelete: (leadId: string) => void
}

const statusOptions = ['new','contacted','qualified','proposal','won','lost']
const statusColors: Record<string, string> = {
  new:       'bg-luxe-100 text-luxe-600',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-bee-100 text-bee-700',
  proposal:  'bg-violet-100 text-violet-700',
  won:       'bg-emerald-100 text-emerald-700',
  lost:      'bg-red-100 text-red-500',
}

const activities = [
  { type: 'call', icon: PhoneCall, text: 'Called Mike Torres — discussed trailer schedule', time: '2 days ago', color: 'text-blue-600 bg-blue-100' },
  { type: 'sms', icon: MessageSquare, text: 'SMS sent: Introduction + pricing sheet', time: '3 days ago', color: 'text-bee-600 bg-bee-100' },
  { type: 'note', icon: FileText, text: 'Lead imported from AEC industry database', time: '5 days ago', color: 'text-luxe-500 bg-luxe-100' },
]

export function LeadDetailModal({ lead, onClose, onDelete }: Props) {
  const [note, setNote] = useState('')
  const [sendingSMS, setSendingSMS] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [status, setStatus] = useState(lead.status)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const typeIcon = { construction_trailer: HardHat, residential: Home, commercial: Building2, industrial: Building2 }
  const Icon = typeIcon[lead.lead_type]

  const handleSendFollowUp = async () => {
    setSendingSMS(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSendingSMS(false)
    setSmsSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-luxe-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mt-0.5">
              <Icon size={20} className="text-orange-700" />
            </div>
            <div>
              <p className="font-bold text-luxe-900 text-lg leading-tight">
                {lead.company_name || lead.contact_name}
              </p>
              {lead.company_name && (
                <p className="text-sm text-luxe-500">{lead.contact_name}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Lead['status'])}
                  className={clsx(
                    'text-xs font-semibold px-2 py-0.5 rounded-lg border-0 cursor-pointer',
                    statusColors[status]
                  )}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s} className="bg-white text-luxe-900 font-normal capitalize">{s}</option>
                  ))}
                </select>
                {lead.aec_project_id && (
                  <span className="text-xs bg-luxe-50 text-luxe-500 px-2 py-0.5 rounded-lg font-mono">
                    {lead.aec_project_id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-0 divide-x divide-luxe-100">
            {/* Left: Details */}
            <div className="p-5 space-y-4">
              <div>
                <p className="label">Contact Info</p>
                <div className="space-y-1.5">
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-luxe-700">
                      <Phone size={13} className="text-luxe-400" />{lead.phone}
                    </div>
                  )}
                  {lead.site_address && (
                    <div className="flex items-start gap-2 text-sm text-luxe-700">
                      <MapPin size={13} className="text-luxe-400 mt-0.5 shrink-0" />
                      <span>{lead.site_address}<br />{lead.city}, {lead.state}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="label">Deal Info</p>
                <div className="space-y-1.5">
                  {lead.project_value && (
                    <div className="flex items-center gap-2 text-sm text-luxe-700">
                      <DollarSign size={13} className="text-luxe-400" />
                      ${lead.project_value.toLocaleString()} estimated value
                    </div>
                  )}
                  {lead.trailer_count && (
                    <div className="flex items-center gap-2 text-sm text-luxe-700">
                      <HardHat size={13} className="text-luxe-400" />
                      {lead.trailer_count} trailers on site
                    </div>
                  )}
                  {lead.next_follow_up && (
                    <div className="flex items-center gap-2 text-sm text-luxe-700">
                      <Calendar size={13} className="text-luxe-400" />
                      Follow-up: {new Date(lead.next_follow_up).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>

              {lead.notes && (
                <div>
                  <p className="label">Notes</p>
                  <p className="text-sm text-luxe-600 leading-relaxed bg-luxe-50 rounded-xl p-3">{lead.notes}</p>
                </div>
              )}

              {/* Site Access — critical for AEC jobs on large construction sites */}
              {lead.lead_type === 'construction_trailer' && (
                <div>
                  <p className="label flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-orange-500" />
                    Site Access
                  </p>
                  {(lead.site_entry_notes || lead.gate_code || lead.trailer_photo_url) ? (
                    <div className="space-y-2 bg-orange-50 border border-orange-100 rounded-xl p-3">
                      {lead.site_entry_notes && (
                        <div className="flex items-start gap-2 text-xs text-orange-900 leading-relaxed">
                          <MapPin size={12} className="text-orange-500 mt-0.5 shrink-0" />
                          <span>{lead.site_entry_notes}</span>
                        </div>
                      )}
                      {lead.gate_code && (
                        <div className="flex items-center gap-2 text-xs text-orange-900 font-mono">
                          <KeyRound size={12} className="text-orange-500 shrink-0" />
                          Gate / Access: <span className="font-bold">{lead.gate_code}</span>
                        </div>
                      )}
                      {lead.trailer_photo_url && (
                        <a
                          href={lead.trailer_photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <Camera size={12} />
                          View Site Map / Trailer Photo ↗
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-xs text-red-600 font-medium">
                      <AlertTriangle size={12} />
                      No site access info — cleaner may not find the trailer. Add entry notes before scheduling.
                    </div>
                  )}
                </div>
              )}

              {/* Auto Follow-Up */}
              <div className="p-3.5 rounded-xl bg-bee-50 border border-bee-100">
                <p className="text-xs font-semibold text-bee-800 mb-2">Automated Follow-Up</p>
                {!smsSent ? (
                  <button
                    onClick={handleSendFollowUp}
                    disabled={sendingSMS}
                    className="btn-primary text-xs py-2 w-full justify-center"
                  >
                    {sendingSMS
                      ? <><Loader2 size={12} className="animate-spin" />Sending SMS…</>
                      : <><Send size={12} />Send Follow-Up SMS</>
                    }
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                    <CheckCircle size={13} />Follow-up SMS sent to {lead.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Activity Feed */}
            <div className="p-5">
              <p className="label mb-3">Activity Timeline</p>
              <div className="space-y-3 mb-4">
                {activities.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', a.color)}>
                      <a.icon size={13} />
                    </div>
                    <div>
                      <p className="text-xs text-luxe-700 leading-snug">{a.text}</p>
                      <p className="text-[10px] text-luxe-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="label mb-2">Add Note</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Log a call, visit, or note…"
                  className="input resize-none"
                />
                <button disabled={!note.trim()} className="btn-secondary text-xs mt-2 w-full justify-center">
                  <FileText size={12} />Log Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-luxe-100 bg-luxe-50/50">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">Delete this lead?</span>
              <button
                onClick={() => onDelete(lead.id)}
                className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Yes, delete
              </button>
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-xl bg-luxe-100 text-luxe-700 text-xs font-semibold hover:bg-luxe-200">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
            >
              <Trash2 size={13} />Delete Lead
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">Close</button>
            <button className="btn-primary">
              <CheckCircle size={14} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
