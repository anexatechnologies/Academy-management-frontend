import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { EnquiryForm, type EnquiryFormValues } from "@/components/enquiries/EnquiryForm"
import { useCreateEnquiry } from "@/hooks/api/use-enquiries"
import { handleApiError } from "@/utils/api-error"
import type { UseFormSetError } from "react-hook-form"

const EnquiryCreatePage = () => {
  const navigate = useNavigate()
  const createEnquiry = useCreateEnquiry()

  const onSubmit = async (
    values: EnquiryFormValues,
    setError: UseFormSetError<EnquiryFormValues>
  ) => {
    try {
      await createEnquiry.mutateAsync(values)
      toast.success("Enquiry registered successfully")
      navigate("/enquiries")
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const breadcrumbs = [
    { label: "Enquiry Management", href: "/enquiries" },
    { label: "Add Enquiry" },
  ]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Enquiry</h1>
          <p className="text-sm text-muted-foreground">
            Register a new prospect enquiry.
          </p>
        </div>
        <EnquiryForm onSubmit={onSubmit} isLoading={createEnquiry.isPending} />
      </div>
    </BodyLayout>
  )
}

export default EnquiryCreatePage
