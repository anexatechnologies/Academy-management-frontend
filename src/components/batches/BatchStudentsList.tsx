import { useState } from "react"
import { useBatchStudents, useRemoveStudentFromBatch } from "@/hooks/api/use-batches"
import { Skeleton } from "@/components/ui/skeleton"
import { DateCell } from "@/components/ui/date-cell"
import { DeleteButton } from "@/components/ui/delete-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function BatchStudentsList({ batchId }: { batchId: number }) {
  const { data: response, isLoading } = useBatchStudents(batchId)
  const removeStudent = useRemoveStudentFromBatch(batchId)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleRemove = async (studentId: number) => {
    setDeletingId(studentId)
    try {
      await removeStudent.mutateAsync(studentId)
      toast.success("Student removed from batch successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove student")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  const students = response?.data || []

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-primary/60" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Students Assigned</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          This batch currently has no enrolled students. Click "Assign Students" to add them.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <Table paginationRequired={false}>
        <TableHeader>
          <TableRow>
            <TableHead>Student Info</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Assigned On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 uppercase">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{student.name}</span>
                    <span className="text-xs text-slate-500">{student.student_id}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                {student.personal_contact}
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md",
                  student.status === "active" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {student.status}
                </span>
              </TableCell>
              <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                <DateCell date={student.assigned_at} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <DeleteButton 
                    title="Student"
                    onDelete={() => handleRemove(student.id)}
                    loading={removeStudent.isPending && deletingId === student.id}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
