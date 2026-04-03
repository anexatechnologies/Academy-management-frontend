import { useState, useMemo, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
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
import { useStaffList, useDeleteStaff, useToggleStaffStatus } from "@/hooks/api/use-staff"
import { STAFF_TYPES } from "@/utils/staff-constants"
import { toast } from "sonner"
import { handleApiError } from "@/utils/api-error"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { ViewButton } from "@/components/ui/view-button"
import { SearchBar } from "@/components/ui/search-bar"
import { CustomSelect } from "@/components/ui/custom-select"
import { RequirePermission } from "@/components/auth/RequirePermission"
import { usePermissions } from "@/hooks/use-permissions"
import BodyLayout from "@/components/layout/BodyLayout"
import { cn } from "@/lib/utils"
import { DateCell } from "@/components/ui/date-cell"

const StaffListPage = () => {
  const navigate = useNavigate()
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()
  
  type StaffFilters = {
    staff_type: string | undefined
    status: string | undefined
  }

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<StaffFilters>({
    initialFilters: {
      staff_type: undefined,
      status: undefined,
    },
    onFilterChange: () => setPage(1)
  })

  const { data, isLoading, isFetching } = useStaffList({
    page,
    limit: pageSize,
    search,
    ...params
  })

  // Sync total items with pagination hook
  useEffect(() => {
    if (data?.pagination?.totalData) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const deleteStaff = useDeleteStaff()
  const toggleStatus = useToggleStaffStatus()
  const { canUpdateStaff, canDeleteStaff, canReadStaff } = usePermissions()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteStaff.mutateAsync(id)
      toast.success("Staff deleted successfully")
    } catch (error) {
      handleApiError(error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    toast.promise(
      new Promise((resolve, reject) => {
        toggleStatus.mutate(
          { id, status: newStatus },
          { onSuccess: resolve, onError: reject }
        )
      }),
      {
        loading: "Updating status...",
        success: `Staff ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        error: (err: unknown) => {
          const error = err as Error & { response?: { data?: { message?: string } } }
          return error.response?.data?.message || "Failed to update status"
        },
      }
    )
  }

  const breadcrumbs = useMemo(() => [{ label: "Staff Management" }], [])

  return (
    <BodyLayout 
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex items-center gap-3 px-2 py-2">
          <SearchBar
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          
          <CustomSelect
            value={params.staff_type || "all"}
            onValueChange={(val) => setFilter("staff_type", val === "all" ? undefined : val)}
            triggerClassName="w-[150px]"
            options={[
              { value: "all", label: "All Types" },
              ...STAFF_TYPES
            ]}
          />

          <CustomSelect
            value={params.status || "all"}
            onValueChange={(val) => setFilter("status", val === "all" ? undefined : val)}
            triggerClassName="w-[140px]"
            options={[
              { value: "all", label: "All Status" },
              {
                value: "active",
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </div>
                )
              },
              {
                value: "inactive",
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Inactive</span>
                  </div>
                )
              }
            ]}
          />

          {(search || params.staff_type || params.status) && (
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
        <RequirePermission module="staff" action="create">
          <Button onClick={() => navigate("/staff/new")} className="rounded-xl shadow-lg shadow-primary/20 h-10">
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
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
              <TableHead className="w-[80px]">Sr No</TableHead>
              <TableHead>Staff Name</TableHead>
              <TableHead>Staff Type</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              {(canReadStaff || canUpdateStaff || canDeleteStaff) && (
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={(canReadStaff || canUpdateStaff || canDeleteStaff) ? 8 : 7} rowCount={pageSize}>
            {!isLoading && data?.data.map((staff, index) => (
              <TableRow key={staff.id}>
                <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      {staff.photo_url ? (
                        <img src={staff.photo_url} alt={staff.full_name} className="h-full w-full object-cover" />
                      ) : (
                        staff.full_name.charAt(0)
                      )}
                    </div>
                    {canReadStaff ? (
                      <Link to={`/staff/view/${staff.id}`} className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary dark:hover:text-primary hover:underline transition-colors w-fit">
                        {staff.full_name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{staff.full_name}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                    staff.staff_type === "Teaching" 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    {staff.staff_type}
                  </span>
                </TableCell>
                <TableCell>{staff.contact_number}</TableCell>
                <TableCell>
                  <DateCell date={staff.joining_date} />
                </TableCell>
                <TableCell>{staff.experience_years} Years</TableCell>
                <TableCell>
                  <CustomSelect
                    value={staff.status}
                    disabled={!canUpdateStaff}
                    onValueChange={() => handleToggleStatus(staff.id, staff.status)}
                    triggerClassName="h-8 w-[110px] text-sm font-medium"
                    options={[
                      {
                        value: "active",
                        label: (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </div>
                        )
                      },
                      {
                        value: "inactive",
                        label: (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            <span>Inactive</span>
                          </div>
                        )
                      }
                    ]}
                  />
                </TableCell>
                {(canReadStaff || canUpdateStaff || canDeleteStaff) && (
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      {canReadStaff && (
                        <ViewButton 
                          title="Staff" 
                          onView={() => navigate(`/staff/view/${staff.id}`)} 
                        />
                      )}
                      {canUpdateStaff && (
                        <EditButton title="Staff" onEdit={() => navigate(`/staff/edit/${staff.id}`)} />
                      )}
                      {canDeleteStaff && (
                        <DeleteButton
                          title="Staff"
                          loading={deletingId === staff.id}
                          onDelete={() => handleDelete(staff.id)}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={(canReadStaff || canUpdateStaff || canDeleteStaff) ? 8 : 7} className="h-32 text-center text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </BodyLayout>
  )
}

export default StaffListPage
