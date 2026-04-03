import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, UserCheck, IndianRupee, Gift, AlertCircle, Send } from "lucide-react"
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

export default function Dashboard() {
  const { canReadFinancials } = usePermissions()
  const { data: studentCount, isLoading: isLoadingStudents } = useStudentCount()
  const { data: attendance, isLoading: isLoadingAttendance } = useAttendanceSummary()
  const { data: fees, isLoading: isLoadingFees } = useFeesSummary({ enabled: canReadFinancials })

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

  const stats = [
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
      value: attendance ? `${attendance.ground.present + attendance.lecture.present}` : 0,
      icon: UserCheck,
      description: (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-500 font-medium">{attendance ? (attendance.ground.present + attendance.lecture.present) : 0} present</span>
            <span className="text-rose-500 font-medium">{attendance ? attendance.total_active_students - (attendance.ground.present + attendance.lecture.present) : 0} absent</span>
          </div>
          <div className="h-1.5 w-full bg-rose-100 dark:bg-rose-950 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500" 
              style={{ width: `${attendance?.total_active_students ? (((attendance.ground.present + attendance.lecture.present) / attendance.total_active_students) * 100) : 0}%` }} 
            />
          </div>
        </div>
      ),
      isLoading: isLoadingAttendance,
    },
    ...(canReadFinancials ? [{
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
                <Button
                  size="sm"
                  onClick={() => sendReminders()}
                  disabled={isSendingReminders}
                  className="h-8"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSendingReminders ? "Sending..." : "Send Reminders"}
                </Button>
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
                    <TableHead className="w-[100px] px-6">ID</TableHead>
                    <TableHead className="px-6">Student</TableHead>
                    <TableHead className="px-6">Amount</TableHead>
                    <TableHead className="px-6 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody loading={isLoadingPayments} fetching={isFetchingPayments && !isLoadingPayments} columnCount={4} rowCount={pPageSize}>
                  {!isLoadingPayments && payments?.data?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="px-6 font-medium text-slate-500">#{payment.id}</TableCell>
                      <TableCell className="px-6">
                        <div className="font-semibold">{payment.student_name}</div>
                        <div className="text-xs text-muted-foreground">{payment.personal_contact}</div>
                      </TableCell>
                      <TableCell className="px-6 font-medium">₹{payment.amount}</TableCell>
                      <TableCell className="px-6 text-right">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase ${
                            payment.status === 'overdue' 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          }`}>
                            {payment.status}
                          </span>
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

      {canReadFinancials && (
        <div className="grid gap-6">
          <MonthlyFeesPerformanceTable />
        </div>
      )}
    </div>
  )
}
