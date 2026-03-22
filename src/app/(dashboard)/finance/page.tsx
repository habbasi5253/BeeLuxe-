import { Topbar } from '@/components/layout/Topbar'
import { FinanceDashboard } from '@/components/finance/FinanceDashboard'

export default function FinancePage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Financial Intelligence"
        subtitle="Revenue per client · Contractor payouts · Gross margin reporting"
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <FinanceDashboard />
      </div>
    </div>
  )
}
