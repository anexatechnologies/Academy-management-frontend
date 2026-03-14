import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, X, UserCheck } from "lucide-react"
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
import { useEnquiries, useDeleteEnquiry } from "@/hooks/api/use-enquiries"
import { toast } from "sonner"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { ViewButton } from "@/components/ui/view-button"
import { SearchBar } from "@/components/ui/search-bar"
import { CustomSelect } from "@/components/ui/custom-select"
import { RequirePermission } from "@/components/auth/RequirePermission"
import { usePermissions } from "@/hooks/use-permissions"
import BodyLayout from "@/components/layout/BodyLayout"
import { DateCell } from "@/components/ui/date-cell"
import { DatePickerInput } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import type { EnquiryStatus } from "@/types/enquiry"

const STATUS_CONFIG: Record<EnquiryStatus, { label: string; className: string; dotColor: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  converted: {
    label: "Converted",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    dotColor: "bg-rose-500",
  },
}

const EnquiryListPage = () => {
  const navigate = useNavigate()
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()

  type EnquiryFilters = {
    status: string | undefined
    from_date: string | undefined
    to_date: string | undefined
  }

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<EnquiryFilters>({
    initialFilters: {
      status: undefined,
      from_date: undefined,
      to_date: undefined,
    },
    onFilterChange: () => setPage(1),
  })

  const { data, isLoading, isFetching } = useEnquiries({
    page,
    limit: pageSize,
    search,
    ...params,
  })

  useEffect(() => {
    if (data?.pagination?.totalData !== undefined) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const deleteEnquiry = useDeleteEnquiry()
  const { canUpdateEnquiry, canDeleteEnquiry } = usePermissions()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteEnquiry.mutateAsync(id)
      toast.success("Enquiry deleted successfully")
    } catch {
      toast.error("Failed to delete enquiry")
    } finally {
      setDeletingId(null)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isOverdue = (nextReminderDate?: string | null) => {
    if (!nextReminderDate) return false
    const d = new Date(nextReminderDate)
    d.setHours(0, 0, 0, 0)
    return d <= today
  }

  const breadcrumbs = useMemo(() => [{ label: "Enquiry Management" }], [])

  const hasFilters = !!(search || params.status || params.from_date || params.to_date)

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex flex-row items-center gap-3 px-2 py-2">
          <SearchBar
            placeholder="Search by name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <CustomSelect
            value={params.status || "all"}
            onValueChange={(val) => setFilter("status", val === "all" ? undefined : val)}
            triggerClassName="w-[150px]"
            options={[
              { value: "all", label: "All Status" },
              {
                value: "active",
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </div>
                ),
              },
              {
                value: "converted",
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Converted</span>
                  </div>
                ),
              },
              {
                value: "cancelled",
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Cancelled</span>
                  </div>
                ),
              },
            ]}
          />

          <DatePickerInput
            placeholder="From date"
            value={params.from_date ? new Date(params.from_date) : null}
            onChange={(date) =>
              setFilter("from_date", date ? date.toISOString().split("T")[0] : undefined)
            }
            className="w-[150px]"
          />
          <DatePickerInput
            placeholder="To date"
            value={params.to_date ? new Date(params.to_date) : null}
            onChange={(date) =>
              setFilter("to_date", date ? date.toISOString().split("T")[0] : undefined)
            }
            className="w-[150px]"
          />

          {hasFilters && (
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
        <RequirePermission module="enquiries" action="create">
          <Button
            onClick={() => navigate("/enquiries/new")}
            className="rounded-xl shadow-lg shadow-primary/20 h-10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Enquiry
          </Button>
        </RequirePermission>
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
              <TableHead className="w-[60px]">Sr No</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Enquiry Date</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead className="w-[130px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            loading={isLoading}
            fetching={isFetching && !isLoading}
            columnCount={7}
            rowCount={pageSize}
          >
            {!isLoading &&
              data?.data.map((enquiry, index) => {
                // Prefer next_follow_up from enquiry object, fall back to latest log's next_reminder_date
                const latestLog = enquiry.logs && enquiry.logs.length > 0
                  ? enquiry.logs[enquiry.logs.length - 1]
                  : null
                const nextReminder = enquiry.next_follow_up || latestLog?.next_reminder_date || null
                const statusCfg = STATUS_CONFIG[enquiry.status] ?? STATUS_CONFIG.active

                return (
                  <TableRow key={enquiry.id}>
                    <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {enquiry.first_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {[enquiry.first_name, enquiry.middle_name, enquiry.last_name]
                            .filter(Boolean)
                            .join(" ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{enquiry.personal_contact}</TableCell>
                    <TableCell>
                      <DateCell date={enquiry.created_at} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                          statusCfg.className
                        )}
                      >
                        {statusCfg.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {nextReminder ? (
                        <div className="flex items-center gap-2">
                          {isOverdue(nextReminder) && (
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Follow-up due!" />
                          )}
                          <DateCell date={nextReminder} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <ViewButton
                          title="Enquiry"
                          onView={() => navigate(`/enquiries/view/${enquiry.id}`)}
                        />
                        {canUpdateEnquiry && (
                          <>
                            <EditButton
                              title="Enquiry"
                              onEdit={() => navigate(`/enquiries/edit/${enquiry.id}`)}
                            />
                            {enquiry.status === "active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/students/new?enquiry_id=${enquiry.id}`)}
                                className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
                                title="Convert to Student"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        {canDeleteEnquiry && (
                          <DeleteButton
                            title="Enquiry"
                            loading={deletingId === enquiry.id}
                            onDelete={() => handleDelete(enquiry.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No enquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </BodyLayout>
  )
}

export default EnquiryListPage
