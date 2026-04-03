import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { StaffForm, type StaffFormValues } from "@/components/staff/StaffForm"
import { useStaff, useUpdateStaff } from "@/hooks/api/use-staff"
import { handleApiError } from "@/utils/api-error"
import { Loader2 } from "lucide-react"
import type { UseFormSetError } from "react-hook-form"

const StaffEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: staff, isLoading: isFetching } = useStaff(Number(id))
  const updateStaff = useUpdateStaff(Number(id))

  const onSubmit = async (values: StaffFormValues, setError: UseFormSetError<StaffFormValues>) => {
    try {
      await updateStaff.mutateAsync(values)
      toast.success("Staff updated successfully")
      navigate("/staff")
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const breadcrumbs = [
    { label: "Staff Management", href: "/staff" },
    { label: "Edit Staff" },
  ]

  if (isFetching) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BodyLayout>
    )
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Staff</h1>
          <p className="text-sm text-muted-foreground">Update staff member details and information.</p>
        </div>
        {staff && (
          <StaffForm 
            initialValues={staff} 
            onSubmit={onSubmit} 
            isLoading={updateStaff.isPending} 
            isEdit 
          />
        )}
      </div>
    </BodyLayout>
  )
}

export default StaffEditPage
