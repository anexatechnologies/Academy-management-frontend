import { useForm, Controller } from "react-hook-form"
import type { UseFormSetError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FormFooter } from "@/components/ui/form-footer"
import { DatePickerInput } from "@/components/ui/date-picker"
import { ComboBox } from "@/components/ui/combobox"
import { useCourseComboBox, useStaffComboBox } from "@/hooks/use-combobox-data"
import type { Batch } from "@/types/batch"

const timeOrEmpty = z
  .string()
  .optional()
  .refine((val) => !val || /^\d{2}:\d{2}$/.test(val), { message: "Must be a valid time (HH:mm)" })
  .transform((val) => val || null)

const batchSchema = z.object({
  course_id: z.coerce.number().min(1, "Course is required"),
  name: z.string().min(1, "Batch name is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  hall_no: z.string().min(1, "Hall number is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  staff_id: z.coerce.number().min(1, "Staff member is required"),
  ground_start_time: timeOrEmpty,
  ground_end_time: timeOrEmpty,
  lecture_start_time: timeOrEmpty,
  lecture_end_time: timeOrEmpty,
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
          course_id: initialValues.course_id,
          name: initialValues.name,
          capacity: initialValues.capacity,
          hall_no: initialValues.hall_no,
          start_date: initialValues.start_date,
          end_date: initialValues.end_date,
          staff_id: initialValues.staff_id,
          ground_start_time: initialValues.ground_start_time ?? "",
          ground_end_time: initialValues.ground_end_time ?? "",
          lecture_start_time: initialValues.lecture_start_time ?? "",
          lecture_end_time: initialValues.lecture_end_time ?? "",
        }
      : {
          course_id: 0,
          name: "",
          capacity: 0,
          hall_no: "",
          start_date: "",
          end_date: "",
          staff_id: 0,
          ground_start_time: "",
          ground_end_time: "",
          lecture_start_time: "",
          lecture_end_time: "",
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

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 3: Attendance Timings */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
              <div>
                <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Attendance Timings</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Optional. The biometric system uses these times (± 30 min buffer) to determine slot. Leave blank if not applicable.
                </p>
              </div>
            </div>

            {/* Ground Timings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ground Timings</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input
                  {...register("ground_start_time")}
                  type="time"
                  label="Ground Start Time"
                  leftIcon={<Clock className="w-4 h-4 text-emerald-500" />}
                  className="h-10 rounded-lg text-sm"
                  error={errors.ground_start_time?.message}
                  disabled={isLoading}
                />
                <Input
                  {...register("ground_end_time")}
                  type="time"
                  label="Ground End Time"
                  leftIcon={<Clock className="w-4 h-4 text-emerald-500" />}
                  className="h-10 rounded-lg text-sm"
                  error={errors.ground_end_time?.message}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Lecture Timings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </span>
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Lecture Timings</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input
                  {...register("lecture_start_time")}
                  type="time"
                  label="Lecture Start Time"
                  leftIcon={<Clock className="w-4 h-4 text-blue-500" />}
                  className="h-10 rounded-lg text-sm"
                  error={errors.lecture_start_time?.message}
                  disabled={isLoading}
                />
                <Input
                  {...register("lecture_end_time")}
                  type="time"
                  label="Lecture End Time"
                  leftIcon={<Clock className="w-4 h-4 text-blue-500" />}
                  className="h-10 rounded-lg text-sm"
                  error={errors.lecture_end_time?.message}
                  disabled={isLoading}
                />
              </div>
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
