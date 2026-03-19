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
import { useStudents, useDeactivateStudent, useToggleStudentStatus } from "@/hooks/api/use-students"
import { GENDER_TYPES } from "@/utils/student-constants"
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
import { cn } from "@/lib/utils"
import { DateCell } from "@/components/ui/date-cell"
import { useCourseComboBox, useBatchComboBox } from "@/hooks/use-combobox-data"

const StudentsListPage = () => {
  const navigate = useNavigate()
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()

  type StudentFilters = {
    status: string | undefined
    gender: string | undefined
    course_id: string | undefined
    batch_id: string | undefined
    payment_status: "pending" | "overdue" | undefined
  }

  const { search, setSearch, params, setFilter, resetFilters } = useSearchFilter<StudentFilters>({
    initialFilters: {
      status: undefined,
      gender: undefined,
      course_id: undefined,
      batch_id: undefined,
      payment_status: undefined,
    },
    onFilterChange: () => setPage(1)
  })

  const { data, isLoading, isFetching } = useStudents({
    page,
    limit: pageSize,
    search,
    ...params
  })

  // ComboBox hooks for Course and Batch filters
  const courseComboBox = useCourseComboBox()
  const batchComboBox = useBatchComboBox()

  // Sync total items with pagination hook
  useEffect(() => {
    if (data?.pagination?.totalData) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const deactivateStudent = useDeactivateStudent()
  const toggleStatus = useToggleStudentStatus()
  const { 
    canUpdateStudent, 
    canDeleteStudent, 
    canReadStudent, 
    canReadPayments 
  } = usePermissions()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDeactivate = async (id: number) => {
    setDeletingId(id)
    try {
      await deactivateStudent.mutateAsync(id)
      toast.success("Student deactivated successfully")
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Failed to deactivate student")
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: number) => {
    toast.promise(
      new Promise((resolve, reject) => {
        toggleStatus.mutate(id, {
          onSuccess: resolve,
          onError: reject,
        })
      }),
      {
        loading: "Updating status...",
        success: "Student status updated",
        error: (err: unknown) => {
          const error = err as Error & { response?: { data?: { message?: string } } }
          return error.response?.data?.message || "Failed to update status"
        },
      }
    )
  }

  const breadcrumbs = useMemo(() => [{ label: "Student Management" }], [])

  const colCount = (canUpdateStudent || canDeleteStudent) ? 8 : 7

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex items-center gap-3 px-2 py-2">
          <SearchBar
            placeholder="Search students..."
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

          <CustomSelect
            value={params.gender || "all"}
            onValueChange={(val) => setFilter("gender", val === "all" ? undefined : val)}
            triggerClassName="w-[140px]"
            options={[
              { value: "all", label: "All Genders" },
              ...GENDER_TYPES
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
            triggerClassName="w-[180px] h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
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
            triggerClassName="w-[180px] h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
          />
          
          {canReadPayments && (
            <CustomSelect
              value={params.payment_status || "all"}
              onValueChange={(val) => setFilter("payment_status", val === "all" ? undefined : val as any)}
              triggerClassName="w-[160px]"
              options={[
                { value: "all", label: "Payment Status" },
                {
                  value: "pending",
                  label: (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Pending Dues</span>
                    </div>
                  )
                },
                {
                  value: "overdue",
                  label: (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <span>Overdue Dues</span>
                    </div>
                  )
                }
              ]}
            />
          )}

          {(search || params.status || params.gender || params.course_id || params.batch_id || params.payment_status) && (
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
        <RequirePermission module="student" action="create">
          <Button onClick={() => navigate("/students/new")} className="rounded-xl shadow-lg shadow-primary/20 h-10">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
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
              <TableHead>Student Name</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Reg. Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              {(canUpdateStudent || canDeleteStudent) && (
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={colCount} rowCount={pageSize}>
            {!isLoading && data?.data.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} className="h-full w-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <div className="flex flex-col">
                      {canReadStudent ? (
                        <Link to={`/students/view/${student.id}`} className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary dark:hover:text-primary hover:underline transition-colors w-fit">
                          {student.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-900 dark:text-slate-100 w-fit">
                          {student.name}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 font-mono tracking-wider">{student.student_id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.personal_contact}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                    student.gender === "Male"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : student.gender === "Female"
                      ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    {student.gender}
                  </span>
                </TableCell>
                <TableCell>
                  <DateCell date={student.registration_date} />
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {[student.city, student.state].filter(Boolean).join(", ") || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <CustomSelect
                    value={student.status}
                    disabled={!canUpdateStudent}
                    onValueChange={() => handleToggleStatus(student.id)}
                    triggerClassName="h-8 w-[130px] text-sm font-medium"
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
                {(canUpdateStudent || canDeleteStudent) && (
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <ViewButton
                        title="Student"
                        onView={() => navigate(`/students/view/${student.id}`)}
                      />
                      {canUpdateStudent && (
                        <EditButton title="Student" onEdit={() => navigate(`/students/edit/${student.id}`)} />
                      )}
                      {canDeleteStudent && (
                        <DeleteButton
                          title="Student"
                          loading={deletingId === student.id}
                          onDelete={() => handleDeactivate(student.id)}
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
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </BodyLayout>
  )
}

export default StudentsListPage
