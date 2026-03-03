import { useState } from "react"
import { toast } from "sonner"
import { LogOut, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ComboBox } from "@/components/ui/combobox"
import { useStudentComboBox } from "@/hooks/use-combobox-data"
import { CustomSelect } from "@/components/ui/custom-select"
import { useCertificates } from "@/hooks/api/use-certificates"

const TCForm = () => {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [tcNo, setTcNo] = useState("")
  const [reason, setReason] = useState("")
  const [conduct, setConduct] = useState("Good")
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString())
  const [examResult, setExamResult] = useState<"passed" | "failed">("passed")
  const [isDownloading, setIsDownloading] = useState(false)
  const studentComboBox = useStudentComboBox()
  const { downloadCertificate } = useCertificates()

  const handleDownload = async () => {
    if (!studentId) {
      toast.error("Please select a student first")
      return
    }
    if (!tcNo.trim() || !reason.trim() || !examYear.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsDownloading(true)
      await downloadCertificate("tc", {
        student_id: studentId,
        tc_no: tcNo.trim(),
        reason_for_leaving: reason.trim(),
        conduct: conduct.trim(),
        last_exam_year: examYear.trim(),
        last_exam_result: examResult
      }, `tc_${studentId}.pdf`)
      toast.success("Transfer certificate downloaded successfully")
    } catch (error) {
      toast.error("Failed to download transfer certificate")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <LogOut className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Transfer Certificate (TC)</h3>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Generate a TC for students leaving the academy.</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <ComboBox
          label="Select Student"
          required
          options={studentComboBox.options}
          value={studentId || ""}
          onValueChange={setStudentId}
          onSearch={studentComboBox.onSearch}
          onLoadMore={studentComboBox.onLoadMore}
          isLoading={studentComboBox.isLoading}
          hasMore={studentComboBox.hasMore}
          placeholder="Search by name or ID..."
          className="w-full"
          disabled={isDownloading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="TC Number"
            required
            leftIcon={<LogOut className="h-4 w-4" />}
            value={tcNo}
            onChange={(e) => setTcNo(e.target.value)}
            placeholder="e.g. TC/2024/001"
            disabled={isDownloading}
          />
          
          <Input
            label="Reason for Leaving"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Completed HSC, Personal, etc."
            disabled={isDownloading}
          />

          <Input
            label="Conduct / Behavior"
            value={conduct}
            onChange={(e) => setConduct(e.target.value)}
            placeholder="e.g. Good, Excellent, etc."
            disabled={isDownloading}
          />

          <Input
            label="Last Exam Year"
            required
            value={examYear}
            onChange={(e) => setExamYear(e.target.value)}
            placeholder="e.g. 2024"
            disabled={isDownloading}
          />

          <CustomSelect
            label="Last Exam Result"
            required
            options={[
              { label: "Passed", value: "passed" },
              { label: "Failed", value: "failed" },
            ]}
            value={examResult}
            onValueChange={(val) => setExamResult(val as "passed" | "failed")}
            disabled={isDownloading}
            triggerClassName="h-11 rounded-xl bg-white border-slate-200"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleDownload} 
            disabled={!studentId || isDownloading}
            className="h-11 px-8 rounded-xl font-bold transition-all hover:shadow-md active:scale-95"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download TC
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TCForm
