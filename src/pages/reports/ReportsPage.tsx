import { useState, useMemo } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ReportConfigModal from "./components/ReportConfigModal"
import BodyLayout from "@/components/layout/BodyLayout"
import { FormFooter } from "@/components/ui/form-footer"

export const REPORT_TYPES = [
  { id: "batch-wise", label: "Batch Wise Attendance Report" },
  { id: "date-wise", label: "Date Wise Attendance Report" },
  { id: "student-wise", label: "Student attendance report" },
  { id: "blank-monthly", label: "Blank Monthly Attendance Sheet (Name Wise)" },
  { id: "blank-monthly-reg-wise", label: "Blank Monthly Attendance Sheet (Reg. No. Wise)" },
  { id: "blank-sheet", label: "Blank Attendance Sheet" },
  { id: "monthly-all-batches", label: "Monthly Attendance Report" },
  { id: "student-timing", label: "Student Attendance Timing" },
  { id: "student-summary", label: "Student Attendance Summary" },
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("batch-wise")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleGo = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsModalOpen(true)
  }

  const breadcrumbs = useMemo(() => [
    { label: "Reports" },
  ], [])

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and download standard academy reports.</p>
        </div>

        <form onSubmit={handleGo} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative">
          <div className="p-6 md:p-8 space-y-8 pb-24 md:pb-28">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Select Report Type</h2>
            </div>

            <RadioGroup
              value={selectedReport}
              onValueChange={setSelectedReport}
              className="flex flex-col space-y-4 pl-2"
            >
              {REPORT_TYPES.map((report) => (
                <RadioGroupItem
                  key={report.id}
                  value={report.id}
                  id={report.id}
                  label={report.label}
                  labelClassName="text-sm font-medium leading-[1.3] text-slate-700 dark:text-slate-300"
                />
              ))}
            </RadioGroup>
          </div>

          {/* Improved Sticky Footer */}
          <div className="sticky -bottom-6 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 pt-4 pb-10 flex items-center justify-end z-[40] rounded-b-xl">
            <FormFooter 
              submitLabel="Continue"
              cancelHref="-1"
              className="border-none shadow-none p-0 bg-transparent mt-0"
            />
          </div>
        </form>

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reportId={selectedReport}
        />
      </div>
    </BodyLayout>
  )
}
