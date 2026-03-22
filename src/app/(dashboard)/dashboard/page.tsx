import { Topbar } from '@/components/layout/Topbar'
import { DashboardStats } from '@/components/ui/DashboardStats'
import { QuickActions } from '@/components/ui/QuickActions'
import { RecentActivity } from '@/components/ui/RecentActivity'
import { UpcomingJobs } from '@/components/ui/UpcomingJobs'

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Command Center"
        subtitle="Welcome back — here's your business snapshot"
      />
      <div className="flex-1 p-6 space-y-6">
        <DashboardStats />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <UpcomingJobs />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  )
}
