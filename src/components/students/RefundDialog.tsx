import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FormFooter } from "@/components/ui/form-footer"
import { toast } from "sonner"
import { AlertTriangle, IndianRupee } from "lucide-react"
import { useRefundPayment } from "@/hooks/api/use-payments"
import { formatCurrency } from "@/lib/utils"

interface RefundDialogProps {
  studentId: number
  paymentId: number
  originalAmount: number
  isOpen: boolean
  onClose: () => void
}

export const RefundDialog = ({
  studentId,
  paymentId,
  originalAmount,
  isOpen,
  onClose,
}: RefundDialogProps) => {
  const [amount, setAmount] = useState<string>("")
  const refundPayment = useRefundPayment(studentId)

  const numAmount = parseFloat(amount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid refund amount")
      return
    }
    if (numAmount > originalAmount) {
      toast.error(`Refund cannot exceed the original payment of ₹${formatCurrency(originalAmount)}`)
      return
    }
    try {
      await refundPayment.mutateAsync({ paymentId, payload: { amount: numAmount } })
      toast.success("Refund processed successfully")
      setAmount("")
      onClose()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to process refund")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Issue Refund</DialogTitle>
          <div className="mt-3 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg inline-flex items-center gap-2 mx-auto">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Original Payment:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-200">₹{formatCurrency(originalAmount)}</span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <Input
            type="number"
            step="any"
            label="Refund Amount"
            leftIcon={<IndianRupee className="h-5 w-5" />}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={refundPayment.isPending}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You can issue a partial or full refund. Max: ₹{formatCurrency(originalAmount)}
          </p>
          <FormFooter
            isLoading={refundPayment.isPending}
            submitLabel="Confirm Refund"
            onCancel={onClose}
            className="pt-4 border-t-0 mt-2"
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
