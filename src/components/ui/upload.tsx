import * as React from "react"
import { Upload as UploadIcon, X, FileText, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface UploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected?: (files: File[]) => void
  maxFiles?: number
  accept?: string
  imagePreview?: string | null
  onRemove?: () => void
  variant?: "default" | "photo-square" | "photo-passport"
  onPreviewClick?: () => void
}

const Upload = React.forwardRef<HTMLInputElement, UploadProps>(
  ({ className, onFilesSelected, maxFiles = 1, accept, imagePreview, onRemove, disabled, variant = "default", onPreviewClick, ...props }, ref) => {
    const [dragActive, setDragActive] = React.useState(false)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const isPhotoSquare = variant === "photo-square"
    const isPhotoPassport = variant === "photo-passport"
    const isPhotoVariant = isPhotoSquare || isPhotoPassport
    const photoAspectClass = isPhotoPassport ? "aspect-[7/9]" : isPhotoSquare ? "aspect-square" : ""

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true)
      } else if (e.type === "dragleave") {
        setDragActive(false)
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files).slice(0, maxFiles)
        setSelectedFiles(files)
        if (onFilesSelected) onFilesSelected(files)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        const files = Array.from(e.target.files).slice(0, maxFiles)
        setSelectedFiles(files)
        if (onFilesSelected) onFilesSelected(files)
      }
    }

    const removeFile = (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index)
      setSelectedFiles(newFiles)
      if (onFilesSelected) onFilesSelected(newFiles)
    }

    const onButtonClick = () => {
      inputRef.current?.click()
    }

    return (
      <div className={cn("grid gap-4 w-full", className, disabled && "opacity-50 cursor-not-allowed pointer-events-none")}>
        {/* Hide dropzone if we have reached maxFiles AND there are files selected, OR if there's an image preview */}
        {!(maxFiles === 1 && (selectedFiles.length > 0 || imagePreview)) && (
          <div
            className={cn(
              "relative group cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 p-12 text-center transition-all hover:bg-muted/30 hover:border-primary/30 active:scale-[0.99]",
              isPhotoVariant && cn(photoAspectClass, "p-4"),
              dragActive && "border-primary bg-muted/50 scale-[1.01 shadow-md]",
              selectedFiles.length > 0 && "border-primary/40 bg-primary/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <input
              {...props}
              disabled={disabled}
              ref={(node) => {
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
                inputRef.current = node
              }}
              type="file"
              className="hidden"
              multiple={maxFiles > 1}
              accept={accept}
              onChange={handleChange}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <UploadIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {dragActive
                    ? "Drop photo here"
                    : isPhotoPassport
                      ? "Upload Photo"
                      : "Click or drag to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPhotoPassport
                    ? "Passport size (3.5 × 4.5 cm) • Max 200 KB"
                    : accept
                      ? `Available formats: ${accept}`
                      : "Any file format"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Existing Image Preview Card */}
        {imagePreview && selectedFiles.length === 0 && (
          <div className={cn(
            "relative overflow-hidden rounded-xl border bg-slate-50/50 dark:bg-slate-900/50",
            isPhotoVariant && cn(photoAspectClass, "bg-white dark:bg-slate-950")
          )}>
            <div className={cn("flex items-start justify-between p-3 gap-4", isPhotoVariant && "h-full p-0")}>
              <div
                className={cn(
                  "h-20 w-20 overflow-hidden rounded-lg border bg-white dark:bg-slate-950 shrink-0",
                  isPhotoVariant && "h-full w-full rounded-xl border-0",
                  onPreviewClick && "cursor-pointer"
                )}
                onClick={() => onPreviewClick && onPreviewClick()}
                title={onPreviewClick ? "Click to preview full passport frame" : undefined}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className={cn("flex-1 space-y-1 py-1", isPhotoVariant && "sr-only")}>
                <p className="text-sm font-medium leading-none">Uploaded Photo</p>
                <p className="text-xs text-muted-foreground">Image preview</p>
              </div>

              {isPhotoPassport && (
                <div className="absolute bottom-1.5 inset-x-1.5 flex justify-center pointer-events-none">
                  <span className="bg-black/60 backdrop-blur-xs text-[9px] font-medium text-white px-2 py-0.5 rounded-full border border-white/20">
                    3.5 × 4.5 cm
                  </span>
                </div>
              )}

              <div className={cn(
                "flex items-center gap-1",
                isPhotoVariant && "absolute right-2 top-2"
              )}>
                {onPreviewClick && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-white/90 text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/85 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreviewClick()
                    }}
                    title="Preview passport size"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0",
                    isPhotoVariant && "h-7 w-7 bg-white/90 text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/85"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onRemove) onRemove()
                  }}
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New Selected Files List List/Preview */}
        {selectedFiles.length > 0 && (
          <div className="grid gap-2">
            {selectedFiles.map((file, index) => {
              const isImage = file.type.startsWith("image/")
              // Only create object URL if it's an image to show preview
              const objectUrl = isImage ? URL.createObjectURL(file) : null

              return isImage ? (
                <div key={index} className={cn(
                  "relative overflow-hidden rounded-xl border bg-slate-50/50 dark:bg-slate-900/50",
                  isPhotoVariant && cn(photoAspectClass, "bg-white dark:bg-slate-950")
                )}>
                  <div className={cn("flex items-start justify-between p-3 gap-4", isPhotoVariant && "h-full p-0")}>
                    <div className={cn(
                      "h-20 w-20 overflow-hidden rounded-lg border bg-white dark:bg-slate-950 shrink-0",
                      isPhotoVariant && "h-full w-full rounded-xl border-0"
                    )}>
                      <img
                        src={objectUrl || ''}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className={cn("flex-1 space-y-1 py-1 min-w-0", isPhotoVariant && "sr-only")}>
                      <p className="text-sm font-medium leading-none truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0",
                        isPhotoVariant && "absolute right-2 top-2 bg-white/90 text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/85"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (objectUrl) URL.revokeObjectURL(objectUrl)
                        removeFile(index)
                        if (onRemove) onRemove()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-2 pl-3 text-sm"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)
Upload.displayName = "Upload"

export { Upload }