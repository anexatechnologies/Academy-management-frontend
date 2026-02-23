import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { StaffForm, type StaffFormValues } from "@/components/staff/StaffForm"
import { useCreateStaff } from "@/hooks/api/use-staff"
import { handleApiError } from "@/utils/api-error"
import type { UseFormSetError } from "react-hook-form"

const StaffCreatePage = () => {
  const navigate = useNavigate()
  const createStaff = useCreateStaff()

  const onSubmit = async (values: StaffFormValues, setError: UseFormSetError<StaffFormValues>) => {
    try {
      await createStaff.mutateAsync(values)
      toast.success("Staff registered successfully")
      navigate("/staff")
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const breadcrumbs = [
    { label: "Staff Management", href: "/staff" },
    { label: "Add Staff" },
  ]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Staff</h1>
          <p className="text-sm text-muted-foreground">Register a new teaching or non-teaching staff member.</p>
        </div>
        <StaffForm onSubmit={onSubmit} isLoading={createStaff.isPending} />
      </div>
    </BodyLayout>
  )
}

export default StaffCreatePage
