import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { StudentForm } from "@/components/students/StudentForm"
import { useCreateStudent } from "@/hooks/api/use-students"
import { handleApiError } from "@/utils/api-error"
import type { StudentFormValues } from "@/validations/student"
import type { UseFormSetError } from "react-hook-form"

const StudentCreatePage = () => {
  const navigate = useNavigate()
  const createStudent = useCreateStudent()

  const onSubmit = async (values: StudentFormValues, setError: UseFormSetError<StudentFormValues>) => {
    try {
      // Ensure name is always a string (not null/undefined)
      const fullName = values.name || `${values.first_name} ${values.middle_name} ${values.last_name}`.replace(/\s+/g, " ").trim()
      await createStudent.mutateAsync({
        ...values,
        name: fullName,
      })
      toast.success("Student registered successfully")
      navigate("/students")
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
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-sm text-muted-foreground">Register a new student and assign batches.</p>
        </div>
        <StudentForm onSubmit={onSubmit} isLoading={createStudent.isPending} />
      </div>
    </BodyLayout>
  )
}

export default StudentCreatePage
