import { Topbar } from '@/components/layout/Topbar'
import { OutreachGenerator } from '@/components/outreach/OutreachGenerator'

export default function OutreachPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Outreach Generator"
        subtitle="Auto-generate email & SMS templates from your lead list · Houston area construction & office focus"
      />
      <div className="flex-1 p-6 overflow-auto">
        <OutreachGenerator />
      </div>
    </div>
  )
}
