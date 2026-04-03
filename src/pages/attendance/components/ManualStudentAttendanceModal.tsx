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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePickerInput } from "@/components/ui/date-picker"
import { ComboBox } from "@/components/ui/combobox"
import { useStudentComboBox } from "@/hooks/use-combobox-data"
import { useMarkManualAttendance } from "@/hooks/api/use-attendance"
import { Controller } from "react-hook-form"
import { handleApiError } from "@/utils/api-error"
import { toast } from "sonner"

const schema = z.object({
  student_id: z.string().min(1, "Student is required"),
  date: z.string().min(1, "Date is required"),
  time_slot: z.enum(["ground", "lecture"]),
  status: z.literal("present"),
})

type FormData = z.infer<typeof schema>

interface ManualStudentAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
}

const ManualStudentAttendanceModal = ({ isOpen, onClose }: ManualStudentAttendanceModalProps) => {
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
      student_id: "",
      date: new Date().toISOString().split("T")[0],
      time_slot: "lecture",
      status: "present",
    },
  })

  const studentComboBox = useStudentComboBox(undefined, "student_id")

  const onSubmit = async (data: FormData) => {
    try {
      // Backend expects biometric student_id. Our ComboBox returns row ID as value.
      // We need to find the biometric ID from the options label: "Name (BiometricID)"
      const selectedOption = studentComboBox.options.find(o => o.value === data.student_id)
      const biometricId = selectedOption?.label.split('(')[1]?.replace(')', '') || data.student_id

      const payload = {
        ...data,
        student_id: biometricId,
      }

      await markAttendance.mutateAsync(payload as any)
      toast.success("Attendance marked successfully")
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
          <DialogTitle>Mark Manual Student Attendance</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label required>Select Student</Label>
            <Controller
              control={control}
              name="student_id"
              render={({ field }) => (
                <ComboBox
                  placeholder="Search student by name or ID"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={studentComboBox.options}
                  onSearch={studentComboBox.onSearch}
                  onLoadMore={studentComboBox.onLoadMore}
                  onReset={studentComboBox.onReset}
                  hasMore={studentComboBox.hasMore}
                  isLoading={studentComboBox.isLoading}
                  isLoadingMore={studentComboBox.isLoadingMore}
                  searchPlaceholder="Search students..."
                  emptyText="No students found."
                  triggerClassName="w-full h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              )}
            />
            {errors.student_id && <p className="text-[11px] text-rose-500 font-medium">{errors.student_id.message}</p>}
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

          <div className="space-y-3">
            <Label required>Time Slot</Label>
            <Controller
              control={control}
              name="time_slot"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row gap-8 pt-1"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lecture" id="lecture" label="Lecture" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ground" id="ground" label="Ground" />
                  </div>
                </RadioGroup>
              )}
            />
            {errors.time_slot && <p className="text-[11px] text-rose-500 font-medium">{errors.time_slot.message}</p>}
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

export default ManualStudentAttendanceModal
