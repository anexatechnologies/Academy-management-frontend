import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import BodyLayout from "@/components/layout/BodyLayout"
import { EnquiryForm, type EnquiryFormValues } from "@/components/enquiries/EnquiryForm"
import { useEnquiry, useUpdateEnquiry } from "@/hooks/api/use-enquiries"
import { handleApiError } from "@/utils/api-error"
import type { UseFormSetError } from "react-hook-form"

const EnquiryEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: enquiry, isLoading: isFetching } = useEnquiry(Number(id))
  const updateEnquiry = useUpdateEnquiry(Number(id))

  const onSubmit = async (
    values: EnquiryFormValues,
    setError: UseFormSetError<EnquiryFormValues>
  ) => {
    try {
      await updateEnquiry.mutateAsync(values)
      toast.success("Enquiry updated successfully")
      navigate(`/enquiries/view/${id}`)
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const breadcrumbs = [
    { label: "Enquiry Management", href: "/enquiries" },
    { label: "Edit Enquiry" },
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
          <h1 className="text-2xl font-bold tracking-tight">Edit Enquiry</h1>
          <p className="text-sm text-muted-foreground">Update enquiry details and information.</p>
        </div>
        {enquiry && (
          <EnquiryForm
            initialValues={enquiry}
            onSubmit={onSubmit}
            isLoading={updateEnquiry.isPending}
            isEdit
            cancelHref={`/enquiries/view/${id}`}
          />
        )}
      </div>
    </BodyLayout>
  )
}

export default EnquiryEditPage
