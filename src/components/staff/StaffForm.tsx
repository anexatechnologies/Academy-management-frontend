import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Upload } from "@/components/ui/upload"
import { FormFooter } from "@/components/ui/form-footer"
import { DatePickerInput } from "@/components/ui/date-picker"
import { Controller } from "react-hook-form"
import { STAFF_TYPES, STAFF_CATEGORIES, STAFF_EDUCATION } from "@/utils/staff-constants"
import type { UseFormSetError } from "react-hook-form"
import type { Staff, StaffType, StaffCategory, StaffEducation } from "@/types/staff"

const staffSchema = z.object({
  staff_type: z.enum(["Teaching", "Non-Teaching"]),
  full_name: z.string().min(1, "Full name is required"),
  photo: z.instanceof(File).optional(),
  photo_url: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  contact_number: z.string().min(10, "Contact number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  category: z.enum(["General", "OBC", "SC", "ST", "Other"]),
  remarks: z.string().optional(),
  joining_date: z.string().min(1, "Joining date is required"),
  education: z.enum(["SSC", "HSC", "Diploma", "Graduate", "Post Graduate", "PhD", "Other"]),
  experience_years: z.coerce.number().min(0, "Experience cannot be negative"),
  last_employer: z.string().optional(),
})

export type StaffFormValues = z.infer<typeof staffSchema>

interface StaffFormProps {
  initialValues?: Staff
  onSubmit: (values: StaffFormValues, setError: UseFormSetError<StaffFormValues>) => void
  isLoading?: boolean
  isEdit?: boolean
}

export const StaffForm = ({ 
  initialValues, 
  onSubmit, 
  isLoading, 
  isEdit 
}: StaffFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema) as any,
    defaultValues: initialValues ? {
      ...initialValues,
      experience_years: Number(initialValues.experience_years),
    } : {
      staff_type: "Teaching",
      category: "General",
      education: "SSC",
      experience_years: 0,
    },
  })

  const staffType = watch("staff_type")

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, setError))} className="relative flex flex-col">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative">
        <div className="p-6 md:p-8 pb-24 md:pb-28 space-y-10">
          {/* Section 1: Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-3">
                <Label 
                  className="text-[13px] font-semibold text-slate-700 dark:text-slate-300"
                  required={true}
                >
                  Staff Type
                </Label>
                <RadioGroup
                  value={staffType}
                  onValueChange={(value) => setValue("staff_type", value as StaffType)}
                  className="flex flex-row gap-8 pt-1"
                  disabled={isLoading}
                >
                  {STAFF_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={type.value} 
                        id={`type-${type.value}`} 
                        className="h-4 w-4 border-slate-300 dark:border-slate-700 text-primary focus-visible:ring-0 focus-visible:ring-offset-0" 
                      />
                      <Label htmlFor={`type-${type.value}`} className="text-sm font-medium cursor-pointer text-slate-600 dark:text-slate-400">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.staff_type && <p className="text-[11px] text-rose-500 font-medium">{errors.staff_type.message}</p>}
              </div>

              <Input
                {...register("full_name")}
                label="Full Name"
                required={true}
                placeholder="Enter full name"
                className="h-10 rounded-lg text-sm"
                error={errors.full_name?.message}
                disabled={isLoading}
              />

              <div className="md:col-span-2 space-y-2">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Photo Profile</Label>
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
            
            <div className="space-y-6">
              <Textarea 
                {...register("address")}
                label="Address"
                placeholder="Enter residential address"
                className="min-h-[80px] rounded-lg resize-none text-sm"
                error={errors.address?.message}
                disabled={isLoading}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input
                  {...register("contact_number")}
                  label="Contact Number"
                  placeholder="+91 00000 00000"
                  className="h-10 rounded-lg text-sm"
                  error={errors.contact_number?.message}
                  disabled={isLoading}
                />
                <Input
                  {...register("email")}
                  label="Email Address"
                  type="email"
                  placeholder="john.doe@example.com"
                  className="h-10 rounded-lg text-sm"
                  error={errors.email?.message}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 3: Personal Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Personal Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Category</Label>
                <CustomSelect
                  options={[...STAFF_CATEGORIES]}
                  value={watch("category")}
                  triggerClassName="w-full h-10 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                  onValueChange={(value) => setValue("category", value as StaffCategory)}
                  disabled={isLoading}
                />
                {errors.category && <p className="text-[11px] text-rose-500 font-medium">{errors.category.message}</p>}
              </div>
              <div className="md:col-span-2">
                <Textarea 
                  {...register("remarks")}
                  label="Remarks"
                  placeholder="Any additional notes"
                  className="min-h-[80px] rounded-lg resize-none text-sm"
                  error={errors.remarks?.message}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 4: Professional Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">4</span>
              <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Professional Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Controller
                control={control}
                name="joining_date"
                render={({ field }) => (
                  <DatePickerInput
                    label="Joining Date"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    error={errors.joining_date?.message}
                    placeholder="Select joining date"
                    disabled={isLoading}
                  />
                )}
              />
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Education Qualification</Label>
                <CustomSelect
                  options={[...STAFF_EDUCATION]}
                  value={watch("education")}
                  triggerClassName="w-full h-10 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                  onValueChange={(value) => setValue("education", value as StaffEducation)}
                  disabled={isLoading}
                />
                {errors.education && <p className="text-[11px] text-rose-500 font-medium">{errors.education.message}</p>}
              </div>
              <Input
                {...register("experience_years")}
                label="Years of Experience"
                type="number"
                placeholder="0"
                className="h-10 rounded-lg text-sm"
                error={errors.experience_years?.message}
                disabled={isLoading}
              />
              <Input
                {...register("last_employer")}
                label="Last Employer"
                placeholder="N/A if fresh join"
                className="h-10 rounded-lg text-sm"
                error={errors.last_employer?.message}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Improved Sticky Footer */}
        <div className="sticky -bottom-6 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 pt-4 pb-10 flex items-center justify-end z-[40] rounded-b-xl">
          <FormFooter 
            isLoading={isLoading} 
            submitLabel={isEdit ? "Update Profile" : "Register Staff"}
            loadingLabel={isEdit ? "Saving..." : "Registering..."}
            cancelHref="/staff"
            className="border-none shadow-none p-0 bg-transparent mt-0"
          />
        </div>
      </div>
    </form>
  )
}
