import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
import { useBatches, useDeleteBatch, useToggleBatchStatus } from "@/hooks/api/use-batches"
import { toast } from "sonner"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { ViewButton } from "@/components/ui/view-button"
import { SearchBar } from "@/components/ui/search-bar"
import { CustomSelect } from "@/components/ui/custom-select"
import { ComboBox } from "@/components/ui/combobox"
import { RequirePermission } from "@/components/auth/RequirePermission"
import { usePermissions } from "@/hooks/use-permissions"
import BodyLayout from "@/components/layout/BodyLayout"
import { DateCell } from "@/components/ui/date-cell"
import { useCourseComboBox } from "@/hooks/use-combobox-data"

const BatchesListPage = () => {
  const navigate = useNavigate()
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  type BatchFilters = {
    status?: string
    course_id?: string
  }

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<BatchFilters>({
    initialFilters: {
      status: undefined,
      course_id: undefined,
    },
    onFilterChange: () => setPage(1),
  })

  const { data, isLoading, isFetching } = useBatches({
    page,
    limit: pageSize,
    search,
    ...params,
  })

  const courseComboBox = useCourseComboBox()

  useEffect(() => {
    if (data?.pagination?.totalData) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const deleteBatch = useDeleteBatch()
  const toggleStatus = useToggleBatchStatus()
  const { canUpdateBatch, canDeleteBatch } = usePermissions()

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteBatch.mutateAsync(id)
      toast.success("Batch deleted successfully")
    } catch {
      toast.error("Failed to delete batch")
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
        success: `Batch ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        error: (err: unknown) => {
          const error = err as Error & { response?: { data?: { message?: string } } }
          return error.response?.data?.message || "Failed to update status"
        },
      }
    )
  }

  const breadcrumbs = useMemo(() => [{ label: "Batch Management" }], [])

  const colCount = (canUpdateBatch || canDeleteBatch) ? 8 : 7

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex items-center gap-3 px-2 py-2">
          <SearchBar
            placeholder="Search batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

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
            triggerClassName="w-[180px] h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
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
                ),
              },
              {
                value: "inactive",
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Inactive</span>
                  </div>
                ),
              },
            ]}
          />

          {(search || params.status || params.course_id) && (
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
        <RequirePermission module="batches" action="create">
          <Button onClick={() => navigate("/batches/new")} className="rounded-xl shadow-lg shadow-primary/20 h-10">
            <Plus className="mr-2 h-4 w-4" />
            Add Batch
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
              <TableHead>Batch Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              {(canUpdateBatch || canDeleteBatch) && (
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={colCount} rowCount={pageSize}>
            {!isLoading && data?.data.map((batch, index) => (
              <TableRow key={batch.id}>
                <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                  {batch.name}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    {batch.course_name}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{batch.capacity}</TableCell>
                <TableCell>
                  <DateCell date={batch.start_date} />
                </TableCell>
                <TableCell>
                  <DateCell date={batch.end_date} />
                </TableCell>
                <TableCell>
                  <CustomSelect
                    value={batch.status}
                    disabled={!canUpdateBatch}
                    onValueChange={() => handleToggleStatus(batch.id, batch.status)}
                    triggerClassName="h-8 w-[130px] text-sm font-medium"
                    options={[
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
                        value: "inactive",
                        label: (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            <span>Inactive</span>
                          </div>
                        ),
                      },
                    ]}
                  />
                </TableCell>
                {(canUpdateBatch || canDeleteBatch) && (
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <ViewButton
                        title="Batch"
                        onView={() => navigate(`/batches/view/${batch.id}`)}
                      />
                      {canUpdateBatch && (
                        <EditButton title="Batch" onEdit={() => navigate(`/batches/edit/${batch.id}`)} />
                      )}
                      {canDeleteBatch && (
                        <DeleteButton
                          title="Batch"
                          loading={deletingId === batch.id}
                          onDelete={() => handleDelete(batch.id)}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={colCount} className="h-32 text-center text-muted-foreground">
                  No batches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </BodyLayout>
  )
}

export default BatchesListPage
