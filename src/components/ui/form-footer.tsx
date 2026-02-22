import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormFooterProps {
  isLoading?: boolean
  submitLabel?: string
  loadingLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  cancelHref?: string
  className?: string
  fixed?: boolean // If true, fixes to the bottom of the screen instead of flowing with content
}

export function FormFooter({
  isLoading,
  submitLabel = "Save",
  loadingLabel = "Saving...",
  cancelLabel = "Cancel",
  onCancel,
  cancelHref,
  className,
  fixed = false,
}: FormFooterProps) {
  const navigate = useNavigate()

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onCancel) {
      onCancel()
    } else if (cancelHref) {
      navigate(cancelHref)
    } else {
      navigate(-1) // Default fallback: go back
    }
  }

  const containerClasses = cn(
    "flex items-center gap-3 pt-6 border-slate-200 dark:border-slate-800",
    fixed 
      ? "fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t p-4 md:p-6 z-40 md:left-[var(--sidebar-width)] justify-end" 
      : "justify-end border-t mt-8",
    className
  )

  return (
    <div className={containerClasses}>
      {/* Container is explicitly left-aligned (justify-start by default or inherited) */}
      <h3 className="sr-only">Form Actions</h3>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 sm:flex-none h-11 px-8 rounded-xl font-medium shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 sm:flex-none h-11 px-8 rounded-xl font-medium shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {loadingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  )
}
