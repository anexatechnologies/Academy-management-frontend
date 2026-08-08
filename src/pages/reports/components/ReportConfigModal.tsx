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
import { useBatchComboBox, useStudentComboBox, useCourseComboBox } from "@/hooks/use-combobox-data"
import { useDownloadReport } from "@/hooks/api/use-reports"
import { ALL_REPORT_TYPES } from "../ReportsPage"
import { toast } from "sonner"

interface ReportConfigModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: string
}

interface FormValues {
  batch_id: string
  student_id: string
  course_id: string
  date: string
  from_date: string
  to_date: string
  month: string
  year: string
  status_active: boolean
  status_inactive: boolean
  status_archived: boolean
  sort_by: string
  staff_type: string
  slot_type: string
  excel_status: string
  excel_fields: string[]
}

const EXCEL_FIELDS = [
  { id: 'first_name', label: 'First Name' },
  { id: 'middle_name', label: 'Middle Name' },
  { id: 'last_name', label: 'Last Name' },
  { id: 'registration_no', label: 'Registration No' },
  { id: 'attendance_id', label: 'Attendance ID' },
  { id: 'gender', label: 'Gender' },
  { id: 'date_of_birth', label: 'Date of Birth' },
  { id: 'registration_date', label: 'Registration Date' },
  { id: 'personal_contact', label: 'Personal Contact' },
  { id: 'father_contact', label: 'Father Contact' },
  { id: 'mother_contact', label: 'Mother Contact' },
  { id: 'email', label: 'Email' },
  { id: 'adhar_no', label: 'Aadhar No' },
  { id: 'address', label: 'Address' },
  { id: 'city', label: 'City' },
  { id: 'state', label: 'State' },
  { id: 'pincode', label: 'Pincode' },
  { id: 'status', label: 'Status' },
  { id: 'category', label: 'Category' },
  { id: 'religion', label: 'Religion' },
  { id: 'caste', label: 'Caste' },
  { id: 'nationality', label: 'Nationality' },
  { id: 'place_of_birth', label: 'Place of Birth' },
  { id: 'height', label: 'Height' }
]

