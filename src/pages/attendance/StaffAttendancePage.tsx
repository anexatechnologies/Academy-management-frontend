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
import { useStaffAttendanceLogs } from "@/hooks/api/use-attendance"
import { SearchBar } from "@/components/ui/search-bar"
import { CustomSelect } from "@/components/ui/custom-select"
import BodyLayout from "@/components/layout/BodyLayout"
import { DateCell } from "@/components/ui/date-cell"
import { DatePickerInput } from "@/components/ui/date-picker"
import { format } from "date-fns"
import ManualStaffAttendanceModal from "./components/ManualStaffAttendanceModal"
import type { StaffAttendanceFilters } from "@/types/attendance"
import { usePermissions } from "@/hooks/use-permissions"

type SearchFilters = {
  staff_id: string | undefined
  staff_type: "teaching" | "non-teaching" | undefined
  from_date: string | undefined
  to_date: string | undefined
}

const StaffAttendancePage = () => {
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const { hasPermission } = usePermissions()
  const canMarkManualAttendance = hasPermission("attendance", "create")

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<SearchFilters>({
    initialFilters: {
      staff_id: undefined,
      staff_type: undefined,
      from_date: undefined,
      to_date: undefined,
    },
    onFilterChange: () => setPage(1)
  })

  const { data, isLoading, isFetching } = useStaffAttendanceLogs({
    page,
    limit: pageSize,
    ...params as Partial<StaffAttendanceFilters>,
    staff_id: search || params.staff_id,
  })

  // Sync total items with pagination hook
  useEffect(() => {
    if (data?.pagination?.totalData) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const breadcrumbs = useMemo(() => [
    { label: "Attendance Management", href: "/attendance" },
    { label: "Staff Attendance" }
  ], [])

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex flex-col gap-2 px-2 py-2">
          <div className="flex items-center gap-2">
            <SearchBar
              placeholder="Search Biometric ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-9 shrink-0"
            />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 shrink-0" />
            <CustomSelect
              value={params.staff_type || "all"}
              onValueChange={(val) => setFilter("staff_type", val === "all" ? undefined : val as any)}
              triggerClassName="w-[160px] h-9 shrink-0"
              options={[
                { value: "all", label: "All Staff Types" },
                { value: "teaching", label: "Teaching" },
                { value: "non-teaching", label: "Non-Teaching" }
              ]}
            />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 shrink-0" />
            <DatePickerInput
              value={params.from_date ? new Date(params.from_date) : null}
              onChange={(date) => setFilter("from_date", date ? date.toISOString().split("T")[0] : undefined)}
              placeholder="From Date"
              className="w-[130px] h-9 shrink-0"
            />
            <DatePickerInput
              value={params.to_date ? new Date(params.to_date) : null}
              onChange={(date) => setFilter("to_date", date ? date.toISOString().split("T")[0] : undefined)}
              placeholder="To Date"
              className="w-[130px] h-9 shrink-0"
            />
            {(search || params.staff_type || params.from_date || params.to_date) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetFilters}
                className="h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0 rounded-full"
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      }
      actions={
        canMarkManualAttendance ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsManualModalOpen(true)}
              className="rounded-xl shadow-lg shadow-primary/20 h-10"
            >
              <Plus className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        ) : undefined
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
              <TableHead>Staff Details</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Staff Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={6} rowCount={pageSize}>
            {!isLoading && data?.data.map((log, index) => (
              <TableRow key={log.id}>
                <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{log.staff_name}</span>
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
                  <span className="capitalize text-slate-600 dark:text-slate-400 text-sm">{log.staff_type.replace("-", " ")}</span>
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
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No attendance logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {canMarkManualAttendance && (
        <ManualStaffAttendanceModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
        />
      )}
    </BodyLayout>
  )
}

export default StaffAttendancePage
