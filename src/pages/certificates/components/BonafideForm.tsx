import { useState } from "react"
import { toast } from "sonner"
import { FileText, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ComboBox } from "@/components/ui/combobox"
import { useStudentComboBox } from "@/hooks/use-combobox-data"
import { useCertificates } from "@/hooks/api/use-certificates"

const BonafideForm = () => {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const studentComboBox = useStudentComboBox()
  const { downloadCertificate } = useCertificates()

  const handleDownload = async () => {
    if (!studentId) {
      toast.error("Please select a student first")
      return
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason for the certificate")
      return
    }

    try {
      setIsDownloading(true)
      await downloadCertificate("bonafide", {
        student_id: studentId,
        reason: reason.trim()
      })
      toast.success("Bonafide certificate opened successfully")
    } catch (error) {
      toast.error("Failed to download bonafide certificate")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Bonafide Certificate</h3>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Generate a bonafide letter for bank, passport, or other applications.</p>
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

        <Textarea
          label="Reason / Purpose"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. For Opening Bank Account, Passport Application, etc."
          className="min-h-[100px] rounded-xl resize-none border-slate-200 focus:ring-primary/20"
          disabled={isDownloading}
        />

        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleDownload} 
            disabled={!studentId || isDownloading}
            className="h-11 px-8 rounded-xl font-bold font-semibold transition-all hover:shadow-md active:scale-95"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                View Certificate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BonafideForm