export default function ReportConfigModal({
  isOpen,
  onClose,
  reportId,
}: ReportConfigModalProps) {
  const { downloadPdfReport, downloadExcelReport } = useDownloadReport()
  const [isDownloading, setIsDownloading] = useState(false)

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      batch_id: "",
      student_id: "",
      course_id: "",
      date: new Date().toISOString().split("T")[0],
      from_date: new Date().toISOString().split("T")[0],
      to_date: new Date().toISOString().split("T")[0],
      month: String(new Date().getMonth() + 1), // 1-12
      year: String(new Date().getFullYear()),
      status_active: true,
      status_inactive: true,
      status_archived: true,
      sort_by: "asc",
      staff_type: "all",
      slot_type: "both",
      excel_status: "all",
      excel_fields: ['first_name', 'last_name', 'registration_no', 'personal_contact'],
    },
  })

  // Watch values for dependent fields
  const watchBatchId = watch("batch_id")

  // ComboBox hooks
  const batchComboBox = useBatchComboBox()
  const studentComboBox = useStudentComboBox(watchBatchId)
  const courseComboBox = useCourseComboBox()

  // Reset form when modal opens or report changes
  useEffect(() => {
    if (isOpen) {
      reset({
        batch_id: "",
        student_id: "",
        course_id: "",
        date: new Date().toISOString().split("T")[0],
        from_date: new Date().toISOString().split("T")[0],
        to_date: new Date().toISOString().split("T")[0],
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
        status_active: true,
        status_inactive: true,
        status_archived: true,
        sort_by: "asc",
        staff_type: "all",
        slot_type: "both",
        excel_status: "all",
        excel_fields: ['first_name', 'last_name', 'registration_no', 'personal_contact'],
      })
    }
  }, [isOpen, reportId, reset])

  const reportConfig = ALL_REPORT_TYPES.find((r) => r.id === reportId)

  const onSubmit = async (data: FormValues) => {
    setIsDownloading(true)
    try {
      if (reportId === "student-excel-export") {
        const filters: Record<string, any> = {}
        if (data.course_id) filters.course_id = Number(data.course_id)
        if (data.batch_id) filters.batch_id = Number(data.batch_id)
        if (data.excel_status !== "all") {
          filters.status = data.excel_status
        }
        
        await downloadExcelReport("/students/export", {
          filters,
          fields: data.excel_fields
        })
        toast.success("Excel report downloaded successfully!")
        setIsDownloading(false)
        return
      }

      const endpointMap: Record<string, string> = {
        "batch-wise": "/reports/attendance/batch-wise",
        "date-wise": "/reports/attendance/date-wise",
        "student-wise": "/reports/attendance/student-wise",
        "blank-monthly": "/reports/attendance/blank-monthly",
        "blank-monthly-reg-wise": "/reports/attendance/blank-monthly-reg-wise",
        "blank-sheet": "/reports/attendance/blank-sheet",
        "monthly-all-batches": "/reports/attendance/batch-monthly",
        "student-timing": "/reports/attendance/student-timing",
        "student-summary": "/reports/attendance/student-summary",
        "master": "/reports/attendance/master",
        "staff-monthly": "/reports/attendance/staff-monthly",
        "staff-timing": "/reports/attendance/staff-timing",
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

      const isStaffReport = reportId.startsWith("staff-")

      if (reportId !== "master" && !isStaffReport) {
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
        case "staff-monthly":
          params.month = data.month
          params.year = data.year
          if (reportId === "monthly-all-batches") {
            params.slot_type = data.slot_type
          }
          if (isStaffReport && data.staff_type !== "all") {
            params.staff_type = data.staff_type === "teaching" ? "Teaching" : "Non-Teaching"
          }
          break
        case "master":
          params.from_date = data.from_date
          params.to_date = data.to_date
          // Build status_filters for master (active/inactive only, no archived)
          const masterStatuses = []
          if (data.status_active) masterStatuses.push("active")
          if (data.status_inactive) masterStatuses.push("inactive")
          if (masterStatuses.length > 0) params.status_filters = masterStatuses.join(",")
          break
        case "staff-timing":
          params.from_date = data.from_date
          params.to_date = data.to_date
          if (data.staff_type !== "all") {
            params.staff_type = data.staff_type === "teaching" ? "Teaching" : "Non-Teaching"
          }
          break
      }

      await downloadPdfReport(endpoint, params)
      toast.success("Report opened successfully!")
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to generate report")
    } finally {
      setIsDownloading(false)
    }
  }

  // UI Helper variables to determine what fields to show
  const isExcelExport = reportId === "student-excel-export"
  const showBatch = reportId !== "master" && !reportId.startsWith("staff-")
  const showCourse = isExcelExport
  const showStudent = ["student-wise", "student-summary"].includes(reportId)
  const showSingleDate = ["batch-wise", "blank-sheet"].includes(reportId)
  const showDateRange = [
    "date-wise",
    "student-wise",
    "student-timing",
    "student-summary",
    "master",
    "staff-timing",
  ].includes(reportId)
  const showMonthYear = [
    "blank-monthly",
    "blank-monthly-reg-wise",
    "monthly-all-batches",
    "staff-monthly",
  ].includes(reportId)
  const showStatusFilters = [
    "batch-wise",
    "blank-monthly",
    "blank-monthly-reg-wise",
    "blank-sheet",
    "student-timing",
  ].includes(reportId)
  const showMasterStatusFilters = reportId === "master"
  const showSortBy = reportId === "batch-wise"
  const showStaffType = reportId.startsWith("staff-")
  const showSlotType = reportId === "monthly-all-batches"

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
      <DialogContent className="sm:max-w-[600px] border-slate-200 dark:border-slate-800 p-0 flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-xl">{reportConfig?.label}</DialogTitle>
            <DialogDescription>
              Configure the parameters below to generate your PDF report.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {showCourse && (
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="course_id"
                  render={({ field }) => (
                    <ComboBox
                      label="Course (Optional)"
                      placeholder="All Courses"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={courseComboBox.options}
                      onSearch={courseComboBox.onSearch}
                      onLoadMore={courseComboBox.onLoadMore}
                      onReset={courseComboBox.onReset}
                      hasMore={courseComboBox.hasMore}
                      isLoading={courseComboBox.isLoading}
                      isLoadingMore={courseComboBox.isLoadingMore}
                      searchPlaceholder="Search courses..."
                      emptyText="No courses found."
                      disabled={isDownloading}
                    />
                  )}
                />
              </div>
            )}

            {showBatch && (
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="batch_id"
                  render={({ field }) => (
                    <ComboBox
                      label={isExcelExport ? "Batch (Optional)" : "Batch"}
                      required={!isExcelExport}
                      placeholder={isExcelExport ? "All Batches" : "Select a batch"}
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
                      <RadioGroupItem value="asc" label="Ascending (A→Z)" disabled={isDownloading} />
                      <RadioGroupItem value="desc" label="Descending (Z→A)" disabled={isDownloading} />
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

            {showStaffType && (
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="staff_type"
                  render={({ field }) => (
                    <CustomSelect
                      label="Staff Type"
                      placeholder="All Staff Types"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { value: "all", label: "All Types" },
                        { value: "teaching", label: "Teaching" },
                        { value: "non-teaching", label: "Non-Teaching" },
                      ]}
                      disabled={isDownloading}
                      triggerClassName="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm"
                    />
                  )}
                />
              </div>
            )}

            {showSlotType && (
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="slot_type"
                  render={({ field }) => (
                    <CustomSelect
                      label="Slot Type"
                      required
                      placeholder="Select Slot Type"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { value: "ground", label: "Ground" },
                        { value: "lecture", label: "Lecture" },
                        { value: "both", label: "Both" },
                      ]}
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
                  <Checkbox
                    id="status-active"
                    label="Active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isDownloading}
                  />
                )}
              />
              <Controller
                control={control}
                name="status_inactive"
                render={({ field }) => (
                  <Checkbox
                    id="status-inactive"
                    label="Inactive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isDownloading}
                  />
                )}
              />
              <Controller
                control={control}
                name="status_archived"
                render={({ field }) => (
                  <Checkbox
                    id="status-archive"
                    label="Archive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isDownloading}
                  />
                )}
              />
            </div>
            </div>
          )}

          {showMasterStatusFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="mb-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Student Status <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <p className="text-[11px] text-slate-500 mt-0.5">Filter which students to include in the report.</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <Controller
                  control={control}
                  name="status_active"
                  render={({ field }) => (
                    <Checkbox
                      id="master-status-active"
                      label="Active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isDownloading}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="status_inactive"
                  render={({ field }) => (
                    <Checkbox
                      id="master-status-inactive"
                      label="Inactive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isDownloading}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {isExcelExport && (
            <div className="space-y-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="excel_status"
                  render={({ field }) => (
                    <CustomSelect
                      label="Student Status (Optional)"
                      placeholder="All Statuses"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { value: "all", label: "All Statuses" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                        { value: "archived", label: "Archived" },
                      ]}
                      disabled={isDownloading}
                      triggerClassName="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm"
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name="excel_fields"
                  render={({ field: { value, onChange } }) => (
                    <>
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select Fields to Export
                          </Label>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Choose the data columns you want to include in the Excel report.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (value.length === EXCEL_FIELDS.length) {
                              onChange([])
                            } else {
                              onChange(EXCEL_FIELDS.map(f => f.id))
                            }
                          }}
                          className="text-xs font-medium text-primary hover:underline focus:outline-none disabled:opacity-50 mt-1"
                          disabled={isDownloading}
                        >
                          {value.length === EXCEL_FIELDS.length ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                      {EXCEL_FIELDS.map((f) => (
                        <Checkbox
                          key={f.id}
                          id={`excel-field-${f.id}`}
                          label={f.label}
                          checked={value.includes(f.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onChange([...value, f.id])
                            } else {
                              onChange(value.filter((v) => v !== f.id))
                            }
                          }}
                          disabled={isDownloading}
                        />
                      ))}
                    </div>
                    </>
                  )}
                />
              </div>
            </div>
          )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mt-auto shrink-0 rounded-b-lg">
            <FormFooter 
              isLoading={isDownloading}
              submitLabel={isExcelExport ? "Download Excel" : "View"}
              loadingLabel="Generating..."
              cancelLabel="Close"
              onCancel={onClose}
              className="pt-0 border-none mt-0 bg-transparent"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
