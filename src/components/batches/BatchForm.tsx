import { useForm, Controller } from "react-hook-form"
import type { UseFormSetError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { FormFooter } from "@/components/ui/form-footer"
import { DatePickerInput } from "@/components/ui/date-picker"
import { ComboBox } from "@/components/ui/combobox"
import { useCourseComboBox, useStaffComboBox } from "@/hooks/use-combobox-data"
import type { Batch } from "@/types/batch"

const batchSchema = z.object({
  course_id: z.coerce.number().min(1, "Course is required"),
  name: z.string().min(1, "Batch name is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  hall_no: z.string().min(1, "Hall number is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  staff_id: z.coerce.number().min(1, "Staff member is required"),
})

export type BatchFormValues = z.infer<typeof batchSchema>

interface BatchFormProps {
  initialValues?: Batch
  onSubmit: (values: BatchFormValues, setError: UseFormSetError<BatchFormValues>) => void
  isLoading?: boolean
  isEdit?: boolean
}

export const BatchForm = ({
  initialValues,
  onSubmit,
  isLoading,
  isEdit,
}: BatchFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema) as any,
    defaultValues: initialValues
      ? {
        ...Object.fromEntries(
          Object.entries(initialValues).map(([k, v]) => [k, v === null ? (typeof initialValues[k as keyof Batch] === 'number' ? 0 : "") : v])
        ),
      } as any
      : {
        course_id: 0,
        name: "",
        capacity: 0,
        hall_no: "",
        start_date: "",
        end_date: "",
        staff_id: 0,
      },
  })

  const courseComboBox = useCourseComboBox()
  const staffComboBox = useStaffComboBox()

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, setError))} className="relative flex flex-col">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative">
        <div className="p-6 md:p-8 pb-24 md:pb-28 space-y-10">
          {/* Section 1: Batch Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Batch Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <ComboBox
                label="Course"
                required={true}
                placeholder="Select a course"
                value={String(watch("course_id") || "")}
                onValueChange={(val) => setValue("course_id", Number(val), { shouldValidate: true })}
                options={courseComboBox.options}
                onSearch={courseComboBox.onSearch}
                onLoadMore={courseComboBox.onLoadMore}
                onReset={courseComboBox.onReset}
                hasMore={courseComboBox.hasMore}
                isLoading={courseComboBox.isLoading}
                isLoadingMore={courseComboBox.isLoadingMore}
                searchPlaceholder="Search courses..."
                emptyText="No courses found."
                disabled={isLoading}
                error={errors.course_id?.message}
              />

              <Input
                {...register("name")}
                label="Batch Name"
                required={true}
                placeholder="e.g. Morning Batch A"
                className="h-10 rounded-lg text-sm"
                error={errors.name?.message}
                disabled={isLoading}
              />

              <Input
                {...register("capacity")}
                label="Batch Capacity"
                required={true}
                type="number"
                placeholder="e.g. 30"
                className="h-10 rounded-lg text-sm"
                error={errors.capacity?.message}
                disabled={isLoading}
              />

              <Input
                {...register("hall_no")}
                label="Hall Number"
                required={true}
                placeholder="e.g. Hall 1A"
                className="h-10 rounded-lg text-sm"
                error={errors.hall_no?.message}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 2: Schedule & Assignment */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Schedule & Assignment</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Controller
                control={control}
                name="start_date"
                render={({ field }) => (
                  <DatePickerInput
                    label="Start Date"
                    required={true}
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    error={errors.start_date?.message}
                    placeholder="Select start date"
                    disabled={isLoading}
                  />
                )}
              />

              <Controller
                control={control}
                name="end_date"
                render={({ field }) => (
                  <DatePickerInput
                    label="End Date"
                    required={true}
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    error={errors.end_date?.message}
                    placeholder="Select end date"
                    disabled={isLoading}
                  />
                )}
              />

              <ComboBox
                label="Assigned Staff"
                required={true}
                placeholder="Select a staff member"
                value={String(watch("staff_id") || "")}
                onValueChange={(val) => setValue("staff_id", Number(val), { shouldValidate: true })}
                options={staffComboBox.options}
                onSearch={staffComboBox.onSearch}
                onLoadMore={staffComboBox.onLoadMore}
                onReset={staffComboBox.onReset}
                hasMore={staffComboBox.hasMore}
                isLoading={staffComboBox.isLoading}
                isLoadingMore={staffComboBox.isLoadingMore}
                searchPlaceholder="Search staff..."
                emptyText="No staff found."
                disabled={isLoading}
                error={errors.staff_id?.message}
              />
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky -bottom-6 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 pt-4 pb-10 flex items-center justify-end z-[40] rounded-b-xl">
          <FormFooter
            isLoading={isLoading}
            submitLabel={isEdit ? "Update Batch" : "Create Batch"}
            loadingLabel={isEdit ? "Saving..." : "Creating..."}
            cancelHref="/batches"
            className="border-none shadow-none p-0 bg-transparent mt-0"
          />
        </div>
      </div>
    </form>
  )
}
