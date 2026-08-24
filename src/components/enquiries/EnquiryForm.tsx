import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormFooter } from "@/components/ui/form-footer"
import { GENDER_TYPES } from "@/utils/student-constants"
import { ENQUIRY_STREAM_OPTIONS } from "@/utils/enquiry-constants"
import { useNextEnquiryNumber } from "@/hooks/api/use-enquiries"
import { cn } from "@/lib/utils"
import type { UseFormSetError, SubmitHandler } from "react-hook-form"
import type { Enquiry } from "@/types/enquiry"

const enquirySchema = z.object({
    enquiry_number: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Last name is required"),
    personal_contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    height: z.string().optional(),
    weight: z.string().optional(),
    education: z.string().optional(),
    gender: z.string().optional().or(z.literal("")),
    parents_contact: z.string().optional().or(z.literal("")).refine(
        (val) => !val || (val.length >= 10 && val.length <= 15),
        "Parents contact must be between 10 and 15 digits"
    ),
    caste: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    interested_courses: z.array(z.string()).optional(),
    other_course_text: z.string().optional(),
})

export type EnquiryFormValues = z.infer<typeof enquirySchema>

interface EnquiryFormProps {
    initialValues?: Enquiry
    onSubmit: (values: EnquiryFormValues, setError: UseFormSetError<EnquiryFormValues>) => void
    isLoading?: boolean
    isEdit?: boolean
    cancelHref?: string
}

const getInitialCourseValues = (rawCourses?: string[]) => {
    const courses = rawCourses ?? []
    const standardStreams = (ENQUIRY_STREAM_OPTIONS as readonly string[]).filter((opt) => opt !== "Other")
    const selected = new Set<string>()
    let otherText = ""

    courses.forEach((course) => {
        if (standardStreams.includes(course)) {
            selected.add(course)
        } else {
            selected.add("Other")
            otherText = course
        }
    })

    return {
        interested_courses: Array.from(selected),
        other_course_text: otherText,
    }
}

