import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { DatePickerInput } from "@/components/ui/date-picker"
import { FormFooter } from "@/components/ui/form-footer"
import { toast } from "sonner"
import { IndianRupee } from "lucide-react"
import { useRecordPayment } from "@/hooks/api/use-payments"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import type { PaymentMode, PaymentType } from "@/types/payment"

const paymentSchema = z.object({
  student_course_id: z.number(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  payment_date: z.any().refine((val) => val instanceof Date, "Payment date is required"),
  payment_mode: z.enum(["Cash", "Online", "UPI", "Card", "Bank Transfer"]),
  payment_type: z.enum(["instalment", "monthly"]),
  transaction_reference: z.string().optional().or(z.literal("")),
  due_date: z.date().optional().nullable(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface PaymentDialogProps {
  id: number // Student ID
  isOpen: boolean
  onClose: () => void
  studentCourseId: number
  courseName: string
  paymentType: PaymentType
  remainingAmount: number
  defaultAmount?: number
}

export const PaymentDialog = ({
  id,
  isOpen,
  onClose,
  studentCourseId,
  courseName,
  paymentType,
  remainingAmount,
  defaultAmount = 0
}: PaymentDialogProps) => {
  const recordPayment = useRecordPayment(id)
  
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema as any),
    defaultValues: {
      student_course_id: studentCourseId,
      amount: Number(defaultAmount),
      payment_date: new Date(),
      payment_mode: "Cash",
      payment_type: paymentType,
      due_date: null,
    },
  })

  const paymentMode = watch("payment_mode")

  const onSubmit = async (values: PaymentFormValues) => {
    if (values.amount > remainingAmount) {
      toast.error(`Payment amount exceeds remaining balance. Max allowable: ₹${formatCurrency(remainingAmount)}`)
      return
    }

    try {
      const formattedValues = {
        ...values,
        payment_date: format(values.payment_date, "yyyy-MM-dd"),
        due_date: values.due_date ? format(values.due_date, "yyyy-MM-dd") : undefined,
      }
      await recordPayment.mutateAsync(formattedValues as any)
      toast.success("Payment recorded successfully")
      reset()
      onClose()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to record payment")
    }
  }

  const paymentModes: { label: string; value: PaymentMode }[] = [
    { label: "Cash", value: "Cash" },
    { label: "UPI", value: "UPI" },
    { label: "Bank Transfer", value: "Bank Transfer" },
    { label: "Online", value: "Online" },
    { label: "Card", value: "Card" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IndianRupee className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Record {paymentType === "instalment" ? "Instalment" : "Monthly"} Payment
          </DialogTitle>
          <div className="text-center text-slate-500 mt-2 font-medium">
            For Course: <span className="text-slate-900 dark:text-slate-200 font-bold">{courseName}</span>
          </div>
          <div className="mt-3 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg inline-flex items-center gap-2 mx-auto">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Remaining Balance:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-200">₹{formatCurrency(remainingAmount)}</span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              {...register("amount", { valueAsNumber: true })}
              type="number"
              label="Amount"
              leftIcon={<IndianRupee className="h-5 w-5" />}
              placeholder="0.00"
              error={errors.amount?.message as string}
              required
              disabled={recordPayment.isPending}
            />

            <Controller
              name="payment_date"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  label="Payment Date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.payment_date?.message as string}
                  required
                  disabled={recordPayment.isPending}
                />
              )}
            />

            <Controller
              name="payment_mode"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label="Payment Mode"
                  options={paymentModes}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.payment_mode?.message as string}
                  required
                  disabled={recordPayment.isPending}
                />
              )}
            />

            {(paymentMode === "UPI" || paymentMode === "Bank Transfer" || paymentMode === "Online" || paymentMode === "Card") && (
              <Input
                {...register("transaction_reference")}
                label={paymentMode === "UPI" ? "UTR Number" : paymentMode === "Bank Transfer" ? "Transaction Ref" : "Reference No"}
                placeholder="Enter reference..."
                error={errors.transaction_reference?.message as string}
                disabled={recordPayment.isPending}
              />
            )}

            <Controller
              name="due_date"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  label="Next Due Date (Optional)"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.due_date?.message as string}
                  disabled={recordPayment.isPending}
                />
              )}
            />
          </div>

          <FormFooter
            isLoading={recordPayment.isPending}
            submitLabel="Confirm Payment"
            onCancel={onClose}
            className="pt-4 border-t-0 mt-2"
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
