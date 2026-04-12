import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  CalendarClock,
  Clock,
  ExternalLink,
  History,
  Layers,
  Loader2,
  Printer,
  RotateCcw,
  Zap,
  CheckCircle2,
  X,
} from "lucide-react"
import { SearchBar } from "@/components/ui/search-bar"
import BodyLayout from "@/components/layout/BodyLayout"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateCell } from "@/components/ui/date-cell"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatCurrency } from "@/lib/utils"
import { usePendingPayments, useUpdateInstallmentDueDate } from "@/hooks/api/use-payments"
import { useStudent } from "@/hooks/api/use-students"
import { usePayments } from "@/hooks/api/use-payments"
import { usePermissions } from "@/hooks/use-permissions"
import { PaymentDialog } from "@/components/students/PaymentDialog"
import { RefundDialog } from "@/components/students/RefundDialog"
import { BatchRefundDialog } from "@/components/students/BatchRefundDialog"
import { useCertificates } from "@/hooks/api/use-certificates"
import type { PendingPayment, PaymentType } from "@/types/payment"
import type { Installment } from "@/types/student"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "pending" | "overdue" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md",
        status === "overdue"
          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      )}
    >
      {status === "overdue" ? (
        <AlertCircle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      {status}
    </span>
  )
}

// ─── Ordinal helper ───────────────────────────────────────────────────────────
function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ─── Change Due Date Modal ────────────────────────────────────────────────────
interface ChangeDueDateModalProps {
  record: PendingPayment | null
  onClose: () => void
}

