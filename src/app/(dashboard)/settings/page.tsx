import { Topbar } from '@/components/layout/Topbar'
import { Settings, Key, Bell, Users, Globe } from 'lucide-react'

const sections = [
  { icon: Key, title: 'API Integrations', desc: 'Connect OpenAI, Twilio SMS, Supabase, and AEC data sources' },
  { icon: Bell, title: 'Notification Settings', desc: 'Configure SMS templates, push notification channels' },
  { icon: Users, title: 'Team & Permissions', desc: 'Manage admin access and user roles' },
  { icon: Globe, title: 'Business Profile', desc: 'Company name, address, billing info, tax rates' },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Settings" subtitle="Configure your BeeLuxe platform" />
      <div className="flex-1 p-6 max-w-2xl">
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.title} className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-bee-100 flex items-center justify-center shrink-0">
                <s.icon size={20} className="text-bee-700" />
              </div>
              <div>
                <p className="font-semibold text-luxe-900">{s.title}</p>
                <p className="text-xs text-luxe-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-bee-50 border border-bee-100">
          <p className="text-sm font-semibold text-bee-800 mb-2">Environment Variables Required</p>
          <div className="font-mono text-xs text-bee-700 space-y-1">
            <p>NEXT_PUBLIC_SUPABASE_URL</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
            <p>OPENAI_API_KEY</p>
            <p>TWILIO_ACCOUNT_SID</p>
            <p>TWILIO_AUTH_TOKEN</p>
            <p>TWILIO_PHONE_NUMBER</p>
          </div>
          <p className="text-xs text-bee-600 mt-3">Copy <code className="bg-bee-100 px-1 rounded">.env.local.example</code> to <code className="bg-bee-100 px-1 rounded">.env.local</code> and fill in your keys.</p>
        </div>
      </div>
    </div>
  )
}
