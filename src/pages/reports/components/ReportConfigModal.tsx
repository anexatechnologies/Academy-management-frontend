import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FormFooter } from "@/components/ui/form-footer"
import { ComboBox } from "@/components/ui/combobox"
import { DatePickerInput } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CustomSelect } from "@/components/ui/custom-select"
import { useBatchComboBox, useStudentComboBox } from "@/hooks/use-combobox-data"
import { useDownloadReport } from "@/hooks/api/use-reports"
import { REPORT_TYPES } from "../ReportsPage"
import { toast } from "sonner"

interface ReportConfigModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: string
}

interface FormValues {
  batch_id: string
  student_id: string
  date: string
  from_date: string
  to_date: string
  month: string
  year: string
  status_active: boolean
  status_inactive: boolean
  status_archived: boolean
  sort_by: string
}

export default function ReportConfigModal({
  isOpen,
  onClose,
  reportId,
}: ReportConfigModalProps) {
  const { downloadPdfReport } = useDownloadReport()
  const [isDownloading, setIsDownloading] = useState(false)

  const { control, handleSubmit, watch, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      batch_id: "",
      student_id: "",
      date: new Date().toISOString().split("T")[0],
      from_date: new Date().toISOString().split("T")[0],
      to_date: new Date().toISOString().split("T")[0],
      month: String(new Date().getMonth() + 1), // 1-12
      year: String(new Date().getFullYear()),
      status_active: true,
      status_inactive: true,
      status_archived: true,
      sort_by: "asc",
    },
  })

  // Watch values for dependent fields
  const watchBatchId = watch("batch_id")

  // ComboBox hooks
  const batchComboBox = useBatchComboBox()
  const studentComboBox = useStudentComboBox(watchBatchId)

  // Reset form when modal opens or report changes
  useEffect(() => {
    if (isOpen) {
      reset({
        batch_id: "",
        student_id: "",
        date: new Date().toISOString().split("T")[0],
        from_date: new Date().toISOString().split("T")[0],
        to_date: new Date().toISOString().split("T")[0],
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
        status_active: true,
        status_inactive: true,
        status_archived: true,
        sort_by: "asc",
      })
    }
  }, [isOpen, reportId, reset])

  const reportConfig = REPORT_TYPES.find((r) => r.id === reportId)

  const onSubmit = async (data: FormValues) => {
    setIsDownloading(true)
    try {
      const endpointMap: Record<string, string> = {
        "batch-wise": "/reports/attendance/batch-wise",
        "date-wise": "/reports/attendance/date-wise",
        "student-wise": "/reports/attendance/student-wise",
        "blank-monthly": "/reports/attendance/blank-monthly",
        "blank-monthly-reg-wise": "/reports/attendance/blank-monthly-reg-wise",
        "blank-sheet": "/reports/attendance/blank-sheet",
        "monthly-all-batches": "/reports/attendance/monthly-all-batches",
        "student-timing": "/reports/attendance/student-timing",
        "student-summary": "/reports/attendance/student-summary",
      }

      const endpoint = endpointMap[reportId]
      if (!endpoint) throw new Error("Unknown report type")

      // Build status_filters string
      const statuses = []
      if (data.status_active) statuses.push("active")
      if (data.status_inactive) statuses.push("inactive")
      if (data.status_archived) statuses.push("archived")
      const statusFilters = statuses.join(",")

      // Build specific query params based on report type
      const params: Record<string, any> = {}

      if (reportId !== "monthly-all-batches") {
        if (!data.batch_id) {
          toast.error("Please select a batch")
          setIsDownloading(false)
          return
        }
        params.batch_id = data.batch_id
      }

      const requiresStatusFilters = [
        "batch-wise",
        "blank-monthly",
        "blank-monthly-reg-wise",
        "blank-sheet",
        "student-timing",
      ].includes(reportId)

      if (requiresStatusFilters) {
        if (!statusFilters) {
          toast.error("Please select at least one status filter")
          setIsDownloading(false)
          return
        }
        params.status_filters = statusFilters
      }

      // Type-specific params
      switch (reportId) {
        case "batch-wise":
        case "blank-sheet":
          params.date = data.date
          if (reportId === "batch-wise") params.sort_by = data.sort_by
          break
        case "date-wise":
        case "student-timing":
          params.from_date = data.from_date
          params.to_date = data.to_date
          break
        case "student-wise":
        case "student-summary":
          if (!data.student_id) {
            toast.error("Please select a student")
            setIsDownloading(false)
            return
          }
          params.student_id = data.student_id
          params.from_date = data.from_date
          params.to_date = data.to_date
          break
        case "blank-monthly":
        case "blank-monthly-reg-wise":
        case "monthly-all-batches":
          params.month = data.month
          params.year = data.year
          break
      }

      await downloadPdfReport(endpoint, params, `${reportId}-report.pdf`)
      toast.success("Report Generated Successfully!")
    // onClose() // User can keep downloading or close manually
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to generate report")
    } finally {
      setIsDownloading(false)
    }
  }

  // UI Helper variables to determine what fields to show
  const showBatch = reportId !== "monthly-all-batches"
  const showStudent = ["student-wise", "student-summary"].includes(reportId)
  const showSingleDate = ["batch-wise", "blank-sheet"].includes(reportId)
  const showDateRange = [
    "date-wise",
    "student-wise",
    "student-timing",
    "student-summary",
  ].includes(reportId)
  const showMonthYear = [
    "blank-monthly",
    "blank-monthly-reg-wise",
    "monthly-all-batches",
  ].includes(reportId)
  const showStatusFilters = [
    "batch-wise",
    "blank-monthly",
    "blank-monthly-reg-wise",
    "blank-sheet",
    "student-timing",
  ].includes(reportId)
  const showSortBy = reportId === "batch-wise"

  // Years for dropdown (Current year +/- 2 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i))

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl">{reportConfig?.label}</DialogTitle>
          <DialogDescription>
            Configure the parameters below to generate your PDF report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {showBatch && (
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="batch_id"
                  render={({ field }) => (
                    <ComboBox
                      label="Batch"
                      required
                      placeholder="Select a batch"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={batchComboBox.options}
                      onSearch={batchComboBox.onSearch}
                      onLoadMore={batchComboBox.onLoadMore}
                      onReset={batchComboBox.onReset}
                      hasMore={batchComboBox.hasMore}
                      isLoading={batchComboBox.isLoading}
                      isLoadingMore={batchComboBox.isLoadingMore}
                      searchPlaceholder="Search batches..."
                      emptyText="No batches found."
                      disabled={isDownloading}
                    />
                  )}
                />
              </div>
            )}

            {showStudent && (
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="student_id"
                  render={({ field }) => (
                    <ComboBox
                      label="Student Name"
                      required
                      placeholder={
                        watchBatchId ? "Select a student" : "Select a batch first"
                      }
                      value={field.value}
                      onValueChange={field.onChange}
                      options={studentComboBox.options}
                      onSearch={studentComboBox.onSearch}
                      onLoadMore={studentComboBox.onLoadMore}
                      onReset={studentComboBox.onReset}
                      hasMore={studentComboBox.hasMore}
                      isLoading={studentComboBox.isLoading}
                      isLoadingMore={studentComboBox.isLoadingMore}
                      searchPlaceholder="Search students..."
                      emptyText="No students found."
                      disabled={!watchBatchId || isDownloading}
                    />
                  )}
                />
              </div>
            )}

            {showSingleDate && (
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePickerInput
                    label="Date"
                    required
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) =>
                      field.onChange(date ? date.toISOString().split("T")[0] : "")
                    }
                    placeholder="Select date"
                    disabled={isDownloading}
                  />
                )}
              />
            )}

            {showSortBy && (
              <Controller
                control={control}
                name="sort_by"
                render={({ field }) => (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Sort By
                    </Label>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                      disabled={isDownloading}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="asc" id="r1" disabled={isDownloading} />
                        <Label htmlFor="r1" className="cursor-pointer">
                          Ascending (A→Z)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="desc" id="r2" disabled={isDownloading} />
                        <Label htmlFor="r2" className="cursor-pointer">
                          Descending (Z→A)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              />
            )}

            {showDateRange && (
              <>
                <Controller
                  control={control}
                  name="from_date"
                  render={({ field }) => (
                    <DatePickerInput
                      label="From Date"
                      required
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) =>
                        field.onChange(date ? date.toISOString().split("T")[0] : "")
                      }
                      placeholder="Select from date"
                      disabled={isDownloading}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="to_date"
                  render={({ field }) => (
                    <DatePickerInput
                      label="To Date"
                      required
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) =>
                        field.onChange(date ? date.toISOString().split("T")[0] : "")
                      }
                      placeholder="Select to date"
                      disabled={isDownloading}
                    />
                  )}
                />
              </>
            )}

            {showMonthYear && (
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="month"
                  render={({ field }) => (
                    <CustomSelect
                      label="Month"
                      required
                      placeholder="Select Month"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={months}
                      disabled={isDownloading}
                      triggerClassName="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="year"
                  render={({ field }) => (
                    <CustomSelect
                      label="Year"
                      required
                      placeholder="Select Year"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={years.map(y => ({ value: y, label: y }))}
                      disabled={isDownloading}
                      triggerClassName="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm"
                    />
                  )}
                />
              </div>
            )}
          </div>

          {showStatusFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap gap-6 justify-center">
                <Controller
                  control={control}
                  name="status_active"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isDownloading}
                      />
                      <label
                        htmlFor="status-active"
                        className={`text-sm font-medium leading-none cursor-pointer ${
                          isDownloading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Active
                      </label>
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="status_inactive"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-inactive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isDownloading}
                      />
                      <label
                        htmlFor="status-inactive"
                        className={`text-sm font-medium leading-none cursor-pointer ${
                          isDownloading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Inactive
                      </label>
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="status_archived"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-archive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isDownloading}
                      />
                      <label
                        htmlFor="status-archive"
                        className={`text-sm font-medium leading-none cursor-pointer ${
                          isDownloading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Archive
                      </label>
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          <FormFooter 
            isLoading={isDownloading}
            submitLabel="View"
            loadingLabel="Generating..."
            cancelLabel="Close"
            onCancel={onClose}
            className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6"
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