const ChangeDueDateModal = ({ record, onClose }: ChangeDueDateModalProps) => {
  const updateDueDate = useUpdateInstallmentDueDate()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    setSelectedDate(record?.due_date ? new Date(record.due_date) : null)
  }, [record])

  const handleConfirm = async () => {
    if (!record || !selectedDate) return
    try {
      await updateDueDate.mutateAsync({
        installmentId: record.id,
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
            <p className="text-center text-sm text-slate-500 mt-1">
              {record.student_name} · <span className="font-medium text-slate-700 dark:text-slate-300">{record.course_name}</span>
            </p>
          )}
        </DialogHeader>

        {/* Inline calendar — no popup, no portal, no outside-click conflicts */}
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

        {/* Selected date display */}
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
            className="flex-1"
            onClick={onClose}
            disabled={updateDueDate.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
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

// ─── Detail sheet ─────────────────────────────────────────────────────────────
interface DetailSheetProps {
  record: PendingPayment | null
  onClose: () => void
  canPay: boolean
  canRefund: boolean
}

const DetailSheet = ({ record, onClose, canPay, canRefund }: DetailSheetProps) => {
  const navigate = useNavigate()
  const { data: student, isLoading } = useStudent(record?.student_id ?? 0)
  const { data: payments } = usePayments(record?.student_id ?? 0)
  const { downloadCertificate } = useCertificates()
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
  const [payConfig, setPayConfig] = useState<{
    courseId: number
    courseName: string
    type: PaymentType
    remainingAmount: number
    installments: Installment[]
  } | null>(null)

  const [refundConfig, setRefundConfig] = useState<{ paymentId: number; originalAmount: number } | null>(null)
  const [batchRefundConfig, setBatchRefundConfig] = useState<{ courseName: string; studentCourseId: number } | null>(null)

  // Find the batch matching this record's student_course_id
  const matchedBatch = useMemo(() => {
    if (!student || !record) return null
    return student.batches?.find((b: any) => b.student_course_id === record.student_course_id) ?? null
  }, [student, record])

  const coursePayments = useMemo(() => {
    if (!payments || !record) return []
    return payments.filter((p) => p.student_course_id === record.student_course_id)
  }, [payments, record])

  return (
    <>
      <Sheet open={!!record} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col h-full overflow-hidden">
          <SheetHeader className="z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0">
            <SheetTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Payment Details
            </SheetTitle>
            {record && (
              <p className="text-xs text-slate-500 font-medium">
                {record.student_name} · {record.course_name}
              </p>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Student card */}
            {record && (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {record.student_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{record.student_name}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      #{record.student_roll_no} · {record.student_contact}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/students/view/${record.student_id}`)}
                  className="text-primary hover:bg-primary/5 text-xs gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Full Profile
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-6 pt-2">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                {/* Financial summary: Prefer matchedBatch, fallback to record */}
                {matchedBatch ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Fees", value: matchedBatch.total_fees_with_tax, color: "text-slate-900 dark:text-slate-100" },
                      { label: "Paid", value: matchedBatch.fees_paid, color: "text-emerald-600" },
                      { label: "Remaining", value: matchedBatch.fees_remaining, color: "text-rose-600" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center shadow-sm">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{label}</p>
                        <p className={`text-xl font-black ${color}`}>₹{formatCurrency(Number(value))}</p>
                      </div>
                    ))}
                  </div>
                ) : record ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Amount Due Now</p>
                      <p className="text-xl font-black text-amber-600">₹{formatCurrency(Number(record.amount_due))}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total Remaining</p>
                      <p className="text-xl font-black text-rose-600">₹{formatCurrency(Number(record.total_fees_remaining))}</p>
                    </div>
                  </div>
                ) : null}

                {/* Action buttons: Always available if record exists */}
                {record && (
                  <div className="flex gap-3">
                    {canPay && (
                      <Button
                        className="flex-1 h-11 rounded-xl shadow-lg shadow-primary/20"
                        disabled={matchedBatch ? Number(matchedBatch.fees_remaining) <= 0 : false}
                        onClick={() => {
                          setPayConfig({
                            courseId: record.student_course_id,
                            courseName: record.course_name,
                            type: record.payment_type,
                            remainingAmount: matchedBatch ? Number(matchedBatch.fees_remaining) : Number(record.total_fees_remaining),
                            installments: matchedBatch?.installments || [],
                          })
                          setIsPayDialogOpen(true)
                        }}
                      >
                        <Zap className="mr-2 h-4 w-4 fill-current" /> Record Payment
                      </Button>
                    )}
                    {canRefund && (
                      <Button
                        variant="outline"
                        className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                        onClick={() =>
                          setBatchRefundConfig({
                            courseName: record.course_name,
                            studentCourseId: record.student_course_id,
                          })
                        }
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Refund
                      </Button>
                    )}
                  </div>
                )}

                {/* EMI Schedule */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden rounded-2xl">
                  <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800/60">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      <Layers className="h-4 w-4 text-primary" /> EMI Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {matchedBatch && (matchedBatch.installments?.length ?? 0) > 0 ? (
                      <Table paginationRequired={false}>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-8">#</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Paid On</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody loading={isLoading} columnCount={5} rowCount={3}>
                          {(matchedBatch?.installments ?? []).map((inst: any) => (
                            <TableRow key={inst.id}>
                              <TableCell className="font-bold text-slate-500">{inst.installment_number}</TableCell>
                              <TableCell><DateCell date={inst.due_date} /></TableCell>
                              <TableCell className="font-semibold">₹{formatCurrency(Number(inst.amount_due))}</TableCell>
                              <TableCell>
                                <span className={cn(
                                  "px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md",
                                  inst.status === "paid" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                  inst.status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                  inst.status === "overridden" && "bg-slate-100 text-slate-500 dark:bg-slate-800",
                                )}>
                                  {inst.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-slate-500">
                                {inst.paid_on ? <DateCell date={inst.paid_on} /> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                        <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <Layers className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium max-w-[200px]">
                          {isLoading ? "Loading schedule..." : "Full installment schedule is currently unavailable for this course."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Transaction ledger */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden rounded-2xl">
                  <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800/60">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      <History className="h-4 w-4 text-primary" /> Transaction Ledger
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {coursePayments.length > 0 ? (
                      <Table paginationRequired={false}>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Mode</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody loading={isLoading} columnCount={5} rowCount={3}>
                          {coursePayments.map((payment: any) => {
                            const isPositive = Number(payment.amount) >= 0
                            return (
                              <TableRow key={payment.id}>
                                <TableCell><DateCell date={payment.payment_date} /></TableCell>
                                <TableCell className={`font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                                  {isPositive ? "+" : "-"}₹{formatCurrency(Math.abs(Number(payment.amount)))}
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">{payment.payment_mode}</TableCell>
                                <TableCell>
                                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {payment.payment_type}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  {isPositive && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={downloadingId === payment.id}
                                      className="h-8 px-3 rounded-lg text-primary hover:text-primary hover:bg-primary/5 font-bold text-[11px] gap-1.5"
                                      onClick={async () => {
                                        try {
                                          setDownloadingId(payment.id)
                                          await downloadCertificate(`receipt/${payment.id}`)
                                          toast.success("Receipt opened")
                                        } catch {
                                          toast.error("Failed to generate receipt")
                                        } finally {
                                          setDownloadingId(null)
                                        }
                                      }}
                                    >
                                      {downloadingId === payment.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <><Printer className="h-3.5 w-3.5" /> Receipt</>
                                      )}
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                        <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <History className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium max-w-[200px]">
                          {isLoading ? "Loading ledger..." : "No recent transactions found for this course."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      {payConfig && record && (
        <PaymentDialog
          id={record.student_id}
          isOpen={isPayDialogOpen}
          onClose={() => { setIsPayDialogOpen(false); setPayConfig(null) }}
          studentCourseId={payConfig.courseId}
          courseName={payConfig.courseName}
          paymentType={payConfig.type}
          remainingAmount={payConfig.remainingAmount}
          installments={payConfig.installments}
        />
      )}
      {refundConfig && record && (
        <RefundDialog
          studentId={record.student_id}
          paymentId={refundConfig.paymentId}
          originalAmount={refundConfig.originalAmount}
          isOpen={!!refundConfig}
          onClose={() => setRefundConfig(null)}
        />
      )}
      {batchRefundConfig && record && (
        <BatchRefundDialog
          isOpen={!!batchRefundConfig}
          onClose={() => setBatchRefundConfig(null)}
          courseName={batchRefundConfig.courseName}
          payments={coursePayments}
          onRefundSelect={(paymentId, originalAmount) => setRefundConfig({ paymentId, originalAmount })}
        />
      )}
    </>
  )
}

// ─── Quick-pay dialog wrapper ─────────────────────────────────────────────────
interface QuickPayProps {
  record: PendingPayment | null
  onClose: () => void
}

const QuickPaySheet = ({ record, onClose }: QuickPayProps) => {
  if (!record) return null
  return (
    <PaymentDialog
      id={record.student_id}
      isOpen={!!record}
      onClose={onClose}
      studentCourseId={record.student_course_id}
      courseName={record.course_name}
      paymentType={record.payment_type}
      remainingAmount={Number(record.total_fees_remaining)}
      installments={[]}
    />
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Overdue", value: "overdue" },
  { label: "Pending", value: "pending" },
]

const SORT_OPTIONS = [
  { label: "Recently Added (Default)", value: "newest" },
  { label: "Overdue First", value: "overdue" },
]

export default function PendingPaymentsPage() {
  const navigate = useNavigate()
  const {
    canReadPayments: canRead,
    canUpdateStudent: canPay,
    canDeletePayments: canRefund
  } = usePermissions()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"" | "pending" | "overdue">("")
  const [sort, setSort] = useState<"newest" | "overdue">("newest")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [detailRecord, setDetailRecord] = useState<PendingPayment | null>(null)
  const [quickPayRecord, setQuickPayRecord] = useState<PendingPayment | null>(null)
  const [changeDateRecord, setChangeDateRecord] = useState<PendingPayment | null>(null)

  const resetFilters = () => {
    setSearch("")
    setStatus("")
    setSort("newest")
    setPage(1)
  }

  const { data, isLoading, isFetching } = usePendingPayments({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sort: sort === "newest" ? undefined : sort
  })

  const breadcrumbs = useMemo(() => [
    { label: "Student Management", href: "/students" },
    { label: "Pending Payments" },
  ], [])

  if (!canRead) {
    navigate("/")
    return null
  }

  const totalData = data?.pagination?.totalData ?? 0
  const totalPages = data?.pagination?.totalPages ?? 1
  const overdueCount = data?.data?.filter(d => d.status === "overdue").length ?? 0
  const pendingCount = data?.data?.filter(d => d.status === "pending").length ?? 0

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex items-center gap-3 px-2 py-2">
          <SearchBar
            placeholder="Search student name or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-72 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <CustomSelect
            options={STATUS_OPTIONS}
            value={status === "" ? "all" : status}
            onValueChange={(v) => { setStatus(v === "all" ? "" : v as any); setPage(1) }}
            triggerClassName="w-[160px]"
          />
          <CustomSelect
            options={SORT_OPTIONS}
            value={sort}
            onValueChange={(v) => { setSort(v as any); setPage(1) }}
            triggerClassName="w-[200px]"
          />

          {(search || status !== "" || sort !== "newest") && (
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
    >
      <div className="animate-in fade-in duration-500 pt-2 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pending Payments</h1>
            <p className="text-sm text-slate-500 mt-0.5">All outstanding installments across all students</p>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-900/30">
                <AlertCircle className="h-3.5 w-3.5" />
                {overdueCount} Overdue
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-900/30">
                <Clock className="h-3.5 w-3.5" />
                {pendingCount} Pending
              </span>
            </div>
          )}
        </div>

        {/* Table moved down, filters removed from here */}

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <Table
            paginationRequired={totalData > 0}
            page={page}
            pageSize={limit}
            totalPages={totalPages}
            totalData={totalData}
            onPageChange={setPage}
            onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
            tableContainerClassName="max-h-[calc(100vh-350px)]"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Payment Details</TableHead>
                <TableHead className="text-right">Amount Due</TableHead>
                <TableHead className="text-right">Total Remaining</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody loading={isLoading} fetching={isFetching && !isLoading} columnCount={8} rowCount={limit}>
              {!isLoading && data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
                      <p className="text-sm text-slate-400">No pending payments found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((row) => (
                  <TableRow key={row.id} className="group">
                    <TableCell>
                      <div>
                        <button
                          onClick={() => navigate(`/students/view/${row.student_id}`)}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors text-left cursor-pointer"
                        >
                          {row.student_name}
                        </button>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">#{row.student_roll_no}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300 max-w-[180px] truncate">
                      {row.course_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          row.payment_type === "instalment"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                            : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                        )}>
                          {row.payment_type === "instalment" ? "EMI" : "One-Time"}
                        </span>
                        <p className="text-xs text-slate-500 font-medium">
                          {row.payment_type === "instalment"
                            ? `${ordinal(row.installment_number)} Installment`
                            : "Full/Monthly"
                          }
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600">
                      ₹{formatCurrency(Number(row.amount_due))}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-700 dark:text-slate-300">
                      ₹{formatCurrency(Number(row.total_fees_remaining))}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-sm font-medium",
                        new Date(row.due_date) < new Date() ? "text-rose-600 font-bold" : "text-slate-600 dark:text-slate-400"
                      )}>
                        <DateCell date={row.due_date} />
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {canPay && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setDetailRecord(row)}
                                className="h-8 px-4 rounded-lg text-xs font-bold shadow-sm shadow-primary/20"
                              >
                                <Zap className="h-3.5 w-3.5 mr-1.5" />
                                Pay Now
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>View details and record payment</p></TooltipContent>
                          </Tooltip>
                        )}
                        {row.payment_type === "instalment" && canPay && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setChangeDateRecord(row)}
                                className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5"
                              >
                                <CalendarClock className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Edit Due Date</p></TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>


      </div>

      {/* Detail sheet */}
      <DetailSheet
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        canPay={canPay}
        canRefund={canRefund}
      />

      {/* Quick pay */}
      <QuickPaySheet record={quickPayRecord} onClose={() => setQuickPayRecord(null)} />

      {/* Change Due Date */}
      <ChangeDueDateModal record={changeDateRecord} onClose={() => setChangeDateRecord(null)} />
    </BodyLayout>
  )
}
