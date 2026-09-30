import { useState, useCallback, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Check, X } from "lucide-react"
import { toast } from "sonner"
import { processPassportPhoto, type ProcessedPassportPhoto } from "@/utils/image-processing"

export interface PassportCameraDialogProps {
  isOpen: boolean
  onClose: () => void
  onCaptureSave: (file: File, previewUrl: string, sizeKB: number) => void
  entityName?: string
}

export const PassportCameraDialog = ({
  isOpen,
  onClose,
  onCaptureSave,
  entityName = "photo",
}: PassportCameraDialogProps) => {
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [capturedPhoto, setCapturedPhoto] = useState<ProcessedPassportPhoto | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const toggleFacingMode = useCallback(() => {
    stopStream()
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }, [stopStream])

  useEffect(() => {
    if (!isOpen) {
      stopStream()
      setCapturedPhoto(null)
      return
    }

    if (capturedPhoto) {
      stopStream()
      return
    }

    let isMounted = true

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          toast.error("Camera is not supported on this browser/device.")
          onClose()
          return
        }

        stopStream()

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }

        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        }

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch (error) {
        console.error("Camera access error:", error)
        toast.error("Unable to access camera. Please check camera permissions.")
        onClose()
      }
    }

    void startCamera()

    return () => {
      isMounted = false
      stopStream()
    }
  }, [isOpen, facingMode, capturedPhoto, stopStream, onClose])

  const handleCapture = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      const result = await processPassportPhoto(video, `${entityName}_passport.jpg`)
      stopStream()
      setCapturedPhoto(result)
    } catch (err) {
      console.error("Camera capture failed:", err)
      toast.error("Failed to capture photo. Please try again.")
    }
  }

  const handleSave = () => {
    if (!capturedPhoto) return
    onCaptureSave(capturedPhoto.file, capturedPhoto.previewUrl, capturedPhoto.sizeKB)
    onClose()
    setCapturedPhoto(null)
  }

  const handleRetake = () => {
    setCapturedPhoto(null)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          stopStream()
          setCapturedPhoto(null)
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            {capturedPhoto ? "Preview Captured Photo" : "Capture Passport Photo"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {capturedPhoto
              ? "Review your auto-cropped passport photo before saving."
              : "Align face within the fixed 3.5 cm × 4.5 cm frame."}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Fixed Passport Size (3.5 cm × 4.5 cm / 7:9 ratio) frame */}
          <div className="relative w-[210px] h-[270px] rounded-xl overflow-hidden bg-black mx-auto border-2 border-slate-300 dark:border-slate-700 shadow-xl ring-4 ring-primary/10">
            {capturedPhoto ? (
              <img
                src={capturedPhoto.previewUrl}
                alt="Captured Passport"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {/* Passport overlay guide */}
                <div className="absolute inset-3 border-2 border-dashed border-white/60 rounded-md pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-24 h-32 rounded-full border-2 border-white/40 bg-white/5 flex items-center justify-center">
                    <span className="text-[9px] text-white/70 font-bold uppercase tracking-wider text-center px-1">
                      Face Guide
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Corner marks */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/80 pointer-events-none drop-shadow" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/80 pointer-events-none drop-shadow" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/80 pointer-events-none drop-shadow" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/80 pointer-events-none drop-shadow" />

            {/* Dimension badge */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <span className="bg-black/65 backdrop-blur-sm text-[10px] font-semibold text-white px-2.5 py-0.5 rounded-full border border-white/20">
                3.5 cm × 4.5 cm
              </span>
            </div>
          </div>

          {capturedPhoto ? (
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                {capturedPhoto.sizeKB} KB (Under 200 KB limit)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                Passport Standard (7:9)
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-center text-muted-foreground">
              Photo will be automatically fitted to 3.5 × 4.5 cm and compressed under 200 KB.
            </p>
          )}
        </div>

        <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {!capturedPhoto ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleFacingMode}
                className="gap-1.5 h-9 w-full sm:w-auto"
                title="Switch between front and back camera"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{facingMode === "user" ? "Switch to Back Camera" : "Switch to Front Camera"}</span>
              </Button>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    stopStream()
                    onClose()
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 gap-1.5 font-semibold"
                  onClick={handleCapture}
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Capture</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 w-full justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={handleRetake}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retake</span>
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 gap-1.5 font-semibold"
                onClick={handleSave}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Photo</span>
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
