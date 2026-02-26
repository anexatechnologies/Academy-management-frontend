import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { BatchForm, type BatchFormValues } from "@/components/batches/BatchForm"
import { useCreateBatch } from "@/hooks/api/use-batches"
import { handleApiError } from "@/utils/api-error"
import type { UseFormSetError } from "react-hook-form"

const BatchCreatePage = () => {
  const navigate = useNavigate()
  const createBatch = useCreateBatch()

  const onSubmit = async (values: BatchFormValues, setError: UseFormSetError<BatchFormValues>) => {
    try {
      await createBatch.mutateAsync(values)
      toast.success("Batch created successfully")
      navigate("/batches")
    } catch (error) {
      handleApiError(error, setError)
    }
  }

  const breadcrumbs = [
    { label: "Batch Management", href: "/batches" },
    { label: "Add Batch" },
  ]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Batch</h1>
          <p className="text-sm text-muted-foreground">Create a new batch with course assignment and schedule.</p>
        </div>
        <BatchForm onSubmit={onSubmit} isLoading={createBatch.isPending} />
      </div>
    </BodyLayout>
  )
}

export default BatchCreatePage
