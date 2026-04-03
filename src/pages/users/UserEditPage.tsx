import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import BodyLayout from "@/components/layout/BodyLayout"
import { UserForm, type UserFormValues } from "@/components/users/UserForm"
import { useUser, useUpdateUser } from "@/hooks/api/use-users"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { handleApiError } from "@/utils/api-error"
import type { UseFormSetError } from "react-hook-form"

const UserEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = parseInt(id || "0")

  const { data: user, isLoading } = useUser(userId)
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(userId)

  const onSubmit = (values: UserFormValues, setError: UseFormSetError<UserFormValues>) => {
    // Always send all fields so the backend receives a complete payload.
    // Non–super admins cannot change non-password fields because those inputs are disabled in `UserForm`.
    const payload = {
      full_name: values.full_name,
      username: values.username,
      email: values.email,
      phone: values.phone,
      role_id: parseInt(values.role_id),
      ...(values.password ? { password: values.password } : {}),
    }

    updateUser(payload, {
      onSuccess: () => {
        toast.success("User updated successfully")
        navigate("/users")
      },
      onError: (err: unknown) => {
        handleApiError(err, setError)
      },
    })
  }

  const breadcrumbs = useMemo(() => [
    { label: "User Management", href: "/users" },
    { label: "Edit User" },
  ], [])

  if (isLoading) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BodyLayout>
    )
  }

  if (!user) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
          <p className="text-slate-500">User not found.</p>
          <button onClick={() => navigate("/users")} className="text-primary hover:underline">
            Go back to users list
          </button>
        </div>
      </BodyLayout>
    )
  }

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Account Information</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update the staff account information below.
          </p>
        </div>
        <UserForm
          initialValues={{
            ...user,
            role_id: user.role_id.toString(),
          }}
          onSubmit={onSubmit}
          isLoading={isUpdating}
          isEdit
        />
      </div>
    </BodyLayout>
  )
}

export default UserEditPage
