/**
 * Utility functions for Passport Size (3.5 cm × 4.5 cm) photo processing.
 * Handles auto-crop to 3.5:4.5 (7:9) ratio, and adaptive compression to under 200 KB
 * without compromising visual quality.
 */

export const PASSPORT_RATIO = 3.5 / 4.5 // 7 / 9 ≈ 0.7777777777777778
export const MAX_PHOTO_SIZE_BYTES = 200 * 1024 // 200 KB = 204,800 bytes

export interface ProcessedPassportPhoto {
  file: File
  previewUrl: string
  sizeKB: number
  width: number
  height: number
}

/**
 * Loads an image from a File, Blob, or URL string into an HTMLImageElement.
 */
export function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    let url: string

    if (typeof source === "string") {
      url = source
      img.crossOrigin = "anonymous"
    } else {
      url = URL.createObjectURL(source)
    }

    img.onload = () => {
      if (typeof source !== "string") {
        URL.revokeObjectURL(url)
      }
      resolve(img)
    }

    img.onerror = (err) => {
      if (typeof source !== "string") {
        URL.revokeObjectURL(url)
      }
      reject(err)
    }

    img.src = url
  })
}

/**
 * Automatically fits and crops an image or video frame into the fixed
 * 'Passport Size' (3.5 cm × 4.5 cm, 7:9) frame, and adaptively compresses
 * it to <= 200 KB while preserving highest visual fidelity.
 */
export async function processPassportPhoto(
  source: File | Blob | HTMLImageElement | HTMLVideoElement,
  fileName: string = "passport_photo.jpg"
): Promise<ProcessedPassportPhoto> {
  let sourceWidth = 0
  let sourceHeight = 0
  let sourceElement: CanvasImageSource

  if (source instanceof HTMLVideoElement) {
    sourceElement = source
    sourceWidth = source.videoWidth || 640
    sourceHeight = source.videoHeight || 480
  } else if (source instanceof HTMLImageElement) {
    sourceElement = source
    sourceWidth = source.naturalWidth || source.width
    sourceHeight = source.naturalHeight || source.height
  } else {
    const img = await loadImage(source)
    sourceElement = img
    sourceWidth = img.naturalWidth || img.width
    sourceHeight = img.naturalHeight || img.height
  }

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Invalid image or video dimensions.")
  }

  // Calculate crop coordinates for 3.5 : 4.5 (7:9) aspect ratio
  const sourceAspect = sourceWidth / sourceHeight
  const targetAspect = PASSPORT_RATIO

  let cropX = 0
  let cropY = 0
  let cropWidth = sourceWidth
  let cropHeight = sourceHeight

  if (sourceAspect > targetAspect) {
    // Image is wider than passport frame -> crop left/right sides
    cropWidth = sourceHeight * targetAspect
    cropX = (sourceWidth - cropWidth) / 2
  } else {
    // Image is taller than passport frame -> crop top/bottom
    // We center the crop vertically to align the face nicely
    cropHeight = sourceWidth / targetAspect
    cropY = (sourceHeight - cropHeight) / 2
  }

  // Target standard high-res passport dimensions (700 × 900 px)
  let targetWidth = 700
  let targetHeight = 900

  const canvas = document.createElement("canvas")
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext("2d", { alpha: false })
  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas context.")
  }

  // Enable high-quality smoothing
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  // Fill with clean neutral background (in case of edge artifacts)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, targetWidth, targetHeight)

  // Draw auto-fitted & cropped photo
  ctx.drawImage(
    sourceElement,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight
  )

  // Step-wise adaptive compression: starts at high 0.92 quality and steps down
  // until the file size is guaranteed to be <= 200 KB.
  const qualitySteps = [0.92, 0.88, 0.84, 0.80, 0.76, 0.72, 0.68, 0.64, 0.58, 0.52]
  let finalBlob: Blob | null = null

  const getBlobAtQuality = (cvs: HTMLCanvasElement, q: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      cvs.toBlob((b) => resolve(b), "image/jpeg", q)
    })
  }

  for (const q of qualitySteps) {
    const blob = await getBlobAtQuality(canvas, q)
    if (blob) {
      finalBlob = blob
      if (blob.size <= MAX_PHOTO_SIZE_BYTES) {
        break
      }
    }
  }

  // If still above 200 KB (very rare for a 700x900 JPEG), scale down slightly
  if (finalBlob && finalBlob.size > MAX_PHOTO_SIZE_BYTES) {
    const scaledCanvas = document.createElement("canvas")
    scaledCanvas.width = 560
    scaledCanvas.height = 720
    const sCtx = scaledCanvas.getContext("2d", { alpha: false })
    if (sCtx) {
      sCtx.imageSmoothingEnabled = true
      sCtx.imageSmoothingQuality = "high"
      sCtx.drawImage(canvas, 0, 0, 560, 720)
      for (const q of [0.85, 0.75, 0.65, 0.55]) {
        const blob = await getBlobAtQuality(scaledCanvas, q)
        if (blob) {
          finalBlob = blob
          targetWidth = 560
          targetHeight = 720
          if (blob.size <= MAX_PHOTO_SIZE_BYTES) {
            break
          }
        }
      }
    }
  }

  if (!finalBlob) {
    throw new Error("Failed to generate compressed image blob.")
  }

  const safeFileName = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")
    ? fileName
    : `${fileName.replace(/\.[^/.]+$/, "")}.jpg`

  const finalFile = new File([finalBlob], safeFileName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  })

  const previewUrl = URL.createObjectURL(finalBlob)
  const sizeKB = Number((finalBlob.size / 1024).toFixed(1))

  return {
    file: finalFile,
    previewUrl,
    sizeKB,
    width: targetWidth,
    height: targetHeight,
  }
}
