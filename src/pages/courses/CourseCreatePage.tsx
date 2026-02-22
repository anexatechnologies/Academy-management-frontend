import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import BodyLayout from "@/components/layout/BodyLayout"
import { CourseForm, type CourseFormValues } from "@/components/courses/CourseForm"
import { useCreateCourse } from "@/hooks/api/use-courses"
import { toast } from "sonner"
import { handleApiError } from "@/utils/api-error"
import type { UseFormSetError } from "react-hook-form"

const CourseCreatePage = () => {
  const navigate = useNavigate()
  const { mutate: createCourse, isPending } = useCreateCourse()

  const onSubmit = (
    values: CourseFormValues,
    setError: UseFormSetError<CourseFormValues>
  ) => {
    createCourse(values, {
      onSuccess: () => {
        toast.success("Course created successfully")
        navigate("/courses")
      },
      onError: (err: unknown) => {
        handleApiError(err, setError)
      },
    })
  }

  const breadcrumbs = useMemo(() => [
    { label: "Course Management", href: "/courses" },
    { label: "New Course" },
  ], [])

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Course Information</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill in the details below to add a new course to the academy.
          </p>
        </div>
        <CourseForm onSubmit={onSubmit} isLoading={isPending} />
      </div>
    </BodyLayout>
  )
}

export default CourseCreatePage
