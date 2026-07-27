import { useForm, Controller, useFieldArray } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "@/components/ui/upload"
import { FormFooter } from "@/components/ui/form-footer"
import { DatePickerInput } from "@/components/ui/date-picker"
import { ComboBox } from "@/components/ui/combobox"
import { DeleteButton } from "@/components/ui/delete-button"
import { X, IndianRupee, Calculator, Percent, Camera, ClipboardList, Plus, RefreshCw, AlertTriangle } from "lucide-react"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { studentSchema, type StudentFormValues } from "@/validations/student"
import { GENDER_TYPES, STUDENT_CATEGORIES, RELIGIONS, HEARD_ABOUT_US } from "@/utils/student-constants"
import { useEnquiryComboBox } from "@/hooks/use-combobox-data"
import { useEnquiry } from "@/hooks/api/use-enquiries"
import { useCourses } from "@/hooks/api/use-courses"
import { useBatches } from "@/hooks/api/use-batches"
import { useStudents } from "@/hooks/api/use-students"
import { Checkbox } from "@/components/ui/checkbox"
import type { EnrolledBatch } from "@/types/student"
import { useFeeSettings } from "@/hooks/api/use-fee-settings"
import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { differenceInMonths, format, isValid } from "date-fns"
import { cn } from "@/lib/utils"
import type { UseFormSetError } from "react-hook-form"
import type { Student } from "@/types/student"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const DEGREE_OPTIONS: { label: string; value: "S.S.C." | "H.S.C." | "Degree" | "Post Graduate" }[] = [
  { label: "S.S.C.", value: "S.S.C." },
  { label: "H.S.C.", value: "H.S.C." },
  { label: "Degree", value: "Degree" },
  { label: "Post Graduate", value: "Post Graduate" },
]

const getTodayYmd = () => format(new Date(), "yyyy-MM-dd")

const emptyStr = (v: unknown) => (typeof v === "string" ? v.trim() : "")

type DiscountType = "flat" | "percent"

interface StudentFormProps {
  initialValues?: Student
  onSubmit: (values: StudentFormValues, setError: UseFormSetError<StudentFormValues>) => void
  isLoading?: boolean
  isEdit?: boolean
  /** Pre-selected enquiry ID — when provided the form will auto-fetch and pre-fill fields */
  enquiryId?: number
}

export const StudentForm = ({
  initialValues,
  onSubmit,
  isLoading,
  isEdit,
  enquiryId,
}: StudentFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(
      studentSchema
    ) as any,
    defaultValues: initialValues
      ? ({
        ...(() => {
          const merged = Object.fromEntries(
            Object.entries(initialValues).map(([k, v]) => [k, v === null ? "" : v])
          ) as Record<string, unknown>
          return {
            ...merged,
            nationality: emptyStr(merged.nationality) || "Indian",
            state: emptyStr(merged.state) || "Maharashtra",
            registration_date: emptyStr(merged.registration_date) || getTodayYmd(),
          }
        })(),
        // Derive split name fields from the existing full name
        ...(initialValues.name
          ? (() => {
            const parts = initialValues.name.trim().split(/\s+/)
            const first_name = parts[0] || ""
            const last_name = parts.length > 1 ? parts[parts.length - 1] : ""
            const middle_name =
              parts.length > 2 ? parts.slice(1, parts.length - 1).join(" ") : ""
            return { first_name, middle_name, last_name }
          })()
          : { first_name: "", middle_name: "", last_name: "" }),
        qualifications:
          initialValues.qualifications && initialValues.qualifications.length > 0
            ? initialValues.qualifications
            : [],
        course_ids: initialValues?.batches
          ? Array.from(new Set(initialValues.batches.map(eb => eb.course_id)))
          : [],
        batch_ids: initialValues.batches ? initialValues.batches.map(eb => eb.batch_id) : [],
        fee_mode: "one-time",
        discount_amount: null,
        discount_percentage: null,
        enquiry_id: undefined,
      } as any)
      : {
        gender: "",
        category: "",
        adhar_no: "",
        place_of_birth: "",
        height: "",
        caste: "",
        qualifications: [],
        course_ids: [],
        batch_ids: [],
        fee_mode: "one-time",
        discount_amount: null,
        discount_percentage: null,
        enquiry_id: enquiryId,
        registration_date: getTodayYmd(),
        nationality: "Indian",
        state: "Maharashtra",
      },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualifications",
  })

  const [discountType, setDiscountType] = useState<DiscountType>("flat")
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }, [])

  const compressAndCropImage = useCallback((fileOrBlob: Blob | File, callback: (compressedFile: File) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const targetWidth = 450;
        const targetHeight = 600;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const imgAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (imgAspect > targetAspect) {
          sourceWidth = img.height * targetAspect;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          sourceHeight = img.width / targetAspect;
          sourceY = (img.height - sourceHeight) / 2;
        }

        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
              callback(compressedFile);
            }
          },
          "image/jpeg",
          0.8
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(fileOrBlob);
  }, []);

  const handleDiscountTypeChange = useCallback((type: DiscountType) => {
    setDiscountType(type)
    // Clear the other field so only one is sent
    if (type === "flat") setValue("discount_percentage", null)
    else setValue("discount_amount", null)
  }, [setValue])

  // Enquiry ComboBox for pre-fill selector
  const enquiryComboBox = useEnquiryComboBox()
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | undefined>(enquiryId)
  const { data: enquiryData } = useEnquiry(selectedEnquiryId ?? 0)

  useEffect(() => {
    if (isEdit) return
    setValue("enquiry_id", selectedEnquiryId, { shouldValidate: false })
  }, [isEdit, selectedEnquiryId, setValue])

  // Pre-fill student form when enquiry data is loaded
  useEffect(() => {
    if (!enquiryData) return
    setValue("first_name", enquiryData.first_name)
    setValue("middle_name", enquiryData.middle_name ?? "")
    setValue("last_name", enquiryData.last_name)
    setValue("personal_contact", enquiryData.personal_contact)
    if (enquiryData.email) setValue("email", enquiryData.email)
    if (enquiryData.height) setValue("height", enquiryData.height)
    if (enquiryData.gender) setValue("gender", enquiryData.gender as any)
    if (enquiryData.caste) setValue("caste", enquiryData.caste)
    if (enquiryData.address) setValue("address", enquiryData.address)
    if (enquiryData.parents_contact) setValue("father_contact", enquiryData.parents_contact)
    if (enquiryData.education) {
      const currentQuals = watch("qualifications") ?? []
      if (currentQuals.length === 0) {
        append({ degree: "Degree", passing_year: "", subject_discipline: enquiryData.education, board_university: "", marks: "" })
      } else {
        setValue("qualifications.0.subject_discipline", enquiryData.education)
      }
    }
  }, [enquiryData, setValue, append, watch])

  const [selectedBatches, setSelectedBatches] = useState<EnrolledBatch[]>([])

  // Sync selected batches when initialValues load
  useEffect(() => {
    if (initialValues?.batches) {
      const normalized = initialValues.batches.map(eb => ({
        id: eb.batch_id,
        name: eb.batch_name,
        course_name: eb.course_name,
        course_fees: eb.course_base_fees,
        is_removable: eb.is_removable,
        start_date: eb.start_date,
        end_date: eb.end_date,
      }))
      setSelectedBatches(normalized as any)
      setValue("batch_ids", initialValues.batches.map(eb => eb.batch_id))
    }
  }, [initialValues, setValue])
  const selectedBatchIds = watch("batch_ids") || []



  // Webcam helpers
  const stopWebcamStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }
