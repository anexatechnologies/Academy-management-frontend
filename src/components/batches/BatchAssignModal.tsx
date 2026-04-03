import { useState, useMemo } from "react"
import { useStudents } from "@/hooks/api/use-students"
import { useAssignStudentsToBatch, useBatch } from "@/hooks/api/use-batches"
import { useFeeSettings } from "@/hooks/api/use-fee-settings"
import { differenceInMonths, isValid } from "date-fns"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Users, AlertCircle, X, IndianRupee, Percent, Calculator, FileText, Eye } from "lucide-react"
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

  // Fee Preview Dialog State
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)

  // Fee & Discount State
  const [feeMode, setFeeMode] = useState<"one-time" | "installment">("one-time")
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat")
  const [discountAmount, setDiscountAmount] = useState<string>("")
  const [discountPercent, setDiscountPercent] = useState<string>("")

  const assignStudents = useAssignStudentsToBatch(batchId)
  const { data: batch } = useBatch(batchId)
  const { data: feeSettings } = useFeeSettings()

  const feeSummary = useMemo(() => {
    if (!batch) return null

    const baseFee = batch.course_fees !== undefined ? batch.course_fees : 0
    const rawSubtotal = typeof baseFee === "string" ? parseFloat(baseFee) : (baseFee || 0)

    let discountValue = 0
    if (discountType === "flat" && discountAmount && !isNaN(Number(discountAmount))) {
      discountValue = Math.min(Number(discountAmount), rawSubtotal)
    } else if (discountType === "percent" && discountPercent && !isNaN(Number(discountPercent))) {
      discountValue = (rawSubtotal * Math.min(Number(discountPercent), 100)) / 100
    }
    const subtotal = rawSubtotal - discountValue

    const taxPercent = parseFloat(feeSettings?.tax_percentage || "0")
    const taxAmount = (subtotal * taxPercent) / 100
    const total = subtotal + taxAmount

    const start = new Date(batch.start_date)
    const end = new Date(batch.end_date)
    let months = 1
    if (isValid(start) && isValid(end)) {
      months = Math.max(1, Math.ceil(differenceInMonths(end, start) + 0.1))
    }

    const monthlySubtotal = subtotal / months
    const monthlyTaxPercent = parseFloat(feeSettings?.monthly_tax_percentage || "0")
    const monthlyTaxAmount = (monthlySubtotal * monthlyTaxPercent) / 100
    const monthlyTotal = monthlySubtotal + monthlyTaxAmount

    const emiBreakdown = [{
      batchName: batch.name,
      installments: months,
      perInstallment: (subtotal / months) + ((subtotal / months) * monthlyTaxPercent) / 100,
    }]

    return {
      rawSubtotal,
      discountValue,
      subtotal,
      taxPercent,
      taxAmount,
      total,
      monthlySubtotal,
      monthlyTaxPercent,
      monthlyTaxAmount,
      monthlyTotal,
      emiBreakdown,
      feeMode
    }
  }, [batch, feeSettings, discountType, discountAmount, discountPercent, feeMode])

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
        force,
        fee_mode: feeMode,
        discount_amount: discountType === "flat" && discountAmount ? Number(discountAmount) : null,
        discount_percentage: discountType === "percent" && discountPercent ? Number(discountPercent) : null,
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
    setFeeMode("one-time")
    setDiscountType("flat")
    setDiscountAmount("")
    setDiscountPercent("")
    setIsPreviewDialogOpen(false)
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
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5 focus-within:relative z-30">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Fee Mode <span className="text-rose-500">*</span></Label>
                    {feeSummary && (
                      <button 
                        type="button"
                        onClick={() => setIsPreviewDialogOpen(true)}
                        className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 transition-colors px-2 py-0.5 rounded-full cursor-pointer"
                      >
                        <Eye className="h-3 w-3" /> Preview
                      </button>
                    )}
                  </div>
                  <CustomSelect
                    options={[
                      { label: "One-Time (Full payment)", value: "one-time" },
                      { label: "Instalment (EMI)", value: "installment" },
                    ]}
                    value={feeMode}
                    onValueChange={(val: any) => setFeeMode(val)}
                    triggerClassName="h-10 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5 focus-within:relative z-20">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Discount <span className="text-slate-400 font-normal">(optional)</span></Label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 relative z-10 w-[72px]">
                      <button
                        type="button"
                        onClick={() => setDiscountType("flat")}
                        className={cn(
                          "flex-1 text-[10px] font-medium py-1 rounded transition-colors duration-200 z-10 relative flex justify-center items-center cursor-pointer",
                          discountType === "flat" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                      >
                        ₹ Flat
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType("percent")}
                        className={cn(
                          "flex-1 text-[10px] font-medium py-1 rounded transition-colors duration-200 z-10 relative flex justify-center items-center cursor-pointer",
                          discountType === "percent" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  {discountType === "flat" ? (
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="rounded-lg h-10 text-sm"
                      leftIcon={<IndianRupee className="h-4 w-4 text-slate-400" />}
                    />
                  ) : (
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="rounded-lg h-10 text-sm"
                      leftIcon={<Percent className="h-4 w-4 text-slate-400" />}
                    />
                  )}
                </div>
              </div>

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

      {/* Fee Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 border-none shadow-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
          <DialogHeader className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex flex-row items-center gap-2.5 m-0 space-y-0 text-left">
            <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white m-0">Fees Structure Preview</DialogTitle>
          </DialogHeader>
          
          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {feeSummary && (
              <div className="space-y-5">
                {feeSummary.feeMode === "one-time" ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Base Fees :</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {feeSummary.discountValue > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <Percent className="h-3 w-3" /> Discount :
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          − ₹{feeSummary.discountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">Tax ({feeSummary.taxPercent}%) :</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="!mt-5 flex justify-between items-center bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 rounded-xl shadow-inner">
                      <span className="text-sm font-bold uppercase tracking-tight text-primary">Total Amount :</span>
                      <div className="flex items-center gap-1 text-primary">
                        <IndianRupee className="h-5 w-5" />
                        <span className="text-xl font-black">{feeSummary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Base Fees :</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      {feeSummary.discountValue > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <Percent className="h-3 w-3" /> Discount :
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            − ₹{feeSummary.discountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-800 pt-3">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Monthly Fees :</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.monthlySubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">Monthly Course Tax ({feeSummary.monthlyTaxPercent}%) :</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">₹{feeSummary.monthlyTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="!mt-5 flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 p-3 rounded-xl shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)]">
                        <span className="text-sm font-bold uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Monthly Fees :</span>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <IndianRupee className="h-5 w-5" />
                          <span className="text-xl font-black">{feeSummary.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                    {feeSummary.emiBreakdown.length > 0 && (
                      <div className="border border-amber-200/60 dark:border-amber-800/40 rounded-xl overflow-hidden bg-amber-50/50 dark:bg-amber-900/10 p-4 space-y-3 shadow-sm">
                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-amber-200/60 dark:border-amber-800/40 pb-2">
                          <Calculator className="h-4 w-4" /> EMI Schedule Preview
                        </p>
                        {feeSummary.emiBreakdown.map((emi, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-800/40 px-3 py-2.5 shadow-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{emi.batchName}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{emi.installments} installment{emi.installments !== 1 ? "s" : ""} · 30 days apart</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Per EMI</p>
                              <p className="text-[15px] font-black text-amber-600 dark:text-amber-500 flex items-center gap-0.5 justify-end">
                                <IndianRupee className="h-3.5 w-3.5" />{emi.perInstallment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
             <Button type="button" variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
               Close Preview
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
