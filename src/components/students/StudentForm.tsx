import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "@/components/ui/upload"
import { FormFooter } from "@/components/ui/form-footer"
import { DatePickerInput } from "@/components/ui/date-picker"
import { ComboBox } from "@/components/ui/combobox"
import { X } from "lucide-react"
import { studentSchema, type StudentFormValues } from "@/validations/student"
import { GENDER_TYPES, STUDENT_CATEGORIES, RELIGIONS, HEARD_ABOUT_US } from "@/utils/student-constants"
import { useBatchComboBox } from "@/hooks/use-combobox-data"
import { useState } from "react"
import type { UseFormSetError } from "react-hook-form"
import type { Student } from "@/types/student"
import type { Batch } from "@/types/batch"

interface StudentFormProps {
  initialValues?: Student
  onSubmit: (values: StudentFormValues, setError: UseFormSetError<StudentFormValues>) => void
  isLoading?: boolean
  isEdit?: boolean
}

export const StudentForm = ({
  initialValues,
  onSubmit,
  isLoading,
  isEdit,
}: StudentFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: initialValues
      ? {
          ...initialValues,
          batch_ids: [],
        }
      : {
          gender: "Male",
          category: "Open/General",
          nationality: "Indian",
          batch_ids: [],
        },
  })

  // Batch ComboBox for Section 4
  const batchComboBox = useBatchComboBox()
  const [selectedBatches, setSelectedBatches] = useState<Batch[]>([])
  const selectedBatchIds = watch("batch_ids") || []

  const handleBatchSelect = (batchIdStr: string) => {
    if (!batchIdStr) return
    const batchId = Number(batchIdStr)
    if (selectedBatchIds.includes(batchId)) return

    // Find the batch from the combobox options data
    const batch = batchComboBox.rawData?.find((b) => b.id === batchId)
    if (batch) {
      setSelectedBatches((prev) => [...prev, batch])
      setValue("batch_ids", [...selectedBatchIds, batchId])
    }
  }

  const handleBatchRemove = (batchId: number) => {
    setSelectedBatches((prev) => prev.filter((b) => b.id !== batchId))
    setValue("batch_ids", selectedBatchIds.filter((id) => id !== batchId))
  }

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, setError))} className="relative flex flex-col">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative">
        <div className="p-6 md:p-8 pb-24 md:pb-28 space-y-10">

          {/* Section 1: Personal Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Input
                {...register("name")}
                label="Student Name *"
                placeholder="Enter student's full name"
                className="rounded-lg text-sm"
                error={errors.name?.message}
                disabled={isLoading}
              />
              <Input
                {...register("father_husband_name")}
                label="Father / Husband Name"
                placeholder="Enter father or husband name"
                className="rounded-lg text-sm"
                error={errors.father_husband_name?.message}
                disabled={isLoading}
              />
              <Input
                {...register("mother_name")}
                label="Mother Name"
                placeholder="Enter mother's name"
                className="rounded-lg text-sm"
                error={errors.mother_name?.message}
                disabled={isLoading}
              />

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Gender</Label>
                <CustomSelect
                  options={[...GENDER_TYPES]}
                  value={watch("gender") || "Male"}
                  triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                  onValueChange={(value) => setValue("gender", value)}
                  disabled={isLoading}
                  placeholder="Select gender"
                />
                {errors.gender && <p className="text-[11px] text-rose-500 font-medium">{errors.gender.message}</p>}
              </div>

              <Controller
                control={control}
                name="date_of_birth"
                render={({ field }) => (
                  <DatePickerInput
                    label="Date of Birth"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    error={errors.date_of_birth?.message}
                    placeholder="Select date of birth"
                    disabled={isLoading}
                  />
                )}
              />

              <Controller
                control={control}
                name="registration_date"
                render={({ field }) => (
                  <DatePickerInput
                    label="Registration Date"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    error={errors.registration_date?.message}
                    placeholder="Select registration date"
                    disabled={isLoading}
                  />
                )}
              />

              <Input
                {...register("nationality")}
                label="Nationality"
                placeholder="e.g. Indian"
                className="rounded-lg text-sm"
                error={errors.nationality?.message}
                disabled={isLoading}
              />

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Category</Label>
                <CustomSelect
                  options={[...STUDENT_CATEGORIES]}
                  value={watch("category") || "Open/General"}
                  triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                  onValueChange={(value) => setValue("category", value)}
                  disabled={isLoading}
                  placeholder="Select category"
                />
                {errors.category && <p className="text-[11px] text-rose-500 font-medium">{errors.category.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Religion</Label>
                <CustomSelect
                  options={[...RELIGIONS]}
                  value={watch("religion") || ""}
                  triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                  onValueChange={(value) => setValue("religion", value)}
                  disabled={isLoading}
                  placeholder="Select religion"
                />
                {errors.religion && <p className="text-[11px] text-rose-500 font-medium">{errors.religion.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Heard About Us</Label>
                <CustomSelect
                  options={[...HEARD_ABOUT_US]}
                  value={watch("heard_about_us") || ""}
                  triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                  onValueChange={(value) => setValue("heard_about_us", value)}
                  disabled={isLoading}
                  placeholder="Select option"
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  {...register("address")}
                  label="Address"
                  placeholder="Enter residential address"
                  className="min-h-[80px] rounded-lg resize-none text-sm"
                  error={errors.address?.message}
                  disabled={isLoading}
                />
              </div>

              <Input
                {...register("city")}
                label="City"
                placeholder="Enter city"
                className="rounded-lg text-sm"
                error={errors.city?.message}
                disabled={isLoading}
              />
              <Input
                {...register("state")}
                label="State"
                placeholder="Enter state"
                className="rounded-lg text-sm"
                error={errors.state?.message}
                disabled={isLoading}
              />
              <Input
                {...register("pincode")}
                label="Pincode"
                placeholder="Enter pincode"
                className="rounded-lg text-sm"
                error={errors.pincode?.message}
                disabled={isLoading}
              />

              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Photo</Label>
                <Upload
                  className="w-full"
                  accept="image/*"
                  imagePreview={watch("photo_url")}
                  disabled={isLoading}
                  onRemove={() => {
                    setValue("photo_url", "")
                    setValue("photo", undefined)
                  }}
                  onFilesSelected={(files) => {
                    if (files.length > 0) {
                      setValue("photo", files[0])
                      setValue("photo_url", URL.createObjectURL(files[0]))
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 2: Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Input
                {...register("personal_contact")}
                label="Personal Contact *"
                placeholder="+91 00000 00000"
                className="rounded-lg text-sm"
                error={errors.personal_contact?.message}
                disabled={isLoading}
              />
              <Input
                {...register("email")}
                label="Email Address"
                type="email"
                placeholder="student@example.com"
                className="rounded-lg text-sm"
                error={errors.email?.message}
                disabled={isLoading}
              />
              <Input
                {...register("father_contact")}
                label="Father's Contact"
                placeholder="+91 00000 00000"
                className="rounded-lg text-sm"
                error={errors.father_contact?.message}
                disabled={isLoading}
              />
              <Input
                {...register("father_email")}
                label="Father's Email"
                type="email"
                placeholder="father@example.com"
                className="rounded-lg text-sm"
                error={errors.father_email?.message}
                disabled={isLoading}
              />
              <Input
                {...register("mother_contact")}
                label="Mother's Contact"
                placeholder="+91 00000 00000"
                className="rounded-lg text-sm"
                error={errors.mother_contact?.message}
                disabled={isLoading}
              />
              <Input
                {...register("mother_email")}
                label="Mother's Email"
                type="email"
                placeholder="mother@example.com"
                className="rounded-lg text-sm"
                error={errors.mother_email?.message}
                disabled={isLoading}
              />
              <Input
                {...register("reference")}
                label="Reference"
                placeholder="Who referred this student?"
                className="rounded-lg text-sm"
                error={errors.reference?.message}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 3: Academic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Academic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Input
                {...register("school_college_company")}
                label="School / College / Company"
                placeholder="Enter institution name"
                className="rounded-lg text-sm"
                error={errors.school_college_company?.message}
                disabled={isLoading}
              />
              <Input
                {...register("stream")}
                label="Stream"
                placeholder="e.g. Science, Commerce, Arts"
                className="rounded-lg text-sm"
                error={errors.stream?.message}
                disabled={isLoading}
              />
              <Input
                {...register("class_year")}
                label="Class / Year"
                placeholder="e.g. 12th, 1st Year"
                className="rounded-lg text-sm"
                error={errors.class_year?.message}
                disabled={isLoading}
              />
              <Input
                {...register("semester")}
                label="Semester"
                placeholder="e.g. 1st, 2nd"
                className="rounded-lg text-sm"
                error={errors.semester?.message}
                disabled={isLoading}
              />
              <Input
                {...register("university_enrollment_no")}
                label="University Enrollment No."
                placeholder="Enter enrollment number"
                className="rounded-lg text-sm"
                error={errors.university_enrollment_no?.message}
                disabled={isLoading}
              />
            </div>
          </div>

          {!isEdit && (
            <>
              <div className="h-px bg-slate-100 dark:bg-slate-800" />

              {/* Section 4: Batch Selection (only on create) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">4</span>
                  <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Batch Enrollment</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Select Batches</Label>
                    <ComboBox
                      placeholder="Search and select batches..."
                      value=""
                      onValueChange={handleBatchSelect}
                      options={batchComboBox.options.filter(
                        (opt) => !selectedBatchIds.includes(Number(opt.value))
                      )}
                      onSearch={batchComboBox.onSearch}
                      onLoadMore={batchComboBox.onLoadMore}
                      onReset={batchComboBox.onReset}
                      hasMore={batchComboBox.hasMore}
                      isLoading={batchComboBox.isLoading}
                      isLoadingMore={batchComboBox.isLoadingMore}
                      searchPlaceholder="Search batches..."
                      emptyText="No batches found."
                      triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                    />
                  </div>

                  {selectedBatches.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground ml-0.5">
                        {selectedBatches.length} batch{selectedBatches.length > 1 ? "es" : ""} selected
                      </p>
                      <div className="space-y-2">
                        {selectedBatches.map((batch) => (
                          <div
                            key={batch.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                {batch.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{batch.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{batch.course_name}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBatchRemove(batch.id)}
                              disabled={isLoading}
                              className="ml-2 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.batch_ids && <p className="text-[11px] text-rose-500 font-medium">{errors.batch_ids.message}</p>}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Sticky Footer */}
        <div className="sticky -bottom-6 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 pt-4 pb-10 flex items-center justify-end z-[40] rounded-b-xl">
          <FormFooter
            isLoading={isLoading}
            submitLabel={isEdit ? "Update Student" : "Register Student"}
            loadingLabel={isEdit ? "Saving..." : "Registering..."}
            cancelHref="/students"
            className="border-none shadow-none p-0 bg-transparent mt-0"
          />
        </div>
      </div>
    </form>
  )
}
