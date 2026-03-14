import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { FormFooter } from "@/components/ui/form-footer"
import type { UseFormSetError } from "react-hook-form"
import type { Enquiry } from "@/types/enquiry"

const enquirySchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Last name is required"),
    personal_contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    height: z.string().optional(),
    weight: z.string().optional(),
    education: z.string().optional(),
})

export type EnquiryFormValues = z.infer<typeof enquirySchema>

interface EnquiryFormProps {
    initialValues?: Enquiry
    onSubmit: (values: EnquiryFormValues, setError: UseFormSetError<EnquiryFormValues>) => void
    isLoading?: boolean
    isEdit?: boolean
    cancelHref?: string
}

export function EnquiryForm({
    initialValues,
    onSubmit,
    isLoading,
    isEdit,
    cancelHref = "/enquiries",
}: EnquiryFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<EnquiryFormValues>({
        resolver: zodResolver(enquirySchema),
        defaultValues: initialValues
            ? {
                first_name: initialValues.first_name,
                middle_name: initialValues.middle_name ?? "",
                last_name: initialValues.last_name,
                personal_contact: initialValues.personal_contact,
                email: initialValues.email ?? "",
                height: initialValues.height ?? "",
                weight: initialValues.weight ?? "",
                education: initialValues.education ?? "",
            }
            : {
                first_name: "",
                middle_name: "",
                last_name: "",
                personal_contact: "",
                email: "",
                height: "",
                weight: "",
                education: "",
            },
    })

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
                                placeholder="e.g. 5'8\"
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
