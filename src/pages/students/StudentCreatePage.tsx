import { useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { FileText, Loader2, Wallet } from "lucide-react"
import BodyLayout from "@/components/layout/BodyLayout"
import { StudentForm } from "@/components/students/StudentForm"
import { useCreateStudent, useDownloadAdmissionForm } from "@/hooks/api/use-students"
import { usePermissions } from "@/hooks/use-permissions"
import { handleApiError } from "@/utils/api-error"
import type { CreateStudentPayload } from "@/types/student"
import type { StudentFormValues } from "@/validations/student"
import type { UseFormSetError } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function parseCreatedStudentId(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null
  const toNum = (v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v)
    return null
  }
  const o = payload as Record<string, unknown>
  const top = toNum(o.id)
  if (top != null) return top
  const inner = o.data
  if (inner && typeof inner === "object" && "id" in inner) {
    return toNum((inner as { id: unknown }).id)
  }
  return null
}

const StudentCreatePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const enquiryId = searchParams.get("enquiry_id") ? Number(searchParams.get("enquiry_id")) : undefined
  const createStudent = useCreateStudent()
  const { downloadAdmissionForm } = useDownloadAdmissionForm()
  const { canReadStudent, canReadPayments } = usePermissions()

  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [createdStudentId, setCreatedStudentId] = useState<number | null>(null)
  const [isDownloadingForm, setIsDownloadingForm] = useState(false)
  /**
   * When an explicit footer/button closes the dialog we navigate in that handler.
   * If we cleared this ref inside onOpenChange, a second Radix onOpenChange(false) could
   * still run in the same tick and navigate to /students, overriding pending-payments.
   */
  const explicitDialogCloseRef = useRef(false)
  const [formMountKey, setFormMountKey] = useState(0)

  const resetCreateFormAfterSuccess = () => {
    setFormMountKey((k) => k + 1)
    navigate("/students/new", { replace: true })
  }

  const markExplicitDialogClose = () => {
    explicitDialogCloseRef.current = true
    queueMicrotask(() => {
      explicitDialogCloseRef.current = false
    })
  }

  const handleSuccessDialogOpenChange = (open: boolean) => {
    if (open) return
    setSuccessDialogOpen(false)
    if (!explicitDialogCloseRef.current) {
      navigate("/students")
    }
  }

  const finishAndGoToPayments = () => {
    markExplicitDialogClose()
    setSuccessDialogOpen(false)
    navigate("/students/pending-payments")
  }

  const finishAndGoToStudentList = () => {
    markExplicitDialogClose()
    setSuccessDialogOpen(false)
    navigate("/students")
  }

  const onSubmit = async (values: StudentFormValues, setError: UseFormSetError<StudentFormValues>) => {
    try {
      const fullName = values.name || `${values.first_name} ${values.middle_name} ${values.last_name}`.replace(/\s+/g, " ").trim()
      const resolvedEnquiryId = values.enquiry_id ?? enquiryId
      const result = await createStudent.mutateAsync({
        ...values,
        name: fullName,
        ...(resolvedEnquiryId != null ? { enquiry_id: resolvedEnquiryId } : {}),
      } as CreateStudentPayload)
      const newId = parseCreatedStudentId(result)
      toast.success("Student registered successfully")
      resetCreateFormAfterSuccess()
      if (newId != null) {
        setCreatedStudentId(newId)
        setSuccessDialogOpen(true)
      } else {
        navigate("/students")
      }
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const handleDownloadAdmissionForm = async () => {
    if (createdStudentId == null) return
    setIsDownloadingForm(true)
    try {
      await downloadAdmissionForm(createdStudentId)
      toast.success("Admission form opened in new tab")
    } catch {
      toast.error("Failed to download admission form")
    } finally {
      setIsDownloadingForm(false)
    }
  }

  const breadcrumbs = [
    { label: "Student Management", href: "/students" },
    { label: "Add Student" },
  ]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <Dialog open={successDialogOpen} onOpenChange={handleSuccessDialogOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Student registered</DialogTitle>
            <DialogDescription>
              What would you like to do next? You can download the admission form, open pending payments to collect fees, or continue to the student list.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            {canReadStudent && (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center rounded-xl h-11"
                onClick={handleDownloadAdmissionForm}
                disabled={isDownloadingForm || createdStudentId == null}
              >
                {isDownloadingForm ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Download admission form
              </Button>
            )}
            {canReadPayments && (
              <Button
                type="button"
                className="w-full justify-center rounded-xl h-11"
                onClick={finishAndGoToPayments}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Go to pending payments
              </Button>
            )}
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button type="button" variant="ghost" className="rounded-xl" onClick={finishAndGoToStudentList}>
              Skip for now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-sm text-muted-foreground">
            {enquiryId
              ? "Converting enquiry to student — form has been pre-filled with enquiry details."
              : "Register a new student and assign batches."}
          </p>
        </div>
        <StudentForm
          key={formMountKey}
          onSubmit={onSubmit}
          isLoading={createStudent.isPending}
          enquiryId={enquiryId}
        />
      </div>
    </BodyLayout>
  )
}

export default StudentCreatePage
