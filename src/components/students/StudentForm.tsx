import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "@/components/ui/upload"
import { FormFooter } from "@/components/ui/form-footer"
import { DatePickerInput } from "@/components/ui/date-picker"
import { ComboBox } from "@/components/ui/combobox"
import { X, IndianRupee, Calculator } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { studentSchema, type StudentFormValues } from "@/validations/student"
import { GENDER_TYPES, STUDENT_CATEGORIES, RELIGIONS, HEARD_ABOUT_US } from "@/utils/student-constants"
import { useBatchComboBox } from "@/hooks/use-combobox-data"
import type { EnrolledBatch } from "@/types/student"
import { useFeeSettings } from "@/hooks/api/use-fee-settings"
import { useState, useMemo, useEffect } from "react"
import { differenceInMonths, isValid } from "date-fns"
import { cn } from "@/lib/utils"
import type { UseFormSetError } from "react-hook-form"
import type { Student } from "@/types/student"

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
    resolver: zodResolver(
      studentSchema.refine((data) => isEdit || (data.batch_ids && data.batch_ids.length > 0), {
        message: "At least one batch must be selected",
        path: ["batch_ids"],
      })
    ) as any,
    defaultValues: initialValues
      ? {
          ...Object.fromEntries(
            Object.entries(initialValues).map(([k, v]) => [k, v === null ? "" : v])
          ),
          batch_ids: [],
        } as any
      : {
          gender: "Male",
          category: "Open/General",
          nationality: "Indian",
          batch_ids: [],
        },
  })

  // Batch ComboBox for Section 4
  const batchComboBox = useBatchComboBox()
  const [selectedBatches, setSelectedBatches] = useState<EnrolledBatch[]>([])

  // Sync selected batches when initialValues load
  useEffect(() => {
    if (initialValues?.batches) {
      const normalized = initialValues.batches.map(eb => ({
        id: eb.batch_id,
        name: eb.batch_name,
        course_name: eb.course_name,
        course_fees: eb.course_base_fees,
        is_removable: eb.is_removable,
        start_date: eb.start_date,
        end_date: eb.end_date,
      }))
      setSelectedBatches(normalized as any)
      setValue("batch_ids", initialValues.batches.map(eb => eb.batch_id))
    }
  }, [initialValues, setValue])
  const selectedBatchIds = watch("batch_ids") || []

  const handleBatchSelect = (batchIdStr: string) => {
    if (!batchIdStr) return
    const batchId = Number(batchIdStr)
    if (selectedBatchIds.includes(batchId)) return

    // Find the batch from the combobox options data
    const batch = batchComboBox.rawData?.find((b) => b.id === batchId)
    if (batch) {
      setSelectedBatches((prev) => [...prev, { 
        ...batch, 
        batch_id: batch.id,
        batch_name: batch.name,
        course_base_fees: batch.course_fees,
        is_removable: true 
      } as any])
      setValue("batch_ids", [...selectedBatchIds, batchId])
    }
  }

  const handleBatchRemove = (batchId: number) => {
    const batch = selectedBatches.find(b => b.id === batchId)
    if (batch?.is_removable === false) {
      toast.error("This batch cannot be removed as payment has already started.")
      return
    }
    
    setSelectedBatches((prev) => prev.filter((b) => b.id !== batchId))
    setValue("batch_ids", selectedBatchIds.filter((id) => id !== batchId))
  }

  // Fee calculation logic
  const { data: feeSettings } = useFeeSettings()
  
  const feeSummary = useMemo(() => {
    if (selectedBatches.length === 0) return null

    // 1. One-time calculations (General/Subtotal)
    const subtotal = selectedBatches.reduce((acc, batch) => {
      const baseFee = batch.course_base_fees !== undefined ? batch.course_base_fees : (batch.course_fees || 0)
      const fee = typeof baseFee === "string" ? parseFloat(baseFee) : (baseFee || 0)
      return acc + fee
    }, 0)

    const taxPercent = parseFloat(feeSettings?.tax_percentage || "0")
    const taxAmount = (subtotal * taxPercent) / 100
    const total = subtotal + taxAmount

    // 2. Monthly calculations
    const monthlySubtotal = selectedBatches.reduce((acc, batch) => {
      const baseFee = batch.course_base_fees !== undefined ? batch.course_base_fees : (batch.course_fees || 0)
      const fee = typeof baseFee === "string" ? parseFloat(baseFee) : (baseFee || 0)
      
      const start = new Date(batch.start_date)
      const end = new Date(batch.end_date)
      
      let months = 1
      if (isValid(start) && isValid(end)) {
        // We add 1 to make it inclusive or at least represent the span
        // e.g. Jan 1 to Jan 31 is 1 month. Jan 1 to Feb 28 is 2 months.
        months = Math.max(1, Math.ceil(differenceInMonths(end, start) + 0.1))
      }

      return acc + (fee / months)
    }, 0)

    const monthlyTaxPercent = parseFloat(feeSettings?.monthly_tax_percentage || "0")
    const monthlyTaxAmount = (monthlySubtotal * monthlyTaxPercent) / 100
    const monthlyTotal = monthlySubtotal + monthlyTaxAmount

    return {
      subtotal,
      taxPercent,
      taxAmount,
      total,
      monthlySubtotal,
      monthlyTaxPercent,
      monthlyTaxAmount,
      monthlyTotal,
      feeMode: feeSettings?.fee_mode || "one-time"
    }
  }, [selectedBatches, feeSettings])

  return (
    <TooltipProvider>
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
                label="Student Name"
                required={true}
                placeholder="Enter student's full name"
                className="rounded-lg text-sm"
                error={errors.name?.message}
                disabled={isLoading}
              />
              <Input
                {...register("father_husband_name")}
                label="Father / Husband Name"
                required={true}
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
                <Label 
                  className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5"
                  required={true}
                >
                  Gender
                </Label>
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
                    required={true}
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
                    required={true}
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
                label="Personal Contact"
                required={true}
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

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 4: Batch Enrollment */}
          <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">4</span>
                  <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Batch Enrollment</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label 
                      className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5"
                      required={!isEdit}
                    >
                      Select Batches
                    </Label>
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
                                {(batch.batch_name || batch.name)?.charAt(0) || "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{batch.batch_name || batch.name || "Unknown Batch"}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-muted-foreground truncate">{batch.course_name || "No Course"}</p>
                                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    <IndianRupee className="h-2.5 w-2.5" />
                                    {batch.course_base_fees || batch.course_fees}
                                  </div>
                                </div>
                              </div>
                            </div>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <button
                                   type="button"
                                   onClick={() => handleBatchRemove(batch.id)}
                                   className={cn(
                                     "ml-2 p-1 rounded-md transition-colors shrink-0 cursor-pointer",
                                     batch.is_removable === false 
                                       ? "text-slate-300 dark:text-slate-600" 
                                       : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                   )}
                                   aria-disabled={isLoading || batch.is_removable === false}
                                 >
                                   <X className="h-4 w-4" />
                                 </button>
                               </TooltipTrigger>
                               <TooltipContent side="left" className="bg-slate-900 text-white border-none shadow-xl">
                                 {batch.is_removable === false 
                                   ? "Payment started - Cannot remove" 
                                   : "Remove batch"}
                               </TooltipContent>
                             </Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.batch_ids && <p className="text-[11px] text-rose-500 font-medium">{errors.batch_ids.message}</p>}

                  {/* Dynamic Fee Summary / Fees Structure */}
                  {feeSummary && (
                    <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-primary" />
                          <h3 className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fees Structure</h3>
                        </div>
                        <div className="p-5 space-y-4">
                          {/* One-time Section */}
                          <div className={cn(
                            "space-y-2.5 transition-all duration-300",
                            feeSummary.feeMode !== "one-time" && "opacity-60 scale-[0.98] grayscale-[0.2]"
                          )}>
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Fees :</span>
                                {feeSummary.feeMode !== "one-time" && (
                                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase font-black tracking-tighter">Preview</span>
                                )}
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">Tax ({feeSummary.taxPercent}%) :</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={cn(
                              "flex justify-between items-center p-2.5 rounded-lg transition-all",
                              feeSummary.feeMode === "one-time" 
                                ? "bg-primary/5 dark:bg-primary/10 border border-primary/20 shadow-[0_0_15px_-5px_rgba(var(--primary),0.1)]" 
                                : "bg-slate-50/50 dark:bg-slate-800/30 border border-transparent"
                            )}>
                              <span className={cn(
                                "text-sm font-bold uppercase tracking-tight",
                                feeSummary.feeMode === "one-time" ? "text-primary" : "text-slate-500"
                              )}>Total Amount :</span>
                              <div className={cn(
                                "flex items-center gap-1",
                                feeSummary.feeMode === "one-time" ? "text-primary" : "text-slate-500"
                              )}>
                                <IndianRupee className="h-4 w-4" />
                                <span className="text-lg font-black">{feeSummary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-slate-100 dark:bg-slate-800 mx-1" />

                          {/* Monthly Section */}
                          <div className={cn(
                            "space-y-2.5 transition-all duration-300",
                            feeSummary.feeMode !== "monthly" && "opacity-60 scale-[0.98] grayscale-[0.2]"
                          )}>
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Monthly Fees :</span>
                                {feeSummary.feeMode !== "monthly" && (
                                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase font-black tracking-tighter">Preview</span>
                                )}
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.monthlySubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">Monthly Course Tax ({feeSummary.monthlyTaxPercent}%) :</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.monthlyTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={cn(
                              "flex justify-between items-center p-2.5 rounded-lg transition-all",
                              feeSummary.feeMode === "monthly" 
                                ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)]" 
                                : "bg-blue-50/10 dark:bg-blue-900/5 border border-transparent"
                            )}>
                              <span className={cn(
                                "text-sm font-bold uppercase tracking-tight",
                                feeSummary.feeMode === "monthly" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-500/70"
                              )}>Monthly Course Fees :</span>
                              <div className={cn(
                                "flex items-center gap-1",
                                feeSummary.feeMode === "monthly" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-500/70"
                              )}>
                                <IndianRupee className="h-4 w-4" />
                                <span className="text-lg font-black">{feeSummary.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active System Mode</span>
                          <span className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-sm",
                            feeSummary.feeMode === "monthly" 
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" 
                              : "bg-primary/10 text-primary border border-primary/20"
                          )}>
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full animate-pulse",
                              feeSummary.feeMode === "monthly" ? "bg-emerald-500" : "bg-primary"
                            )} />
                            {feeSummary.feeMode}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
    </TooltipProvider>
  )
}
