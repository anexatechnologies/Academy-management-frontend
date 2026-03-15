import type { UseFormSetError, FieldValues, Path } from "react-hook-form"
import { toast } from "sonner"
import { isAxiosError } from "axios"

export interface ApiErrorResponse {
  status?: string
  success?: boolean
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

/**
 * Handles backend API errors and correctly maps them to react-hook-form fields
 * or displays a generic toast for unhandled/server errors.
 *
 * @param error The error object caught from the API (usually AxiosError)
 * @param setError The react-hook-form setError function
 */
export const handleApiError = <T extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<T>
) => {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse

    // If it's a validation error with specific fields, map them to the form
    const isError = data.status === "error" || data.success === false
    if (isError && data.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        // We cast the field to Path<T> assuming the backend fields match the form fields
        if (setError) {
          setError(err.field as Path<T>, {
            type: "server",
            message: err.message,
          })
        }
      })
      // Optionally show a generic toast that validation failed
      toast.error(data.message || "Please correct the errors in the form.")
      return
    }

    // If it's a known error format but not field-specific (e.g. 401 Unauthorized or simple message)
    if (data.message) {
      toast.error(data.message)
      return
    }
  }

  // Fallback for generic JS errors or 500s where the format doesn't match
  const fallbackMessage =
    error instanceof Error ? error.message : "An unexpected internal server error occurred"
  toast.error(fallbackMessage)
}
