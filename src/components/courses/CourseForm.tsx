import { useForm } from "react-hook-form"
import type { UseFormSetError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { FormFooter } from "@/components/ui/form-footer"

const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  fees: z.number().min(0, "Fees must be a positive number"),
})

export type CourseFormValues = z.infer<typeof courseSchema>

interface CourseFormProps {
  initialValues?: Partial<CourseFormValues>
  onSubmit: (values: CourseFormValues, setError: UseFormSetError<CourseFormValues>) => void
  isLoading?: boolean
  isEdit?: boolean
}

export const CourseForm = ({ initialValues, onSubmit, isLoading, isEdit }: CourseFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: initialValues?.name || "",
      fees: initialValues?.fees || 0,
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, setError))} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Input
            label="Course Name"
            required={true}
            placeholder="e.g. Police Training"
            {...register("name")}
            error={errors.name?.message}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Input
            label="Course Fees"
            required={true}
            placeholder="Enter Course Fees"
            {...register("fees", { valueAsNumber: true })}
            error={errors.fees?.message}
            disabled={isLoading}
            maxLength={10}
            onKeyDown={(e) => {
              if (
                !/[0-9.]/.test(e.key) &&
                !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
              ) {
                e.preventDefault()
              }
            }}
          />
        </div>
      </div>

      <FormFooter
        submitLabel={isEdit ? "Update Course" : "Create Course"}
        isLoading={isLoading}
        onCancel={() => window.history.back()}
      />
    </form>
  )
}
