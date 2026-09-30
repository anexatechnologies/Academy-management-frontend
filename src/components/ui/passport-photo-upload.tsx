import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload } from "@/components/ui/upload"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import { processPassportPhoto, type ProcessedPassportPhoto } from "@/utils/image-processing"
import { PassportPhotoPreviewDialog } from "@/components/ui/passport-photo-preview-dialog"
import { PassportCameraDialog } from "@/components/ui/passport-camera-dialog"
import { cn } from "@/lib/utils"

export interface PassportPhotoUploadProps {
  value?: File | null
  previewUrl?: string | null
  onChange: (file?: File, previewUrl?: string) => void
  disabled?: boolean
  label?: string
  sublabel?: string
  className?: string
  entityName?: string
}

export const PassportPhotoUpload = ({
  value,
  previewUrl,
  onChange,
  disabled = false,
  label = "Photo",
  sublabel = "Passport (3.5 × 4.5 cm)",
  className,
  entityName = "photo",
}: PassportPhotoUploadProps) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPhotoViewOnly, setIsPhotoViewOnly] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState<ProcessedPassportPhoto | null>(null)

  const [uploadKey, setUploadKey] = useState(0)

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      try {
        const result = await processPassportPhoto(files[0], `${entityName}_passport.jpg`)
        setPendingPhoto(result)
        setIsPhotoViewOnly(false)
        setIsPreviewOpen(true)
      } catch (err) {
        console.error("Error processing photo:", err)
        toast.error("Could not process photo. Please choose another image.")
        setUploadKey((prev) => prev + 1)
      }
    }
  }

  const handlePreviewExistingPhoto = () => {
    if (previewUrl) {
      setPendingPhoto({
        file: value || new File([], "passport.jpg"),
        previewUrl: previewUrl,
        sizeKB: value ? Number((value.size / 1024).toFixed(1)) : 0,
        width: 700,
        height: 900,
      })
      setIsPhotoViewOnly(true)
      setIsPreviewOpen(true)
    }
  }

  const handleConfirmSave = () => {
    if (pendingPhoto) {
      onChange(pendingPhoto.file, pendingPhoto.previewUrl)
      setIsPreviewOpen(false)
      toast.success(`Passport photo saved (${pendingPhoto.sizeKB} KB)`)
      setPendingPhoto(null)
    }
  }

  const handleCameraCaptureSave = (file: File, url: string, sizeKB: number) => {
    onChange(file, url)
    toast.success(`Passport photo saved (${sizeKB} KB)`)
  }

  return (
    <>
      <div
        className={cn(
          "space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 shadow-inner dark:border-slate-800 dark:bg-slate-950/50",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {label}
            </Label>
            {sublabel && <p className="text-[10px] text-slate-400">{sublabel}</p>}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-lg p-0"
            onClick={() => setIsCameraOpen(true)}
            disabled={disabled}
            title="Capture from camera"
          >
            <Camera className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Upload
          key={`${previewUrl || "passport-upload"}-${uploadKey}`}
          className="w-full"
          variant="photo-passport"
          accept="image/*"
          imagePreview={previewUrl}
          disabled={disabled}
          onRemove={() => {
            onChange(undefined, "")
            setUploadKey((prev) => prev + 1)
          }}
          onPreviewClick={handlePreviewExistingPhoto}
          onFilesSelected={handleFilesSelected}
        />

        <p className="text-[10px] text-center text-slate-400 font-medium">
          Auto-fit to 3.5 × 4.5 cm • Max 200 KB
        </p>
      </div>

      {/* Camera Capture Dialog */}
      <PassportCameraDialog
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureSave={handleCameraCaptureSave}
        entityName={entityName}
      />

      {/* Passport Photo Preview Dialog for upload / inspection */}
      <PassportPhotoPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          if (!isPhotoViewOnly) {
            setPendingPhoto(null)
            setUploadKey((prev) => prev + 1)
          }
        }}
        previewUrl={pendingPhoto?.previewUrl || null}
        fileSizeKB={pendingPhoto?.sizeKB}
        isReadOnly={isPhotoViewOnly}
        onConfirm={handleConfirmSave}
      />
    </>
  )
}
