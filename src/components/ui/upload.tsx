import * as React from "react"
import { Upload as UploadIcon, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface UploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected?: (files: File[]) => void
  maxFiles?: number
  accept?: string
  imagePreview?: string | null
  onRemove?: () => void
  compactImagePreview?: boolean
}

const Upload = React.forwardRef<HTMLInputElement, UploadProps>(
  ({ className, onFilesSelected, maxFiles = 1, accept, imagePreview, onRemove, compactImagePreview = false, disabled, ...props }, ref) => {
    const [dragActive, setDragActive] = React.useState(false)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const inputRef = React.useRef<HTMLInputElement | null>(null)

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
              compactImagePreview && "aspect-square p-3 rounded-lg",
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
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors", compactImagePreview && "h-9 w-9")}>
              <UploadIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className={cn("text-sm font-medium leading-none", compactImagePreview && "text-xs leading-tight")}>
                {dragActive ? "Drop files here" : "Click or drag to upload"}
              </p>
              <p className={cn("text-xs text-muted-foreground", compactImagePreview && "hidden")}>
                {accept ? `Available formats: ${accept}` : "Any file format"}
              </p>
            </div>
          </div>
        </div>
        )}        {/* Existing Image Preview Card */}
        {imagePreview && selectedFiles.length === 0 && (
          <div className={cn("relative overflow-hidden rounded-xl border bg-slate-50/50 dark:bg-slate-900/50", compactImagePreview && "aspect-square rounded-lg")}>
            <div className={cn("flex items-start justify-between p-3 gap-4", compactImagePreview && "h-full flex-col items-center justify-center gap-2 p-3")}>
              <div className={cn("h-20 w-20 overflow-hidden rounded-lg border bg-white dark:bg-slate-950 shrink-0", compactImagePreview && "h-24 w-24")}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className={cn("flex-1 space-y-1 py-1", compactImagePreview && "flex-none py-0 text-center")}>
                <p className={cn("text-sm font-medium leading-none", compactImagePreview && "text-xs leading-tight")}>Uploaded Photo</p>
                <p className={cn("text-xs text-muted-foreground", compactImagePreview && "hidden")}>Image preview</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0",
                  compactImagePreview && "absolute right-2 top-2 h-7 w-7 rounded-full bg-white/90 shadow-sm dark:bg-slate-950/90"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onRemove) onRemove()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
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
                <div key={index} className={cn("relative overflow-hidden rounded-xl border bg-slate-50/50 dark:bg-slate-900/50", compactImagePreview && "aspect-square rounded-lg")}>
                  <div className={cn("flex items-start justify-between p-3 gap-4", compactImagePreview && "h-full flex-col items-center justify-center gap-2 p-3")}>
                    <div className={cn("h-20 w-20 overflow-hidden rounded-lg border bg-white dark:bg-slate-950 shrink-0", compactImagePreview && "h-24 w-24")}>
                      <img 
                        src={objectUrl || ''} 
                        alt={file.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className={cn("flex-1 space-y-1 py-1 min-w-0", compactImagePreview && "w-full flex-none py-0 text-center")}>
                      <p className={cn("text-sm font-medium leading-none truncate", compactImagePreview && "text-xs leading-tight")}>{file.name}</p>
                      <p className={cn("text-xs text-muted-foreground", compactImagePreview && "hidden")}>
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0",
                        compactImagePreview && "absolute right-2 top-2 h-7 w-7 rounded-full bg-white/90 shadow-sm dark:bg-slate-950/90"
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
