import { useState, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, UserCheck, IndianRupee, Gift, AlertCircle, Send, Printer, Loader2, type LucideIcon } from "lucide-react"
import { 
  useStudentCount, 
  useAttendanceSummary, 
  useFeesSummary,
  useTodayBirthdays,
  useDuePayments,
  useSendBirthdayWishes,
  useSendDueFeesReminders
} from "@/hooks/api/use-dashboard"
import { usePermissions } from "@/hooks/use-permissions"
import { Skeleton } from "@/components/ui/skeleton"
import { usePagination } from "@/hooks/use-pagination"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StudentDemographicsChart } from "./dashboard/components/StudentDemographicsChart"
import { AttendanceOverviewChart } from "./dashboard/components/AttendanceOverviewChart"
import { MonthlyFeesPerformanceTable } from "./dashboard/components/MonthlyFeesPerformanceTable"
import { useCertificates } from "@/hooks/api/use-certificates"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DateCell } from "@/components/ui/date-cell"
import { toast } from "sonner"
import { useUpdateInstallmentDueDate } from "@/hooks/api/use-payments"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { CalendarClock } from "lucide-react"
import { useEffect } from "react"

export default function Dashboard() {
  const { canReadFinancials, isSuperAdmin } = usePermissions()
  const { data: studentCount, isLoading: isLoadingStudents } = useStudentCount()
  const { data: attendance, isLoading: isLoadingAttendance } = useAttendanceSummary()
  const { data: fees, isLoading: isLoadingFees } = useFeesSummary({ enabled: isSuperAdmin })

  const { page: bPage, pageSize: bPageSize, setPage: setBPage, setPageSize: setBPageSize } = usePagination()
  const { page: pPage, pageSize: pPageSize, setPage: setPPage, setPageSize: setPPageSize } = usePagination()

  const { data: birthdays, isLoading: isLoadingBirthdays, isFetching: isFetchingBirthdays } = useTodayBirthdays({
    page: bPage,
    limit: bPageSize,
  })

  const { data: payments, isLoading: isLoadingPayments, isFetching: isFetchingPayments } = useDuePayments({
    page: pPage,
    limit: pPageSize,
  }, { enabled: canReadFinancials })

  const { mutate: sendWishes, isPending: isSendingWishes } = useSendBirthdayWishes()
  const { mutate: sendReminders, isPending: isSendingReminders } = useSendDueFeesReminders()

  const [printingId, setPrintingId] = useState<number | string | null>(null)
  const [changeDateRecord, setChangeDateRecord] = useState<any | null>(null)
  const { downloadCertificate } = useCertificates()
  const [isPrintingReport, setIsPrintingReport] = useState(false)

  type DashboardStat = {
    title: string
    value: ReactNode
    icon: LucideIcon
    description: ReactNode
    isLoading: boolean
  }

  const stats: DashboardStat[] = [
    {
      title: "Total Students",
      value: studentCount?.total || 0,
      icon: Users,
      description: (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{studentCount?.active || 0} active</span>
            <span className="text-muted-foreground">{studentCount?.inactive || 0} inactive</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${studentCount?.total ? ((studentCount.active / studentCount.total) * 100) : 0}%` }} 
            />
          </div>
        </div>
      ),
      isLoading: isLoadingStudents,
    },
    {
      title: "Today's Attendance",
      value: attendance ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Ground</p>
            <p className="text-2xl font-bold tabular-nums">{attendance.ground.present}</p>
            <p className="text-[11px] text-muted-foreground">present</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Lecture</p>
            <p className="text-2xl font-bold tabular-nums">{attendance.lecture.present}</p>
            <p className="text-[11px] text-muted-foreground">present</p>
          </div>
        </div>
      ) : (
        0
      ),
      icon: UserCheck,
      description: attendance ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between gap-1 text-[11px] leading-tight">
              <span className="text-emerald-600 font-medium">{attendance.ground.present} present</span>
              <span className="text-rose-500 font-medium">{attendance.ground.absent} absent</span>
            </div>
            <div className="h-1.5 w-full bg-rose-100 dark:bg-rose-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${attendance.total_active_students ? (attendance.ground.present / attendance.total_active_students) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-1 text-[11px] leading-tight">
              <span className="text-emerald-600 font-medium">{attendance.lecture.present} present</span>
              <span className="text-rose-500 font-medium">{attendance.lecture.absent} absent</span>
            </div>
            <div className="h-1.5 w-full bg-rose-100 dark:bg-rose-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${attendance.total_active_students ? (attendance.lecture.present / attendance.total_active_students) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-500 font-medium">0 present</span>
            <span className="text-rose-500 font-medium">0 absent</span>
          </div>
          <div className="h-1.5 w-full bg-rose-100 dark:bg-rose-950 rounded-full overflow-hidden" />
        </div>
      ),
      isLoading: isLoadingAttendance,
    },
    ...(isSuperAdmin ? [{
      title: "Expected Fees",
      value: fees?.total_expected ? `₹${parseFloat(fees.total_expected).toLocaleString()}` : "₹0",
      icon: IndianRupee,
      description: (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-500 font-medium">₹{fees?.total_collected ? parseFloat(fees.total_collected).toLocaleString() : 0}</span>
            <span className="text-muted-foreground font-medium">Remaining: ₹{fees?.total_remaining ? parseFloat(fees.total_remaining).toLocaleString() : 0}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500" 
              style={{ width: `${(parseFloat(fees?.total_collected || "0") / (parseFloat(fees?.total_expected || "1") || 1)) * 100}%` }} 
            />
          </div>
        </div>
      ),
      isLoading: isLoadingFees,
    }] : []),
  ]

  return (
    <div className="w-full py-10 px-4 md:px-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening in your academy today.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="mt-1">{stat.description}</div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <StudentDemographicsChart data={studentCount} isLoading={isLoadingStudents} />
         <AttendanceOverviewChart data={attendance} isLoading={isLoadingAttendance} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Today's Birthdays
              </CardTitle>
              <CardDescription>Active students celebrating today</CardDescription>
            </div>
            {birthdays && birthdays.count && birthdays.count > 0 ? (
              <Button
                size="sm"
                onClick={() => sendWishes()}
                disabled={isSendingWishes}
                className="h-8"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSendingWishes ? "Sending..." : "Send Wishes"}
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table
              page={bPage}
              pageSize={bPageSize}
              totalPages={birthdays?.pagination?.totalPages || 1}
              totalData={birthdays?.pagination?.totalData || 0}
              onPageChange={setBPage}
              onPageSizeChange={setBPageSize}
              containerClassName="border-t border-slate-200 dark:border-slate-800"
            >
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[100px] px-6">ID</TableHead>
                  <TableHead className="px-6">Student</TableHead>
                  <TableHead className="px-6 text-right">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody loading={isLoadingBirthdays} fetching={isFetchingBirthdays && !isLoadingBirthdays} columnCount={3} rowCount={bPageSize}>
                {!isLoadingBirthdays && birthdays?.data?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="px-6 font-medium text-slate-500">#{student.student_id}</TableCell>
                    <TableCell className="px-6 font-semibold">{student.name}</TableCell>
                    <TableCell className="px-6 text-right text-slate-500">{student.personal_contact}</TableCell>
                  </TableRow>
                ))}
                {!isLoadingBirthdays && birthdays?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                      No birthdays today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {canReadFinancials && (
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  Due Payments
                </CardTitle>
                <CardDescription>Pending or overdue payments for today</CardDescription>
              </div>
              {payments && payments.count && payments.count > 0 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        setIsPrintingReport(true)
                        await downloadCertificate("pending-fees-report", {
                          status: "overdue",
                          sort: "newest"
                        })
                        toast.success("Report generated")
                      } catch {
                        toast.error("Failed to generate report")
                      } finally {
                        setIsPrintingReport(false)
                      }
                    }}
                    disabled={isPrintingReport || isLoadingPayments}
                    className="h-8 gap-1.5"
                  >
                    {isPrintingReport ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Printer className="h-3.5 w-3.5" />
                    )}
                    Print Overdue
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendReminders()}
                    disabled={isSendingReminders}
                    className="h-8"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSendingReminders ? "Sending..." : "Send Reminders"}
                  </Button>
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table
                page={pPage}
                pageSize={pPageSize}
                totalPages={payments?.pagination?.totalPages || 1}
                totalData={payments?.pagination?.totalData || 0}
                onPageChange={setPPage}
                onPageSizeChange={setPPageSize}
                containerClassName="border-t border-slate-200 dark:border-slate-800"
              >
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead className="w-[80px] px-6">ID</TableHead>
                    <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Student</TableHead>
                    <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Parent Contact</TableHead>
                    <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Due Date</TableHead>
                    <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 text-right text-xs font-bold uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody loading={isLoadingPayments} fetching={isFetchingPayments && !isLoadingPayments} columnCount={7} rowCount={pPageSize}>
                  {!isLoadingPayments && payments?.data?.map((payment) => (
                    <TableRow key={payment.id ?? `course-${payment.student_course_id}`}>
                      <TableCell className="px-6 font-medium text-slate-500">
                        {payment.id ? `#${payment.id}` : "—"}
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="font-semibold">{payment.student_name}</div>
                        <div className="text-xs text-muted-foreground">{payment.personal_contact}</div>
                      </TableCell>
                      <TableCell className="px-6 text-sm">
                        {payment.father_contact || payment.mother_contact || "—"}
                      </TableCell>
                      <TableCell className="px-6 font-medium">₹{payment.amount}</TableCell>
                      <TableCell className="px-6 text-xs text-slate-500 whitespace-nowrap">
                        <DateCell date={payment.due_date} />
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase ${
                            payment.status === 'overdue' 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          }`}>
                            {payment.status}
                          </span>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={printingId === (payment.sort_id ?? payment.id ?? 0)}
                              onClick={async () => {
                                try {
                                  setPrintingId(payment.sort_id ?? payment.id ?? 0)
                                  await downloadCertificate("pending-fees-report", {
                                    id: payment.sort_id || payment.id || undefined,
                                    status: payment.status,
                                    sort: "newest"
                                  })
                                  toast.success("Report generated")
                                } catch {
                                  toast.error("Failed to generate report")
                                } finally {
                                  setPrintingId(null)
                                }
                              }}
                              className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5"
                            >
                              {printingId === (payment.id || payment.student_course_id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Printer className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Print Fee Detail</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setChangeDateRecord(payment)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5"
                            >
                              <CalendarClock className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Edit Due Date</p></TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoadingPayments && payments?.data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        No due payments.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {isSuperAdmin && (
        <div className="grid gap-6">
          <MonthlyFeesPerformanceTable />
        </div>
      )}

      <ChangeDueDateModal record={changeDateRecord} onClose={() => setChangeDateRecord(null)} />
    </div>
  )
}

// ─── Change Due Date Modal (Internal) ──────────────────────────────────────────
interface ChangeDueDateProps {
  record: any | null
  onClose: () => void
}

const ChangeDueDateModal = ({ record, onClose }: ChangeDueDateProps) => {
  const updateDueDate = useUpdateInstallmentDueDate()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    setSelectedDate(record?.due_date ? new Date(record.due_date) : null)
  }, [record])

  const handleConfirm = async () => {
    if (!record || !(record.id || record.sort_id) || !selectedDate) return
    try {
      await updateDueDate.mutateAsync({
        installmentId: (record.id || record.sort_id) as number,
        due_date: format(selectedDate, "yyyy-MM-dd"),
      })
      toast.success("Due date updated successfully")
      onClose()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update due date")
    }
  }

  return (
    <Dialog open={!!record} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[380px] p-0 border-none shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Change Due Date</DialogTitle>
          {record && (
            <p className="text-center text-sm text-slate-500 mt-1 px-4">
              {record.student_name}
            </p>
          )}
        </DialogHeader>

        <div className="flex justify-center px-4 pb-2 [&_.react-datepicker]:border-0 [&_.react-datepicker]:shadow-none [&_.react-datepicker]:font-sans [&_.react-datepicker__month-container]:w-full [&_.react-datepicker]:w-full">
          <DatePicker
            inline
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            disabled={updateDueDate.isPending}
          />
        </div>

        <div className="mx-6 mb-4 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
          <CalendarClock className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {selectedDate
              ? format(selectedDate, "MMMM d, yyyy")
              : <span className="text-slate-400 font-normal">No date selected</span>
            }
          </span>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onClose}
            disabled={updateDueDate.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl"
            onClick={handleConfirm}
            disabled={!selectedDate || updateDueDate.isPending}
          >
            {updateDueDate.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