//added comment
  useEffect(() => {
    if (!isWebcamOpen) {
      stopWebcamStream()
      return
    }

    const startWebcam = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          toast.error("Camera not supported in this browser.")
          setIsWebcamOpen(false)
          return
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }

        const constraints = {
          video: { facingMode: facingMode }
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (error) {
        console.error("Error accessing webcam with constraints:", error)
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play()
          }
        } catch (fbError) {
          console.error("Webcam fallback error:", fbError)
          toast.error("Unable to access camera. Please check permissions.")
          setIsWebcamOpen(false)
        }
      }
    }

    void startWebcam()

    return () => {
      stopWebcamStream()
    }
  }, [isWebcamOpen, facingMode])

  const handleCaptureFromWebcam = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement("canvas")
    const width = video.videoWidth || 480
    const height = video.videoHeight || 640
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, width, height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        compressAndCropImage(blob, (compressedFile) => {
          setValue("photo", compressedFile)
          const previewUrl = URL.createObjectURL(compressedFile)
          setValue("photo_url", previewUrl)
          setIsWebcamOpen(false)
          stopWebcamStream()
        })
      },
      "image/jpeg",
      0.9
    )
  }

  // Load courses
  const { data: coursesData } = useCourses({ limit: 1000, status: "active" })
  const courses = useMemo(() => coursesData?.data || [], [coursesData])

  // Load batches
  const { data: batchesData, isLoading: isBatchesLoading } = useBatches({ limit: 1000, status: "active" })
  const allBatches = useMemo(() => batchesData?.data || [], [batchesData])

  // Get selected courses details
  const watchedCourseIds = watch("course_ids") || []
  const selectedCourses = useMemo(() => {
    return courses.filter(c => watchedCourseIds.map(Number).includes(c.id))
  }, [courses, watchedCourseIds])

  // Filter active batches to only those containing any of the selected courses
  const activeBatches = useMemo(() => {
    if (!watchedCourseIds || watchedCourseIds.length === 0) return []
    const courseIdNums = watchedCourseIds.map(Number)
    return allBatches.filter(b => {
      const batchCourseIds = (b as any).course_ids || (b as any).courses?.map((c: any) => c.id) || [b.course_id]
      return batchCourseIds.some((id: number) => courseIdNums.includes(id))
    })
  }, [allBatches, watchedCourseIds])

  // Fetch the latest student to display the last registration and attendance numbers
  const { data: studentsResponse } = useStudents({ limit: 1 })
  const latestStudent = studentsResponse?.data?.[0]

  const handleBatchCheckboxChange = useCallback((batch: any, checked: boolean) => {
    const batchId = batch.id
    if (checked) {
      if (selectedBatchIds.includes(batchId)) return
      setSelectedBatches((prev) => [...prev, {
        ...batch,
        batch_id: batchId,
        batch_name: batch.name,
        course_base_fees: batch.course_fees,
        is_removable: true
      } as any])
      setValue("batch_ids", [...selectedBatchIds, batchId])
    } else {
      const batchItem = selectedBatches.find(b => b.id === batchId)
      if (batchItem?.is_removable === false) {
        toast.error("This batch cannot be removed as payment has already started.")
        return
      }
      setSelectedBatches((prev) => prev.filter((b) => b.id !== batchId))
      setValue("batch_ids", selectedBatchIds.filter((id) => id !== batchId))
    }
  }, [selectedBatchIds, selectedBatches, setValue])

  // Fee calculation logic
  const { data: feeSettings } = useFeeSettings()
  const watchedFeeMode = watch("fee_mode")
  const watchedDiscountAmount = watch("discount_amount")
  const watchedDiscountPercent = watch("discount_percentage")

  const feeSummary = useMemo(() => {
    if (selectedCourses.length === 0) return null

    // 1. Raw subtotal is the sum of selected courses fees
    const rawSubtotal = selectedCourses.reduce((sum, c) => {
      const fee = typeof c.fees === "string" ? parseFloat(c.fees) : (c.fees || 0)
      return sum + fee
    }, 0)

    // 2. Apply discount — BEFORE tax
    let discountValue = 0
    if (watchedDiscountAmount && !isNaN(Number(watchedDiscountAmount))) {
      discountValue = Math.min(Number(watchedDiscountAmount), rawSubtotal)
    } else if (watchedDiscountPercent && !isNaN(Number(watchedDiscountPercent))) {
      discountValue = (rawSubtotal * Math.min(Number(watchedDiscountPercent), 100)) / 100
    }
    const subtotal = rawSubtotal - discountValue

    // 3. One-time total (always compute for preview)
    const taxPercent = parseFloat(feeSettings?.tax_percentage || "0")
    const taxAmount = (subtotal * taxPercent) / 100
    const total = subtotal + taxAmount

    // 4. Monthly/Installment duration calculations
    // Use the maximum duration of the selected batches, default to 1 month if no batches are selected
    let durationMonths = 1
    selectedBatches.forEach((batch) => {
      const start = new Date(batch.start_date)
      const end = new Date(batch.end_date)
      if (isValid(start) && isValid(end)) {
        const months = Math.max(1, Math.ceil(differenceInMonths(end, start) + 0.1))
        if (months > durationMonths) {
          durationMonths = months
        }
      }
    })

    const monthlySubtotal = subtotal / durationMonths
    const monthlyTaxPercent = parseFloat(feeSettings?.monthly_tax_percentage || "0")
    const monthlyTaxAmount = (monthlySubtotal * monthlyTaxPercent) / 100
    const monthlyTotal = monthlySubtotal + monthlyTaxAmount

    // 5. Resolve the active fee mode: form selection takes priority, fallback to backend setting
    // Map "one-time" → "one-time", "installment" → "monthly" (for display purposes)
    const activeFeeMode: "one-time" | "monthly" | "installment" =
      watchedFeeMode === "installment" ? "installment"
      : watchedFeeMode === "one-time" ? "one-time"
      : (feeSettings?.fee_mode || "one-time") as "one-time" | "monthly"

    // 6. EMI preview (when installment fee_mode chosen)
    const emiBreakdown = [{
      batchName: selectedCourses.map(c => c.name).join(" + "),
      installments: durationMonths,
      perInstallment: monthlyTotal,
    }]

    return {
      rawSubtotal,
      discountValue,
      subtotal,
      taxPercent,
      taxAmount,
      total,
      monthlySubtotal,
      monthlyTaxPercent,
      monthlyTaxAmount,
      monthlyTotal,
      emiBreakdown,
      feeMode: activeFeeMode
    }
  }, [selectedCourses, selectedBatches, feeSettings, watchedDiscountAmount, watchedDiscountPercent, watchedFeeMode])

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit((values) => {
          // Check if at least one batch is selected for each selected course
          const selectedBatchObjects = allBatches.filter(b => values.batch_ids?.includes(b.id))
          const missingBatchesCourses: string[] = []

          values.course_ids.forEach(courseId => {
            const courseObj = courses.find(c => c.id === courseId)
            const hasBatchForCourse = selectedBatchObjects.some(b => {
              const batchCourseIds = (b as any).course_ids || (b as any).courses?.map((c: any) => c.id) || [b.course_id]
              return batchCourseIds.includes(courseId)
            })
            if (!hasBatchForCourse && courseObj) {
              missingBatchesCourses.push(courseObj.name)
            }
          })

          if (missingBatchesCourses.length > 0) {
            toast.error(
              `Please select at least one batch for course(s): ${missingBatchesCourses.join(", ")}`
            )
            setError("batch_ids", {
              type: "custom",
              message: `Select at least one batch for: ${missingBatchesCourses.join(", ")}`
            })
            return
          }

          const fullName = `${values.first_name} ${values.middle_name} ${values.last_name}`
            .replace(/\s+/g, " ")
            .trim()
          const sanitizedQualifications = (values.qualifications ?? []).filter((q) => {
            const py = (q.passing_year ?? "").trim()
            const sd = (q.subject_discipline ?? "").trim()
            const bu = (q.board_university ?? "").trim()
            const mk = (q.marks ?? "").trim()
            return Boolean(py || sd || bu || mk)
          })
          const submission = {
            ...values,
            name: fullName,
            qualifications: sanitizedQualifications.length > 0 ? sanitizedQualifications : undefined,
            course_id: values.course_ids[0], // backward compatibility
          }
          onSubmit(submission as StudentFormValues, setError)
        }, () => {
          toast.error("Please fill in all required fields before submitting.")
        })}
        className="relative flex flex-col"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative min-w-0 max-w-full">
          <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-28 space-y-8 xl:space-y-10">

            {/* Enquiry Pre-fill (only shown when creating new student) */}
            {!isEdit && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Pre-fill from Enquiry</h2>
                  </div>
                  {latestStudent && (
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 self-start sm:self-center">
                      <div>
                        Last Reg No: <span className="text-primary font-bold">{latestStudent.registration_no || "N/A"}</span>
                      </div>
                      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        Last Att ID: <span className="text-primary font-bold">{latestStudent.attendance_id || "N/A"}</span>
                      </div>
                    </div>
                  )}
                </div>
                {selectedEnquiryId && enquiryData ? (
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-4 py-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold shrink-0 text-sm">
                      {enquiryData.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                        {[enquiryData.first_name, enquiryData.middle_name, enquiryData.last_name].filter(Boolean).join(" ")}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500">{enquiryData.personal_contact}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEnquiryId(undefined)}
                      className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors shrink-0"
                      title="Clear enquiry selection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <ComboBox
                    value={selectedEnquiryId ? String(selectedEnquiryId) : ""}
                    onValueChange={(val) => setSelectedEnquiryId(val ? Number(val) : undefined)}
                    options={enquiryComboBox.options}
                    onSearch={enquiryComboBox.onSearch}
                    onLoadMore={enquiryComboBox.onLoadMore}
                    onReset={enquiryComboBox.onReset}
                    hasMore={enquiryComboBox.hasMore}
                    isLoading={enquiryComboBox.isLoading}
                    isLoadingMore={enquiryComboBox.isLoadingMore}
                    placeholder="Search active enquiries to pre-fill..."
                    searchPlaceholder="Search by name or contact..."
                    emptyText="No active enquiries found."
                    disabled={isLoading}
                  />
                )}
                <div className="h-px bg-slate-100 dark:bg-slate-800" />
              </div>
            )}

            <div className="space-y-10">
              {/* Section 1: Personal Information */}
              <div className="space-y-6 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
                  <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-6">
                  <Input
                    {...register("registration_no")}
                    label="Registration No."
                    placeholder="e.g. 1000001 (Optional)"
                    className="rounded-lg text-sm font-mono"
                    error={errors.registration_no?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("attendance_id")}
                    label="Attendance ID"
                    placeholder="e.g. 1000001"
                    className="rounded-lg text-sm font-mono"
                    error={errors.attendance_id?.message}
                    disabled={isLoading}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                    }}
                  />
                  <Input
                    {...register("first_name")}
                    label="First Name"
                    required={true}
                    placeholder="Enter first name"
                    className="rounded-lg text-sm"
                    error={errors.first_name?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("middle_name")}
                    label="Middle Name"
                    required={true}
                    placeholder="Enter middle name"
                    className="rounded-lg text-sm"
                    error={errors.middle_name?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("last_name")}
                    label="Last Name"
                    required={true}
                    placeholder="Enter last name"
                    className="rounded-lg text-sm"
                    error={errors.last_name?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("father_husband_name")}
                    label="Father / Husband Name"
                    required={true}
                    placeholder="Enter father or husband name"
                    className="rounded-lg text-sm"
                    error={errors.father_husband_name?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("mother_name")}
                    label="Mother Name"
                    placeholder="Enter mother's name"
                    className="rounded-lg text-sm"
                    error={errors.mother_name?.message}
                    disabled={isLoading}
                  />

                  <div className="space-y-1.5">
                    <Label
                      className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5"
                      required={true}
                    >
                      Gender
                    </Label>
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <CustomSelect
                          options={[...GENDER_TYPES]}
                          value={
                            field.value != null && String(field.value).trim() !== ""
                              ? String(field.value)
                              : undefined
                          }
                          triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                          onValueChange={(value) => {
                            field.onChange(value)
                            clearErrors("gender")
                          }}
                          disabled={isLoading}
                          placeholder="Select gender"
                        />
                      )}
                    />
                    {errors.gender && <p className="text-[11px] text-rose-500 font-medium">{errors.gender.message}</p>}
                  </div>

                  <Controller
                    control={control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <DatePickerInput
                        label="Date of Birth"
                        required={true}
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                        error={errors.date_of_birth?.message}
                        placeholder="Select date of birth"
                        disabled={isLoading}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="registration_date"
                    render={({ field }) => (
                      <DatePickerInput
                        label="Registration Date"
                        required={true}
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                        error={errors.registration_date?.message}
                        placeholder="Select registration date"
                        disabled={isLoading}
                      />
                    )}
                  />


                  <Input
                    {...register("nationality")}
                    label="Nationality"
                    placeholder="e.g. Indian"
                    className="rounded-lg text-sm"
                    error={errors.nationality?.message}
                    disabled={isLoading}
                  />

                  <Input
                    {...register("adhar_no")}
                    label="Aadhaar Number"
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 12);
                    }}
                    className="rounded-lg text-sm"
                    error={errors.adhar_no?.message}
                    disabled={isLoading}
                  />

                  <Input
                    {...register("place_of_birth")}
                    label="Place of Birth"
                    placeholder="Enter place of birth"
                    className="rounded-lg text-sm"
                    error={errors.place_of_birth?.message}
                    disabled={isLoading}
                  />

                  <Input
                    {...register("height")}
                    label="Height"
                    placeholder="e.g. 5.8 ft"
                    className="rounded-lg text-sm"
                    error={errors.height?.message}
                    disabled={isLoading}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*)\./g, "$1")
                    }}
                  />

                  <Input
                    {...register("caste")}
                    label="Caste"
                    placeholder="Enter detailed caste"
                    className="rounded-lg text-sm"
                    error={errors.caste?.message}
                    disabled={isLoading}
                  />

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Category</Label>
                    <CustomSelect
                      options={[...STUDENT_CATEGORIES]}
                      value={watch("category") || ""}
                      triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                      onValueChange={(value) => setValue("category", value)}
                      disabled={isLoading}
                      placeholder="Select category"
                    />
                    {errors.category && <p className="text-[11px] text-rose-500 font-medium">{errors.category.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Religion</Label>
                    <CustomSelect
                      options={[...RELIGIONS]}
                      value={watch("religion") || ""}
                      triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                      onValueChange={(value) => setValue("religion", value)}
                      disabled={isLoading}
                      placeholder="Select religion"
                    />
                    {errors.religion && <p className="text-[11px] text-rose-500 font-medium">{errors.religion.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Heard About Us</Label>
                    <CustomSelect
                      options={[...HEARD_ABOUT_US]}
                      value={watch("heard_about_us") || ""}
                      triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm"
                      onValueChange={(value) => setValue("heard_about_us", value)}
                      disabled={isLoading}
                      placeholder="Select option"
                    />
                    {watch("heard_about_us") === "Other" && (
                      <div className="mt-2">
                        <Input
                          {...register("heard_about_us_remark")}
                          label="Remark"
                          required={true}
                          placeholder="Please specify"
                          className="rounded-lg text-sm"
                          error={errors.heard_about_us_remark?.message}
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 xl:col-span-4">
                    <Textarea
                      {...register("address")}
                      label="Address"
                      placeholder="Enter residential address"
                      className="min-h-[80px] rounded-lg resize-none text-sm"
                      error={errors.address?.message}
                      disabled={isLoading}
                    />
                  </div>

                  <Input
                    {...register("city")}
                    label="City"
                    placeholder="Enter city"
                    className="rounded-lg text-sm"
                    error={errors.city?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("state")}
                    label="State"
                    placeholder="Enter state"
                    className="rounded-lg text-sm"
                    error={errors.state?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("pincode")}
                    label="Pincode"
                    placeholder="Enter pincode"
                    className="rounded-lg text-sm"
                    error={errors.pincode?.message}
                    disabled={isLoading}
                    maxLength={6}
                    inputMode="numeric"
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                      ) {
                        e.preventDefault()
                      }
                    }}
                  />

                  <div className="md:col-span-2 xl:col-span-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                        Photo
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-[12px] px-2.5 gap-1"
                        onClick={() => setIsWebcamOpen(true)}
                        disabled={isLoading}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Capture from webcam
                      </Button>
                    </div>
                    <Upload
                      key={watch("photo_url") || "photo-upload"}
                      className="w-full"
                      accept="image/*"
                      imagePreview={watch("photo_url")}
                      disabled={isLoading}
                      onRemove={() => {
                        setValue("photo_url", "")
                        setValue("photo", undefined)
                      }}
                      onFilesSelected={(files) => {
                        if (files.length > 0) {
                          compressAndCropImage(files[0], (compressedFile) => {
                            setValue("photo", compressedFile)
                            setValue("photo_url", URL.createObjectURL(compressedFile))
                          })
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="space-y-6 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
                  <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-6">
                  <Input
                    {...register("personal_contact")}
                    label="Personal Contact"
                    required={true}
                    placeholder="Enter 10-digit number"
                    className="rounded-lg text-sm"
                    maxLength={10}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    }}
                    error={errors.personal_contact?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("email")}
                    label="Email Address"
                    type="email"
                    placeholder="student@example.com"
                    className="rounded-lg text-sm"
                    error={errors.email?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("father_contact")}
                    label="Father's Contact"
                    placeholder="Enter 10-digit number"
                    className="rounded-lg text-sm"
                    maxLength={10}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    }}
                    error={errors.father_contact?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("father_email")}
                    label="Father's Email"
                    type="email"
                    placeholder="father@example.com"
                    className="rounded-lg text-sm"
                    error={errors.father_email?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("mother_contact")}
                    label="Mother's Contact"
                    placeholder="Enter 10-digit number"
                    className="rounded-lg text-sm"
                    maxLength={10}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    }}
                    error={errors.mother_contact?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("mother_email")}
                    label="Mother's Email"
                    type="email"
                    placeholder="mother@example.com"
                    className="rounded-lg text-sm"
                    error={errors.mother_email?.message}
                    disabled={isLoading}
                  />
                  <Input
                    {...register("reference")}
                    label="Reference"
                    placeholder="Who referred this student?"
                    className="rounded-lg text-sm"
                    error={errors.reference?.message}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-x-10 xl:gap-y-0 xl:items-start">
              {/* Section 3: Academic Information */}
              <div className="space-y-6 min-w-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
                    <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Academic Information</h2>
                  </div>
                  {!isLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ degree: "Degree", passing_year: "", subject_discipline: "", board_university: "", marks: "" })}
                      className="h-8 px-3 rounded-lg border-primary/20 hover:bg-primary/5 text-primary gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Qualification</span>
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const watchedQualifications = watch("qualifications")
                    const currentDegree = watchedQualifications?.[index]?.degree
                    const otherSelectedDegrees = watchedQualifications
                      ?.filter((_, i) => i !== index)
                      .map(q => q.degree)

                    const dynamicOptions = DEGREE_OPTIONS.map(opt => ({
                      ...opt,
                      disabled: (otherSelectedDegrees as string[])?.includes(opt.value) && opt.value !== currentDegree
                    }))

                    return (
                      <div
                        key={field.id}
                        className="relative p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        {fields.length >= 1 && !isLoading && (
                          <div className="absolute top-4 right-4 z-10">
                            <DeleteButton
                              title="Qualification"
                              onDelete={() => remove(index)}
                              disabled={isLoading}
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-1">
                            <Controller
                              control={control}
                              name={`qualifications.${index}.degree`}
                              render={({ field }) => (
                                <CustomSelect
                                  label="Degree"
                                  options={dynamicOptions}
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={isLoading}
                                  triggerClassName="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-none text-sm font-bold"
                                />
                              )}
                            />
                          </div>
                          <div className="md:col-span-1">
                            <Input
                              {...register(`qualifications.${index}.passing_year`)}
                              label="Passing Year"
                              placeholder="YYYY"
                              maxLength={4}
                              className="h-11 rounded-lg"
                              disabled={isLoading}
                              error={errors.qualifications?.[index]?.passing_year?.message}
                              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 4)
                              }}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              {...register(`qualifications.${index}.subject_discipline`)}
                              label="Subject / Discipline"
                              placeholder="e.g. Science / Arts / Commerce"
                              className="h-11 rounded-lg"
                              disabled={isLoading}
                              error={errors.qualifications?.[index]?.subject_discipline?.message}
                            />
                          </div>
                          <div className="md:col-span-3">
                            <Input
                              {...register(`qualifications.${index}.board_university`)}
                              label="Board / University"
                              placeholder="e.g. Mumbai University"
                              className="h-11 rounded-lg"
                              disabled={isLoading}
                              error={errors.qualifications?.[index]?.board_university?.message}
                            />
                          </div>
                          <div className="md:col-span-1">
                            <Input
                              {...register(`qualifications.${index}.marks`)}
                              label="Marks / Grade"
                              placeholder="e.g. 85.50"
                              className="h-11 rounded-lg"
                              disabled={isLoading}
                              error={errors.qualifications?.[index]?.marks?.message}
                              onInput={(e: any) => {
                                // Only allow numbers and one decimal point
                                e.target.value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Course & Batch Management */}
              <div className="space-y-8 min-w-0">
                <div className="space-y-8">
                  {/* Section 4: Course Enrollment */}
                  <div className="space-y-6 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">4</span>
                      <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Course Enrollment</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label
                            className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5"
                            required={!isEdit}
                          >
                            Select Courses
                          </Label>
                          {courses.length > 0 && (
                            <Checkbox
                              id="select-all-courses"
                              checked={
                                courses.length > 0 &&
                                (watchedCourseIds || []).length === courses.length
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setValue("course_ids", courses.map(c => c.id), { shouldValidate: true })
                                } else {
                                  setValue("course_ids", [], { shouldValidate: true })
                                  setValue("batch_ids", [])
                                  setSelectedBatches([])
                                }
                              }}
                              label="Select All"
                              labelClassName="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                            />
                          )}
                        </div>

                        {courses.length === 0 ? (
                          <div className="text-sm text-rose-500">No active courses found.</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 max-h-[200px] overflow-y-auto">
                            {courses.map((course) => {
                              const isChecked = (watchedCourseIds || []).includes(course.id)
                              return (
                                <div key={course.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`course-${course.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const currentIds = watchedCourseIds || []
                                      let nextIds: number[] = []
                                      if (checked) {
                                        nextIds = [...currentIds, course.id]
                                      } else {
                                        nextIds = currentIds.filter(id => id !== course.id)
                                        // Remove any batches belonging to the deselected course
                                        const nextSelectedBatches = selectedBatches.filter(b => {
                                          const batchCourseIds = (b as any).course_ids || (b as any).courses?.map((c: any) => c.id) || [b.course_id]
                                          return batchCourseIds.some((id: number) => nextIds.includes(id))
                                        })
                                        setSelectedBatches(nextSelectedBatches)
                                        setValue("batch_ids", nextSelectedBatches.map(b => b.id), { shouldValidate: true })
                                      }
                                      setValue("course_ids", nextIds, { shouldValidate: true })
                                    }}
                                    label={course.name}
                                    labelClassName="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {errors.course_ids && (
                          <p className="text-[11px] text-rose-500 font-medium mt-1">
                            {errors.course_ids.message as string}
                          </p>
                        )}

                        {/* Course warnings if no active batches exist for a selected course */}
                        {selectedCourses.map((c) => {
                          const hasBatches = allBatches.some((b) => {
                            const batchCourseIds = (b as any).course_ids || (b as any).courses?.map((bc: any) => bc.id) || [b.course_id]
                            return batchCourseIds.includes(c.id)
                          })
                          if (!hasBatches) {
                            return (
                              <div key={c.id} className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs mt-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold">No active batches found for course "{c.name}".</span> Please create a batch for this course in Batch Management first.
                                </div>
                              </div>
                            )
                          }
                          return null
                        })}

                        {selectedCourses.length > 0 && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                              {selectedCourses.map((course) => (
                                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                      {course.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{course.name}</p>
                                      <p className="text-xs text-muted-foreground">Course Fees: ₹{course.fees}</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextIds = watchedCourseIds.filter(id => id !== course.id)
                                      setValue("course_ids", nextIds, { shouldValidate: true })
                                      // Remove any batches belonging to the deselected course
                                      const nextSelectedBatches = selectedBatches.filter(b => {
                                        const batchCourseIds = (b as any).course_ids || (b as any).courses?.map((c: any) => c.id) || [b.course_id]
                                        return batchCourseIds.some((id: number) => nextIds.includes(id))
                                      })
                                      setSelectedBatches(nextSelectedBatches)
                                      setValue("batch_ids", nextSelectedBatches.map(b => b.id), { shouldValidate: true })
                                    }}
                                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                          {/* Fee Mode */}
                          <Controller
                            name="fee_mode"
                            control={control}
                            render={({ field }) => (
                              <CustomSelect
                                label="Fee Mode"
                                options={[
                                  { label: "One-Time (Full payment, no EMI)", value: "one-time" },
                                  { label: "Installment (EMI schedule auto-generated)", value: "installment" },
                                ]}
                                value={field.value}
                                onValueChange={field.onChange}
                                required
                              />
                            )}
                          />

                          {/* Discount */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Discount <span className="text-slate-400 font-normal">(optional)</span></label>
                              {/* Flat / % toggle */}
                              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleDiscountTypeChange("flat")}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-colors",
                                    discountType === "flat"
                                      ? "bg-primary text-white"
                                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                  )}
                                >
                                  <IndianRupee className="h-3 w-3" /> Flat
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDiscountTypeChange("percent")}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-colors",
                                    discountType === "percent"
                                      ? "bg-primary text-white"
                                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                  )}
                                >
                                  <Percent className="h-3 w-3" /> %
                                </button>
                              </div>
                            </div>
                            {discountType === "flat" ? (
                              <Input
                                {...register("discount_amount", { valueAsNumber: true })}
                                type="number"
                                step="any"
                                min={0}
                                leftIcon={<IndianRupee className="h-4 w-4" />}
                                placeholder="e.g. 500"
                                error={errors.discount_amount?.message as string}
                              />
                            ) : (
                              <Input
                                {...register("discount_percentage", { valueAsNumber: true })}
                                type="number"
                                step="any"
                                min={0}
                                max={100}
                                leftIcon={<Percent className="h-4 w-4" />}
                                placeholder="e.g. 10"
                                error={errors.discount_percentage?.message as string}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 5: Batch Assignment */}
                  <div className="space-y-6 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">5</span>
                      <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Batch Assignment</h2>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">
                        Select Batch <span className="text-[10px] font-normal text-slate-400 ml-1">(select one or more)</span>
                      </Label>

                      {isBatchesLoading ? (
                        <div className="text-sm text-slate-400">Loading active batches...</div>
                      ) : watchedCourseIds.length === 0 ? (
                        <div className="text-sm text-slate-400">Please select at least one course first.</div>
                      ) : activeBatches.length === 0 ? (
                        <div className="text-sm text-amber-500">No active batches found for the selected course(s).</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 max-h-[300px] overflow-y-auto">
                          {activeBatches.map((batch) => {
                            const isChecked = selectedBatchIds.includes(batch.id)
                            const isRemovable = selectedBatches.find(b => b.id === batch.id)?.is_removable !== false
                            return (
                              <div key={batch.id} className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <Checkbox
                                    id={`batch-${batch.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => handleBatchCheckboxChange(batch, !!checked)}
                                    label={batch.name}
                                    labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer leading-tight"
                                    disabled={!isRemovable}
                                  />
                                  {batch.hall_no && (
                                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                      {batch.hall_no}
                                    </span>
                                  )}
                                </div>
                                {(batch.start_date || batch.end_date) && (
                                  <p className="text-[10px] text-slate-400 pl-6">
                                    {batch.start_date ? format(new Date(batch.start_date), "dd MMM yyyy") : "—"}
                                    {" → "}
                                    {batch.end_date ? format(new Date(batch.end_date), "dd MMM yyyy") : "—"}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {errors.batch_ids && <p className="text-[11px] text-rose-500 font-medium">{errors.batch_ids.message as string}</p>}
                    </div>
                  </div>

                  {/* Dynamic Fee Summary / Fees Structure */}
                  {feeSummary && (
                    <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-primary" />
                          <h3 className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fees Structure</h3>
                        </div>
                        <div className="p-5 space-y-4">
                          {/* One-time Section */}
                          <div className={cn(
                            "space-y-2.5 transition-all duration-300",
                            feeSummary.feeMode !== "one-time" && "opacity-60 scale-[0.98] grayscale-[0.2]"
                          )}>
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Base Fees :</span>
                                {feeSummary.feeMode !== "one-time" && (
                                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase font-black tracking-tighter">Preview</span>
                                )}
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            {/* Discount row */}
                            {feeSummary.discountValue > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <Percent className="h-3 w-3" /> Discount :
                                </span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  − ₹{feeSummary.discountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}

                            {feeSummary.discountValue > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Fees after Discount :</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">Tax ({feeSummary.taxPercent}%) :</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={cn(
                              "flex justify-between items-center p-2.5 rounded-lg transition-all",
                              feeSummary.feeMode === "one-time"
                                ? "bg-primary/5 dark:bg-primary/10 border border-primary/20 shadow-[0_0_15px_-5px_rgba(var(--primary),0.1)]"
                                : "bg-slate-50/50 dark:bg-slate-800/30 border border-transparent"
                            )}>
                              <span className={cn(
                                "text-sm font-bold uppercase tracking-tight",
                                feeSummary.feeMode === "one-time" ? "text-primary" : "text-slate-500"
                              )}>Total Amount :</span>
                              <div className={cn(
                                "flex items-center gap-1",
                                feeSummary.feeMode === "one-time" ? "text-primary" : "text-slate-500"
                              )}>
                                <IndianRupee className="h-4 w-4" />
                                <span className="text-lg font-black">{feeSummary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>

                           {/* Monthly Section — only shown when monthly or installment mode is active */}
                          {(feeSummary.feeMode === "monthly" || feeSummary.feeMode === "installment") && (
                            <>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 mx-1" />
                              <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-600 dark:text-slate-400 font-medium">Monthly Fees :</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.monthlySubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">Monthly Course Tax ({feeSummary.monthlyTaxPercent}%) :</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.monthlyTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)]">
                                  <span className="text-sm font-bold uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Monthly Course Fees :</span>
                                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <IndianRupee className="h-4 w-4" />
                                    <span className="text-lg font-black">{feeSummary.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                        {/* EMI Preview — only when installment mode is chosen */}
                        {watchedFeeMode === "installment" && feeSummary.emiBreakdown.length > 0 && (
                          <div className="border border-amber-100 dark:border-amber-800/30 rounded-lg overflow-hidden bg-amber-50/40 dark:bg-amber-900/10 p-4 space-y-3">
                            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-amber-200/60 dark:border-amber-800/40 pb-2">
                              <Calculator className="h-3.5 w-3.5" /> EMI Schedule Preview
                            </p>
                            <div className="space-y-2">
                              {feeSummary.emiBreakdown.map((emi, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-800/30 px-3 py-2">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{emi.batchName}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{emi.installments} installment{emi.installments !== 1 ? "s" : ""} · 30 days apart</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Per EMI</p>
                                    <p className="text-[15px] font-black text-amber-600 dark:text-amber-500 flex items-center gap-0.5 justify-end">
                                      <IndianRupee className="h-3.5 w-3.5" />{emi.perInstallment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center italic">
                              EMI amounts reflect the final payable amount including all taxes.
                            </p>
                          </div>
                        )}
                        </div>{/* end p-5 space-y-4 */}

                        {/* Status Indicator */}
                        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active System Mode</span>
                          <span className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-sm",
                            feeSummary.feeMode === "monthly"
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                              : "bg-primary/10 text-primary border border-primary/20"
                          )}>
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full animate-pulse",
                              feeSummary.feeMode === "monthly" ? "bg-emerald-500" : "bg-primary"
                            )} />
                            {feeSummary.feeMode}
                          </span>
                        </div>
                      </div>{/* end card */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
           <Dialog open={isWebcamOpen} onOpenChange={setIsWebcamOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Capture Photo from Webcam</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-[3/4] max-w-[280px] mx-auto border border-slate-200 dark:border-slate-800 shadow-md">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {/* Passport overlay guide */}
                  <div className="absolute inset-4 border-2 border-dashed border-white/60 rounded-md pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-28 h-36 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
                      <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Face Guide</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-center text-muted-foreground mt-2">
                  Align the face within the guides. The photo will be automatically cropped and compressed under 200KB.
                </p>
              </div>
              <DialogFooter className="mt-3 flex flex-wrap justify-between items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleFacingMode}
                  className="gap-1.5 h-9"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Switch Camera</span>
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => {
                      setIsWebcamOpen(false)
                      stopWebcamStream()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" size="sm" className="h-9 gap-1.5" onClick={handleCaptureFromWebcam}>
                    <Camera className="h-3.5 w-3.5" />
                    <span>Capture</span>
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Sticky Footer */}
          <div className="sticky -bottom-6 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-8 pt-4 pb-10 flex items-center justify-end z-40 rounded-b-xl">
            <FormFooter
              isLoading={isLoading}
              submitLabel={isEdit ? "Update Student" : "Register Student"}
              loadingLabel={isEdit ? "Saving..." : "Registering..."}
              cancelHref="/students"
              className="border-none shadow-none p-0 bg-transparent mt-0"
            />
          </div>
        </div>
      </form>
    </TooltipProvider>
  )
}