export function EnquiryForm({
    initialValues,
    onSubmit,
    isLoading,
    isEdit,
    cancelHref = "/enquiries",
}: EnquiryFormProps) {
    const initialCourses = getInitialCourseValues(initialValues?.interested_courses)
    const { data: nextData } = useNextEnquiryNumber(!isEdit)

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        setError,
        formState: { errors },
    } = useForm<EnquiryFormValues>({
        resolver: zodResolver(enquirySchema),
        defaultValues: initialValues
            ? {
                enquiry_number: initialValues.enquiry_number ?? "",
                first_name: initialValues.first_name,
                middle_name: initialValues.middle_name ?? "",
                last_name: initialValues.last_name,
                personal_contact: initialValues.personal_contact,
                email: initialValues.email ?? "",
                height: initialValues.height ?? "",
                weight: initialValues.weight ?? "",
                education: initialValues.education ?? "",
                gender: initialValues.gender ?? "",
                parents_contact: initialValues.parents_contact ?? "",
                caste: initialValues.caste ?? "",
                address: initialValues.address ?? "",
                interested_courses: initialCourses.interested_courses,
                other_course_text: initialCourses.other_course_text,
            }
            : {
                enquiry_number: "",
                first_name: "",
                middle_name: "",
                last_name: "",
                personal_contact: "",
                email: "",
                height: "",
                weight: "",
                education: "",
                gender: "Male",
                parents_contact: "",
                caste: "",
                address: "",
                interested_courses: [],
                other_course_text: "",
            },
    })

    // Safely sync React Hook Form fields when async initialValues load in edit mode
    useEffect(() => {
        if (initialValues?.interested_courses) {
            const { interested_courses, other_course_text } = getInitialCourseValues(initialValues.interested_courses)
            setValue("interested_courses", interested_courses)
            setValue("other_course_text", other_course_text)
        }
        if (initialValues?.enquiry_number) {
            setValue("enquiry_number", initialValues.enquiry_number)
        }
    }, [initialValues?.id, initialValues?.enquiry_number, setValue])

    // Auto-fill enquiry number when creating new enquiry
    useEffect(() => {
        if (!isEdit && nextData?.next_enquiry_number) {
            setValue("enquiry_number", nextData.next_enquiry_number)
        }
    }, [isEdit, nextData, setValue])

    const interestedCoursesValue = watch("interested_courses") || []

    const handleFormSubmit: SubmitHandler<EnquiryFormValues> = (data) => {
        const rawSelected = data.interested_courses || []
        const otherText = (data.other_course_text || "").trim()

        let finalCourses = rawSelected.filter((c) => c !== "Other")
        if (rawSelected.includes("Other")) {
            if (otherText) {
                finalCourses.push(otherText)
            } else {
                finalCourses.push("Other")
            }
        }

        const { other_course_text, ...payload } = data
        onSubmit({ ...payload, interested_courses: finalCourses }, setError)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="relative flex flex-col">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative">
                <div className="p-6 md:p-8 pb-24 md:pb-28 space-y-10">

                    {/* Auto Tracking Status Header Badge (Create Mode) */}
                    {!isEdit && nextData && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Auto-Numbering Tracking Active
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <span>Last Enquiry No:</span>
                                <span className="font-mono font-bold text-primary px-2.5 py-1 bg-primary/10 rounded-lg border border-primary/20 text-xs">
                                    {nextData.last_enquiry_number || "None (First Record)"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Personal Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
                            <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <Input
                                {...register("enquiry_number")}
                                label="Enquiry No."
                                placeholder="e.g. Enq/2026/1"
                                className="h-10 rounded-lg text-sm font-mono font-semibold text-slate-900 dark:text-slate-100"
                                error={errors.enquiry_number?.message}
                                disabled={isLoading}
                            />
                            <Input
                                {...register("first_name")}
                                label="First Name"
                                required
                                placeholder="Enter first name"
                                className="h-10 rounded-lg text-sm"
                                error={errors.first_name?.message}
                                disabled={isLoading}
                            />
                            <Input
                                {...register("middle_name")}
                                label="Middle Name"
                                placeholder="Enter middle name (optional)"
                                className="h-10 rounded-lg text-sm"
                                error={errors.middle_name?.message}
                                disabled={isLoading}
                            />
                            <Input
                                {...register("last_name")}
                                label="Last Name"
                                required
                                placeholder="Enter last name"
                                className="h-10 rounded-lg text-sm"
                                error={errors.last_name?.message}
                                disabled={isLoading}
                            />
                            <Input
                                {...register("education")}
                                label="Education"
                                placeholder="e.g. SSC, HSC, Graduate"
                                className="h-10 rounded-lg text-sm"
                                error={errors.education?.message}
                                disabled={isLoading}
                            />
                            <div className="md:col-span-1">
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelect
                                            label="Gender"
                                            placeholder="Select gender"
                                            options={GENDER_TYPES as any}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            error={errors.gender?.message}
                                            disabled={isLoading}
                                        />
                                    )}
                                />
                            </div>
                            <Input
                                {...register("caste")}
                                label="Caste"
                                placeholder="Enter caste"
                                className="h-10 rounded-lg text-sm"
                                error={errors.caste?.message}
                                disabled={isLoading}
                            />
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
                                label="Contact Number"
                                required
                                placeholder="Enter 10-digit number"
                                className="h-10 rounded-lg text-sm"
                                maxLength={10}
                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10)
                                }}
                                error={errors.personal_contact?.message}
                                disabled={isLoading}
                            />
                            <Input
                                {...register("email")}
                                label="Email Address"
                                type="email"
                                placeholder="enquiry@example.com"
                                className="h-10 rounded-lg text-sm"
                                error={errors.email?.message}
                                disabled={isLoading}
                            />
                            <Input
                                {...register("parents_contact")}
                                label="Parents Contact"
                                placeholder="Enter 10-15 digit number"
                                className="h-10 rounded-lg text-sm"
                                maxLength={15}
                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 15)
                                }}
                                error={errors.parents_contact?.message}
                                disabled={isLoading}
                            />
                            <div className="md:col-span-2">
                                <Textarea
                                    {...register("address")}
                                    label="Address"
                                    placeholder="Enter full address"
                                    className="min-h-[100px] resize-none rounded-xl text-sm"
                                    error={errors.address?.message}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Section 3: Physical Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
                            <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Physical Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <Input
                                {...register("height")}
                                label="Height"
                                placeholder="e.g. 5'8"
                                className="h-10 rounded-lg text-sm"
                                error={errors.height?.message}
                                disabled={isLoading}
                            />
                            <Input
                                {...register("weight")}
                                label="Weight"
                                placeholder="e.g. 65 kg"
                                className="h-10 rounded-lg text-sm"
                                error={errors.weight?.message}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Section 4: Interested Courses / Streams */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">4</span>
                            <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Interested Courses / Streams</h2>
                        </div>

                        <Controller
                            name="interested_courses"
                            control={control}
                            render={({ field }) => {
                                const selectedList = field.value || []
                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {ENQUIRY_STREAM_OPTIONS.map((stream) => {
                                            const isChecked = selectedList.includes(stream)
                                            const inputId = `enquiry-stream-${stream.replace(/\s+/g, "-").toLowerCase()}`
                                            
                                            const handleToggle = () => {
                                                const next = isChecked
                                                    ? selectedList.filter((item) => item !== stream)
                                                    : [...selectedList, stream]
                                                field.onChange(next)
                                            }

                                            return (
                                                <label
                                                    key={stream}
                                                    htmlFor={inputId}
                                                    className={cn(
                                                        "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer select-none",
                                                        isChecked
                                                            ? "bg-primary/5 border-primary/40 text-primary dark:bg-primary/10"
                                                            : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                                                        isLoading && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <Checkbox
                                                        id={inputId}
                                                        checked={isChecked}
                                                        onCheckedChange={handleToggle}
                                                        disabled={isLoading}
                                                        className="h-4 w-4 shrink-0"
                                                    />
                                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                        {stream}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )
                            }}
                        />

                        {/* Dynamic "Other" Course Input */}
                        {interestedCoursesValue.includes("Other") && (
                            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in duration-200">
                                <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                                    Specify Other Course / Stream <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    {...register("other_course_text")}
                                    placeholder="Enter custom course or stream name..."
                                    className="h-10 rounded-lg text-sm bg-white dark:bg-slate-900"
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="sticky -bottom-6 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 pt-4 pb-10 flex items-center justify-end z-[40] rounded-b-xl">
                    <FormFooter
                        isLoading={isLoading}
                        submitLabel={isEdit ? "Update Enquiry" : "Register Enquiry"}
                        loadingLabel={isEdit ? "Saving..." : "Registering..."}
                        cancelHref={cancelHref}
                        className="border-none shadow-none p-0 bg-transparent mt-0"
                    />
                </div>
            </div>
        </form>
    )
}
