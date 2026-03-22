import { Topbar } from '@/components/layout/Topbar'
import { CandidateTable } from '@/components/recruitment/CandidateTable'
import { RecruitmentStats } from '@/components/recruitment/RecruitmentStats'
import { NewCandidateButton } from '@/components/recruitment/NewCandidateButton'

export default function RecruitmentPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="AI Recruitment & Vetting"
        subtitle="Automated intake interviews · AI scoring · Smart onboarding"
      />
      <div className="flex-1 p-6 space-y-6">
        <RecruitmentStats />
        <div className="card !p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-luxe-100">
            <div>
              <p className="font-semibold text-luxe-800">Candidate Pipeline</p>
              <p className="text-xs text-luxe-400 mt-0.5">AI-evaluated applicants across all stages</p>
            </div>
            <NewCandidateButton />
          </div>
          <CandidateTable />
        </div>
      </div>
    </div>
  )
}
