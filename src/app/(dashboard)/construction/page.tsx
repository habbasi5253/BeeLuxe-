import { Topbar } from '@/components/layout/Topbar'
import { TrailerDashboard } from '@/components/construction/TrailerDashboard'

export default function ConstructionPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Construction Trailer CRM"
        subtitle="Houston & surrounding area · Active sites, project timelines, and cleaning schedules"
      />
      <div className="flex-1 p-6 overflow-auto">
        <TrailerDashboard />
      </div>
    </div>
  )
}
