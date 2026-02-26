import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { BatchForm, type BatchFormValues } from "@/components/batches/BatchForm"
import { useBatch, useUpdateBatch } from "@/hooks/api/use-batches"
import { handleApiError } from "@/utils/api-error"
import { Loader2 } from "lucide-react"
import type { UseFormSetError } from "react-hook-form"

const BatchEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: batch, isLoading: isFetching } = useBatch(Number(id))
  const updateBatch = useUpdateBatch(Number(id))

  const onSubmit = async (values: BatchFormValues, setError: UseFormSetError<BatchFormValues>) => {
    try {
      await updateBatch.mutateAsync(values)
      toast.success("Batch updated successfully")
      navigate("/batches")
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const breadcrumbs = [
    { label: "Batch Management", href: "/batches" },
    { label: "Edit Batch" },
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
          <h1 className="text-2xl font-bold tracking-tight">Edit Batch</h1>
          <p className="text-sm text-muted-foreground">Update batch details and schedule information.</p>
        </div>
        {batch && (
          <BatchForm
            initialValues={batch}
            onSubmit={onSubmit}
            isLoading={updateBatch.isPending}
            isEdit
          />
        )}
      </div>
    </BodyLayout>
  )
}

export default BatchEditPage
