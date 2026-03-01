import { useState, useMemo, useEffect } from "react"
import { RequirePermission } from "@/components/auth/RequirePermission"
import { usePermissions } from "@/hooks/use-permissions"
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
import { useCourses, useDeleteCourse, useToggleCourseStatus } from "@/hooks/api/use-courses"
import BodyLayout from "@/components/layout/BodyLayout"
import { toast } from "sonner"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { SearchBar } from "@/components/ui/search-bar"
import { CustomSelect } from "@/components/ui/custom-select"
import { useSearchFilter } from "@/hooks/use-search-filter"
import { usePagination } from "@/hooks/use-pagination"

const CoursesListPage = () => {
  const navigate = useNavigate()
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()

  type CourseFilters = {
    status?: string
  }

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<CourseFilters>({
    initialFilters: {},
    onFilterChange: () => setPage(1),
  })

  const { data, isLoading, isFetching } = useCourses({
    page,
    limit: pageSize,
    ...params,
  })

  // Sync total items with pagination hook
  useEffect(() => {
    if (data?.pagination?.totalData) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const deleteCourse = useDeleteCourse()
  const { mutate: toggleStatus } = useToggleCourseStatus()
  const { canUpdateCourse, canDeleteCourse } = usePermissions()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteCourse.mutateAsync(id)
      toast.success("Course deleted successfully")
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to delete course")
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = (id: number, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus) return

    toast.promise(
      new Promise((resolve, reject) => {
        toggleStatus(id, {
          onSuccess: resolve,
          onError: reject,
        })
      }),
      {
        loading: "Updating status...",
        success: "Course status updated",
        error: (err: unknown) => {
          const error = err as Error & { response?: { data?: { message?: string } } };
          return error.response?.data?.message || "Failed to update status";
        },
      }
    )
  }

  const breadcrumbs = useMemo(() => [{ label: "Course Management" }], [])

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex items-center gap-3 px-2 py-2">
          <SearchBar
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          
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

          {(search || params.status) && (
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
        <RequirePermission module="courses" action="create">
          <Button onClick={() => navigate("/courses/new")} className="rounded-xl shadow-lg shadow-primary/20 h-10">
            <Plus className="mr-2 h-4 w-4" />
            Add Course
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
              <TableHead className="w-[80px]">Sr NO</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Course Fees</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              {(canUpdateCourse || canDeleteCourse) && (
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={(canUpdateCourse || canDeleteCourse) ? 5 : 4} rowCount={pageSize}>
            {!isLoading && data?.data.map((course, index) => (
              <TableRow key={course.id}>
                <TableCell className="text-slate-500 font-medium">
                  {(page - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                  {course.name}
                </TableCell>
                <TableCell className="font-medium text-primary">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(course.fees)}
                </TableCell>
                <TableCell>
                  <CustomSelect
                    value={course.status}
                    disabled={!canUpdateCourse}
                    onValueChange={(val) => handleStatusChange(course.id, course.status, val)}
                    triggerClassName="h-8 w-[120px] text-sm font-medium"
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
                {(canUpdateCourse || canDeleteCourse) && (
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      {canUpdateCourse && (
                        <EditButton title="Course" onEdit={() => navigate(`/courses/edit/${course.id}`)} />
                      )}
                      {canDeleteCourse && (
                        <DeleteButton
                          title="Course"
                          loading={deletingId === course.id}
                          onDelete={() => handleDelete(course.id)}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={(canUpdateCourse || canDeleteCourse) ? 5 : 4} className="h-32 text-center text-muted-foreground">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </BodyLayout>
  )
}

export default CoursesListPage
