import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import BodyLayout from "@/components/layout/BodyLayout"
import { CourseForm, type CourseFormValues } from "@/components/courses/CourseForm"
import { useCourse, useUpdateCourse } from "@/hooks/api/use-courses"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { handleApiError } from "@/utils/api-error"
import type { UseFormSetError } from "react-hook-form"

const CourseEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const courseId = parseInt(id || "0")
  
  const { data: course, isLoading } = useCourse(courseId)
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse(courseId)

  const onSubmit = (values: CourseFormValues, setError: UseFormSetError<CourseFormValues>) => {
    updateCourse(values, {
      onSuccess: () => {
        toast.success("Course updated successfully")
        navigate("/courses")
      },
      onError: (err: unknown) => {
        handleApiError(err, setError)
      },
    })
  }

  const breadcrumbs = useMemo(() => [
    { label: "Course Management", href: "/courses" },
    { label: "Edit Course" },
  ], [])

  if (isLoading) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BodyLayout>
    )
  }

  if (!course) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
          <p className="text-slate-500">Course not found.</p>
          <button onClick={() => navigate("/courses")} className="text-primary hover:underline">
            Go back to courses list
          </button>
        </div>
      </BodyLayout>
    )
  }

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Course Information</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update the course details below.
          </p>
        </div>
        <CourseForm
          initialValues={course}
          onSubmit={onSubmit}
          isLoading={isUpdating}
          isEdit
        />
      </div>
    </BodyLayout>
  )
}

export default CourseEditPage
