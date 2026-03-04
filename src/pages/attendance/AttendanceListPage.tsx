import { useState, useMemo, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePagination } from "@/hooks/use-pagination"
import { useSearchFilter } from "@/hooks/use-search-filter"
import { useAttendanceLogs } from "@/hooks/api/use-attendance"
import { SearchBar } from "@/components/ui/search-bar"
import { CustomSelect } from "@/components/ui/custom-select"
import { ComboBox } from "@/components/ui/combobox"
import BodyLayout from "@/components/layout/BodyLayout"
import { DateCell } from "@/components/ui/date-cell"
import { DatePickerInput } from "@/components/ui/date-picker"
import { useCourseComboBox, useBatchComboBox, useStudentComboBox } from "@/hooks/use-combobox-data"
import { format } from "date-fns"
import ManualAttendanceModal from "./components/ManualAttendanceModal"
import type { AttendanceFilters } from "@/types/attendance"

type SearchFilters = {
  student_id: string | undefined
  batch_id: string | undefined
  course_id: string | undefined
  slot: string | undefined
  source: string | undefined
  from_date: string | undefined
  to_date: string | undefined
}

const AttendanceListPage = () => {
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<SearchFilters>({
    initialFilters: {
      student_id: undefined,
      batch_id: undefined,
      course_id: undefined,
      slot: undefined,
      source: undefined,
      from_date: undefined,
      to_date: undefined,
    },
    onFilterChange: () => setPage(1)
  })

  const { data, isLoading, isFetching } = useAttendanceLogs({
    page,
    limit: pageSize,
    ...params as Partial<AttendanceFilters>,
    student_id: search || params.student_id,
  })

  // ComboBox hooks for filters
  const courseComboBox = useCourseComboBox()
  const batchComboBox = useBatchComboBox()
  const studentComboBox = useStudentComboBox(undefined, "student_id")

  // Sync total items with pagination hook
  useEffect(() => {
    if (data?.pagination?.totalData) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const breadcrumbs = useMemo(() => [{ label: "Attendance Management" }], [])

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex items-center gap-3 px-2 py-2 overflow-x-auto pb-4 sm:pb-2 scrollbar-none">
          <SearchBar
            placeholder="Search Biometric ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 shrink-0"
          />
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

          <ComboBox
            placeholder="Filter Student"
            value={params.student_id || ""}
            onValueChange={(val) => setFilter("student_id", val || undefined)}
            options={studentComboBox.options}
            onSearch={studentComboBox.onSearch}
            onLoadMore={studentComboBox.onLoadMore}
            onReset={studentComboBox.onReset}
            hasMore={studentComboBox.hasMore}
            isLoading={studentComboBox.isLoading}
            isLoadingMore={studentComboBox.isLoadingMore}
            searchPlaceholder="Search students..."
            emptyText="No students found."
            triggerClassName="w-[180px] h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 whitespace-nowrap"
          />

          <CustomSelect
            value={params.source || "all"}
            onValueChange={(val) => setFilter("source", val === "all" ? undefined : val as any)}
            triggerClassName="w-[130px] shrink-0"
            options={[
              { value: "all", label: "All Sources" },
              { value: "biometric", label: "Biometric" },
              { value: "manual", label: "Manual" }
            ]}
          />

          <CustomSelect
            value={params.slot || "all"}
            onValueChange={(val) => setFilter("slot", val === "all" ? undefined : val as any)}
            triggerClassName="w-[120px] shrink-0"
            options={[
              { value: "all", label: "All Slots" },
              { value: "ground", label: "Ground" },
              { value: "lecture", label: "Lecture" }
            ]}
          />

          <ComboBox
            placeholder="All Courses"
            value={params.course_id || ""}
            onValueChange={(val) => setFilter("course_id", val || undefined)}
            options={courseComboBox.options}
            onSearch={courseComboBox.onSearch}
            onLoadMore={courseComboBox.onLoadMore}
            onReset={courseComboBox.onReset}
            hasMore={courseComboBox.hasMore}
            isLoading={courseComboBox.isLoading}
            isLoadingMore={courseComboBox.isLoadingMore}
            searchPlaceholder="Search courses..."
            emptyText="No courses found."
            triggerClassName="w-[180px] h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shrink-0"
          />

          <ComboBox
            placeholder="All Batches"
            value={params.batch_id || ""}
            onValueChange={(val) => setFilter("batch_id", val || undefined)}
            options={batchComboBox.options}
            onSearch={batchComboBox.onSearch}
            onLoadMore={batchComboBox.onLoadMore}
            onReset={batchComboBox.onReset}
            hasMore={batchComboBox.hasMore}
            isLoading={batchComboBox.isLoading}
            isLoadingMore={batchComboBox.isLoadingMore}
            searchPlaceholder="Search batches..."
            emptyText="No batches found."
            triggerClassName="w-[180px] h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shrink-0"
          />

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

          <DatePickerInput
            value={params.from_date ? new Date(params.from_date) : null}
            onChange={(date) => setFilter("from_date", date ? date.toISOString().split("T")[0] : undefined)}
            placeholder="From Date"
            className="w-[140px] shrink-0"
          />

          <DatePickerInput
            value={params.to_date ? new Date(params.to_date) : null}
            onChange={(date) => setFilter("to_date", date ? date.toISOString().split("T")[0] : undefined)}
            placeholder="To Date"
            className="w-[140px] shrink-0"
          />

          {(search || params.source || params.slot || params.course_id || params.batch_id || params.student_id || params.from_date || params.to_date) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0 rounded-full"
              title="Clear filters"
            >
               <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      }
      actions={
        <Button 
          onClick={() => setIsManualModalOpen(true)} 
          className="rounded-xl shadow-lg shadow-primary/20 h-10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      }
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table
          page={page}
          pageSize={pageSize}
          totalPages={data?.pagination?.totalPages || 1}
          totalData={data?.pagination?.totalData || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        >
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Sr No</TableHead>
              <TableHead>Student Details</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Course / Batch</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={7} rowCount={pageSize}>
            {!isLoading && data?.data.map((log, index) => (
              <TableRow key={log.id}>
                <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{log.student_name}</span>
                    <span className="text-[11px] text-slate-500 font-mono tracking-wider">{log.biometric_id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <DateCell date={log.date} />
                    {log.punch_time && (
                      <span className="text-[11px] text-slate-400">
                        {(() => {
                          try {
                            return format(new Date(log.punch_time), "hh:mm a")
                          } catch (e) {
                            return log.punch_time
                          }
                        })()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-slate-600 dark:text-slate-400 text-sm">{log.time_slot}</span>
                </TableCell>
                <TableCell>
                  {!log.course_name && !log.batch_name ? (
                    <span className="text-slate-400 ml-1">-</span>
                  ) : (
                    <div className="flex flex-col max-w-[200px]">
                      <span className="text-sm font-medium truncate" title={log.course_name || ""}>{log.course_name || "-"}</span>
                      <span className="text-[11px] text-slate-500 truncate" title={log.batch_name || ""}>{log.batch_name || "-"}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {log.source === "biometric" ? (
                    <span className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Biometric
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Manual
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {log.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No attendance logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ManualAttendanceModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />
    </BodyLayout>
  )
}

export default AttendanceListPage
