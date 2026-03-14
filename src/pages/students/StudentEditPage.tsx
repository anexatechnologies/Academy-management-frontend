import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { StudentForm } from "@/components/students/StudentForm"
import { useStudent, useUpdateStudent } from "@/hooks/api/use-students"
import { handleApiError } from "@/utils/api-error"
import { Loader2 } from "lucide-react"
import type { StudentFormValues } from "@/validations/student"
import type { UseFormSetError } from "react-hook-form"

const StudentEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: student, isLoading: isFetching } = useStudent(Number(id))
  const updateStudent = useUpdateStudent(Number(id))

  const onSubmit = async (values: StudentFormValues, setError: UseFormSetError<StudentFormValues>) => {
    try {
      // Ensure name is string | undefined (not null)
      const fullName = values.name || `${values.first_name} ${values.middle_name} ${values.last_name}`.replace(/\s+/g, " ").trim()
      await updateStudent.mutateAsync({
        ...values,
        name: fullName || undefined,
      })
      toast.success("Student updated successfully")
      navigate("/students")
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const breadcrumbs = [
    { label: "Student Management", href: "/students" },
    { label: "Edit Student" },
  ]

  if (isFetching) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BodyLayout>
    )
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-sm text-muted-foreground">Update student details and information.</p>
        </div>
        {student && (
          <StudentForm
            initialValues={student}
            onSubmit={onSubmit}
            isLoading={updateStudent.isPending}
            isEdit
          />
        )}
      </div>
    </BodyLayout>
  )
}

export default StudentEditPage
