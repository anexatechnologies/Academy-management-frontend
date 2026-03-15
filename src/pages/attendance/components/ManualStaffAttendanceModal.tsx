import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DatePickerInput } from "@/components/ui/date-picker"
import { ComboBox } from "@/components/ui/combobox"
import { useStaffComboBox } from "@/hooks/use-combobox-data"
import { useMarkManualAttendance } from "@/hooks/api/use-attendance"
import { handleApiError } from "@/utils/api-error"
import { toast } from "sonner"

const schema = z.object({
  staff_id: z.string().min(1, "Staff selection is required"),
  date: z.string().min(1, "Date is required"),
  status: z.literal("present"),
})

type FormData = z.infer<typeof schema>

interface ManualStaffAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
}

const ManualStaffAttendanceModal = ({ isOpen, onClose }: ManualStaffAttendanceModalProps) => {
  const markAttendance = useMarkManualAttendance()
  
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      staff_id: "",
      date: new Date().toISOString().split("T")[0],
      status: "present",
    },
  })

  const staffComboBox = useStaffComboBox()

  const onSubmit = async (data: FormData) => {
    try {
      // Backend expects biometric staff_id. Our ComboBox returns row ID as value.
      // We need to find the biometric ID from the options label: "Name (BiometricID)"
      const selectedOption = staffComboBox.options.find(o => o.value === data.staff_id)
      const biometricId = selectedOption?.label.split('(')[1]?.replace(')', '') || data.staff_id

      const payload = {
        staff_id: biometricId,
        date: data.date,
        status: data.status,
      }

      await markAttendance.mutateAsync(payload)
      toast.success("Staff attendance marked successfully")
      onClose()
      reset()
    } catch (err: any) {
      handleApiError(err, setError)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Manual Staff Attendance</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label required>Select Staff Member</Label>
            <Controller
              control={control}
              name="staff_id"
              render={({ field }) => (
                <ComboBox
                  placeholder="Search staff by name or ID"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={staffComboBox.options}
                  onSearch={staffComboBox.onSearch}
                  onReset={staffComboBox.onReset}
                  hasMore={staffComboBox.hasMore}
                  isLoading={staffComboBox.isLoading}
                  isLoadingMore={staffComboBox.isLoadingMore}
                  searchPlaceholder="Search staff..."
                  emptyText="No staff members found."
                  triggerClassName="w-full h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              )}
            />
            {errors.staff_id && <p className="text-[11px] text-rose-500 font-medium">{errors.staff_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label required>Date</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePickerInput
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                  placeholder="Select date"
                  maxDate={new Date()}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.date && <p className="text-[11px] text-rose-500 font-medium">{errors.date.message}</p>}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Marking..." : "Mark Present"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ManualStaffAttendanceModal
