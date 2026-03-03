import { useState } from "react"
import { toast } from "sonner"
import { Award, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { useCertificates } from "@/hooks/api/use-certificates"

interface StudentCompletionFormProps {
  studentId: string
  courseId: number
  isDownloading: boolean
  setIsDownloading: (val: boolean) => void
}

const StudentCompletionForm = ({ studentId, courseId, isDownloading, setIsDownloading }: StudentCompletionFormProps) => {
  const [grade, setGrade] = useState("O")
  const { downloadCertificate } = useCertificates()

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      await downloadCertificate("completion", {
        student_id: studentId,
        course_id: courseId,
        grade: grade
      }, `completion_${studentId}.pdf`)
      toast.success("Completion certificate downloaded successfully")
    } catch (error) {
      toast.error("Failed to download completion certificate")
    } finally {
      setIsDownloading(false)
    }
  }

  const GRADES = [
    { label: "O (Outstanding)", value: "O" },
    { label: "A+ (Excellent)", value: "A+" },
    { label: "A (Very Good)", value: "A" },
    { label: "B+ (Good)", value: "B+" },
    { label: "B (Fair)", value: "B" },
    { label: "C (Passed)", value: "C" },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Reward Generation</h3>
              <p className="text-xs text-slate-500 font-medium">Finalize the academic award with the student's grade.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <CustomSelect
            label="Student Grade"
            required
            options={GRADES}
            value={grade}
            onValueChange={setGrade}
            disabled={isDownloading}
            triggerClassName="h-12 rounded-xl bg-white border-slate-200 font-semibold uppercase tracking-wider"
          />

          <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="h-12 px-10 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 transition-all hover:shadow-lg active:scale-95 gap-2"
          >
            {isDownloading ? (
               <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Reward
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StudentCompletionForm
