import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { StudentForm } from "@/components/students/StudentForm"
import { useCreateStudent } from "@/hooks/api/use-students"
import { handleApiError } from "@/utils/api-error"
import type { CreateStudentPayload } from "@/types/student"
import type { StudentFormValues } from "@/validations/student"
import type { UseFormSetError } from "react-hook-form"

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
      if (newId != null) {
        navigate(`/students/view/${newId}?tab=financials`)
      } else {
        navigate("/students")
      }
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const breadcrumbs = [
    { label: "Student Management", href: "/students" },
    { label: "Add Student" },
  ]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
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
          onSubmit={onSubmit}
          isLoading={createStudent.isPending}
          enquiryId={enquiryId}
        />
      </div>
    </BodyLayout>
  )
}

export default StudentCreatePage
