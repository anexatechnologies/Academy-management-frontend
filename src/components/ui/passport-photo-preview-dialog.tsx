import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X, ShieldCheck, Sparkles, RefreshCw, ZoomIn } from "lucide-react"

export interface PassportPhotoPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  previewUrl: string | null
  fileSizeKB?: number
  onConfirm: () => void
  onRetake?: () => void
  isRetakeAvailable?: boolean
  title?: string
  description?: string
  confirmLabel?: string
  isReadOnly?: boolean
}

export const PassportPhotoPreviewDialog = ({
  isOpen,
  onClose,
  previewUrl,
  fileSizeKB,
  onConfirm,
  onRetake,
  isRetakeAvailable = false,
  title = "Passport Photo Preview",
  description = "Fixed Passport Size (3.5 cm × 4.5 cm) frame • Auto-cropped & compressed under 200 KB",
  confirmLabel = "Save Photo",
  isReadOnly = false,
}: PassportPhotoPreviewDialogProps) => {
  if (!previewUrl) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          {/* Fixed Passport Frame (3.5 cm × 4.5 cm / 7:9 ratio) */}
          <div className="relative w-[210px] h-[270px] rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-xl bg-slate-100 dark:bg-slate-900 ring-4 ring-primary/10">
            <img
              src={previewUrl}
              alt="Passport Preview"
              className="w-full h-full object-cover select-none"
            />

            {/* Corner guide brackets */}
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white/80 pointer-events-none drop-shadow" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white/80 pointer-events-none drop-shadow" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white/80 pointer-events-none drop-shadow" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white/80 pointer-events-none drop-shadow" />

            {/* Subtle passport dimension badge */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <span className="bg-black/65 backdrop-blur-sm text-[10px] font-semibold text-white px-2.5 py-0.5 rounded-full border border-white/20 shadow-sm">
                3.5 cm × 4.5 cm
              </span>
            </div>
          </div>

          {/* Details / Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{fileSizeKB ? `${fileSizeKB} KB` : "Under 200 KB"}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
              <ZoomIn className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Auto-Fitted & Cropped</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {isReadOnly ? (
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          ) : (
            <>
              {isRetakeAvailable && onRetake && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetake}
                  className="gap-1.5 w-full sm:w-auto"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retake
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="gap-1.5 w-full sm:w-auto"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onConfirm}
                className="gap-1.5 w-full sm:w-auto font-semibold"
              >
                <Check className="h-3.5 w-3.5" />
                {confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
