import { Topbar } from '@/components/layout/Topbar'
import { SchedulingHub } from '@/components/scheduling/SchedulingHub'

export default function SchedulingPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Operations & Scheduling Hub"
        subtitle="Cleaner assignments · FullCalendar · SMS & push notifications"
      />
      <div className="flex-1 overflow-hidden p-6">
        <SchedulingHub />
      </div>
    </div>
  )
}
