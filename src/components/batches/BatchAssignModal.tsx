import { useState } from "react"
import { useStudents } from "@/hooks/api/use-students"
import { useAssignStudentsToBatch } from "@/hooks/api/use-batches"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchBar } from "@/components/ui/search-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { TablePagination } from "@/components/ui/table-pagination"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Users, AlertCircle, X } from "lucide-react"
import { toast } from "sonner"
import type { BatchAssignmentConflict } from "@/types/batch"
import { cn } from "@/lib/utils"

interface BatchAssignModalProps {
  batchId: number
  isOpen: boolean
  onClose: () => void
}

export function BatchAssignModal({ batchId, isOpen, onClose }: BatchAssignModalProps) {
  // Query parameters for global student search
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")
  // We only want to search active students for assignment
  const { data: response, isLoading } = useStudents({ 
    page, 
    limit: pageSize, 
    search, 
    status: "active" 
  })
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  
  // Conflict Resolution State
  const [conflicts, setConflicts] = useState<BatchAssignmentConflict[]>([])
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false)
  
  // Validation Error State
  const [assignError, setAssignError] = useState<string | null>(null)

  const assignStudents = useAssignStudentsToBatch(batchId)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
    setAssignError(null)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
  }

  const toggleStudent = (studentId: number) => {
    setAssignError(null)
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleAssignSubmit = async (force: boolean = false) => {
    setAssignError(null)
    if (selectedStudentIds.length === 0) {
      setAssignError("Please select at least one student.")
      return
    }

    try {
      await assignStudents.mutateAsync({
        student_ids: selectedStudentIds,
        force
      })
      toast.success("Students assigned successfully")
      setIsConflictDialogOpen(false)
      setConflicts([])
      setSelectedStudentIds([])
      onClose()
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Handle Conflict
        const conflictData = error.response.data.conflicts as BatchAssignmentConflict[]
        if (conflictData && conflictData.length > 0) {
          setConflicts(conflictData)
          setIsConflictDialogOpen(true)
        } else {
          toast.error(error.response.data.message || "Conflict detected.")
        }
      } else if (error.response?.status === 400) {
        // Handle Validation Errors (Capacity/Duplicate)
        const errors = error.response.data.errors
        if (errors && errors.length > 0) {
          setAssignError(errors[0].message)
        } else {
          setAssignError(error.response.data.message || "Validation failed.")
        }
      } else {
        setAssignError(error.response?.data?.message || "Failed to assign students")
      }
    }
  }

  const handleClose = () => {
    setSelectedStudentIds([])
    setSearch("")
    setPage(1)
    setAssignError(null)
    onClose()
  }

  const students = response?.data || []
  const count = response?.pagination?.totalData || 0

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent className="w-full sm:max-w-2xl sm:w-[600px] overflow-y-auto p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
          <div className="p-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-10">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Assign Students
              </SheetTitle>
              <SheetDescription>
                Search and select students to assign to this batch.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-3">
              {assignError && (
                <div className="bg-rose-50 text-rose-600 border border-rose-200/50 p-3 rounded-lg flex items-start gap-2.5 text-sm animate-in fade-in zoom-in-95 duration-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="leading-tight">{assignError}</p>
                </div>
              )}
              <SearchBar placeholder="Search students by name, ID or contact..." value={search} onChange={(e) => handleSearch(e.target.value)} />
            </div>
          </div>

          <div className="flex-1 p-0 overflow-y-auto relative">
             <div className="min-h-full bg-white dark:bg-slate-950">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 font-medium w-12 text-center"></th>
                    <th className="px-6 py-3 font-medium">Student Info</th>
                    <th className="px-6 py-3 font-medium">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-4 rounded" /></td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <Skeleton className="h-8 w-8 rounded-full" />
                             <div className="space-y-2">
                               <Skeleton className="h-4 w-32" />
                               <Skeleton className="h-3 w-20" />
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      </tr>
                    ))
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr 
                        key={student.id} 
                        className={cn(
                          "bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer",
                          selectedStudentIds.includes(student.id) && "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20"
                        )}
                        onClick={() => toggleStudent(student.id)}
                      >
                        <td className="px-6 py-4 text-center">
                          <Checkbox 
                            checked={selectedStudentIds.includes(student.id)} 
                            onCheckedChange={() => toggleStudent(student.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {student.name}
                              </div>
                              <div className="text-xs text-slate-500">{student.student_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {student.personal_contact}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No active students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            {count > 0 && (
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/50">
                <TablePagination 
                  page={page} 
                  pageSize={pageSize}
                  totalPages={Math.ceil(count / pageSize)}
                  totalData={count}
                  onPageChange={handlePageChange} 
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
            <div className="p-4 px-6 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                <span className="text-primary font-bold">{selectedStudentIds.length}</span> students selected
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} disabled={assignStudents.isPending}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleAssignSubmit(false)} 
                  disabled={selectedStudentIds.length === 0 || assignStudents.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                >
                  {assignStudents.isPending ? "Assigning..." : "Assign to Batch"}
                </Button>
              </div>
            </div>
          </div>

        </SheetContent>
      </Sheet>

      <AlertDialog open={isConflictDialogOpen} onOpenChange={setIsConflictDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-lg">
          <button
            onClick={() => setIsConflictDialogOpen(false)}
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-3 right-3 rounded-lg opacity-70 transition-all hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 cursor-pointer p-2 z-50 text-slate-500"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-500 pr-8">
              <AlertTriangle className="h-5 w-5" /> Batch Assignment Conflict
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
              The following students are already assigned to another batch for the same subject. 
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto mt-2 rounded-lg border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 divide-y divide-rose-100 dark:divide-rose-900/30">
            {conflicts.map((conflict, idx) => (
              <div key={idx} className="p-3 text-sm">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{conflict.student_name}</span>
                  <span className="text-xs text-slate-500 font-normal">{conflict.student_id}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 break-words max-w-full">
                    {conflict.existing_batch}
                  </span>
                  <span className="text-slate-400 shrink-0">→</span>
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium break-words max-w-full">
                    {conflict.new_batch}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
             Are you sure you want to force add these students to the new batch?
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={assignStudents.isPending}>No, Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={assignStudents.isPending}
              onClick={() => handleAssignSubmit(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {assignStudents.isPending ? "Assigning..." : "Yes, Force Assign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
