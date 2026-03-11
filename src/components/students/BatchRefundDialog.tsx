import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DateCell } from "@/components/ui/date-cell"
import { formatCurrency } from "@/lib/utils"
import type { Payment } from "@/types/payment"

interface BatchRefundDialogProps {
  isOpen: boolean
  onClose: () => void
  payments: Payment[]
  courseName: string
  onRefundSelect: (paymentId: number, originalAmount: number) => void
}

export function BatchRefundDialog({
  isOpen,
  onClose,
  payments,
  courseName,
  onRefundSelect,
}: BatchRefundDialogProps) {
  // Only show positive payments (actual payments, not refunds)
  const refundablePayments = payments.filter((p) => Number(p.amount) > 0)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
            <RotateCcw className="h-7 w-7 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Refund Payment</DialogTitle>
          <div className="mt-3 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg inline-flex items-center gap-2 mx-auto">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Course:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{courseName}</span>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {refundablePayments.length > 0 ? (
            <Table paginationRequired={false}>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundablePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell><DateCell date={payment.payment_date} /></TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{formatCurrency(Number(payment.amount))}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {payment.payment_mode}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
                        onClick={() => {
                          onClose()
                          onRefundSelect(payment.id, Number(payment.amount))
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Refund
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <RotateCcw className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">No refundable payments found for this course.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
