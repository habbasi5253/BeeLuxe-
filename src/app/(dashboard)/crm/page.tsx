import { Topbar } from '@/components/layout/Topbar'
import { CRMStats } from '@/components/crm/CRMStats'
import { LeadKanban } from '@/components/crm/LeadKanban'
import { NewLeadButton } from '@/components/crm/NewLeadButton'

export default function CRMPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Focused Growth Engine"
        subtitle="Construction trailer & residential lead management · AEC data patterns"
      />
      <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
        <CRMStats />
        <div className="flex-1 card !p-0 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between p-5 border-b border-luxe-100 shrink-0">
            <div>
              <p className="font-semibold text-luxe-800">Lead Pipeline</p>
              <p className="text-xs text-luxe-400 mt-0.5">Drag-and-drop kanban · Auto follow-up tracking</p>
            </div>
            <NewLeadButton />
          </div>
          <div className="flex-1 overflow-auto">
            <LeadKanban />
          </div>
        </div>
      </div>
    </div>
  )
}
