import { useForm } from "react-hook-form"
import type { UseFormSetError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { Label } from "@/components/ui/label"
import { useRoles } from "@/hooks/api/use-roles"
import { FormFooter } from "@/components/ui/form-footer"

const userSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number (10-15 digits)"),
  role_id: z.string().min(1, "Please select a role"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .optional()
    .or(z.literal("")),
})

export type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
  initialValues?: Partial<UserFormValues>
  onSubmit: (values: UserFormValues, setError: UseFormSetError<UserFormValues>) => void
  isLoading?: boolean
  isEdit?: boolean
}

export const UserForm = ({ initialValues, onSubmit, isLoading, isEdit }: UserFormProps) => {
  const { data: roles, isLoading: isLoadingRoles } = useRoles()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(
      userSchema.refine((data) => {
        if (!isEdit && (!data.password || data.password.length < 8)) {
          return false
        }
        return true
      }, {
        message: "Password is required for new users",
        path: ["password"],
      })
    ),
    defaultValues: {
      full_name: initialValues?.full_name || "",
      username: initialValues?.username || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      role_id: initialValues?.role_id?.toString() || "",
      password: "",
    },
  })

  const selectedRoleId = watch("role_id")

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, setError))} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          placeholder="Enter full name"
          {...register("full_name")}
          error={errors.full_name?.message}
          disabled={isLoading}
        />
        <Input
          label="Username"
          placeholder="Enter username"
          {...register("username")}
          error={errors.username?.message}
          disabled={isLoading}
        />
        <Input
          label="Email Address"
          placeholder="Enter email address"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          disabled={isLoading}
        />
        <Input
          label="Phone Number"
          placeholder="Enter phone number"
          {...register("phone")}
          error={errors.phone?.message}
          disabled={isLoading}
        />
        
        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Role</Label>
          <CustomSelect
            value={selectedRoleId}
            onValueChange={(val) => setValue("role_id", val, { shouldValidate: true })}
            placeholder="Select role"
            isLoading={isLoadingRoles}
            disabled={isLoading}
            triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-900/50 border-slate-200 border shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-primary/40 hover:shadow-sm focus:border-primary focus:ring-[3px] focus:ring-primary/20 transition-all px-3.5 text-base md:text-sm"
            options={(roles || []).map((role) => ({
              value: role.id.toString(),
              label: role.name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            }))}
          />
          {errors.role_id && (
            <p className="text-[11px] font-medium text-rose-500 ml-1 mt-1 transition-all">
              {errors.role_id.message}
            </p>
          )}
        </div>

        <Input
          label={isEdit ? "New Password (Optional)" : "Password"}
          placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
          type="password"
          {...register("password")}
          error={errors.password?.message}
          disabled={isLoading}
        />
      </div>

      <FormFooter
        isLoading={isLoading}
        submitLabel={isEdit ? "Update User" : "Create User"}
        loadingLabel={isEdit ? "Updating..." : "Creating..."}
        cancelHref="/users"
      />
    </form>
  )
}
