import { useState, useMemo, useEffect, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, X, IndianRupee, Pencil } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import BodyLayout from "@/components/layout/BodyLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { SearchBar } from "@/components/ui/search-bar"
import { DatePickerInput } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { DeleteButton } from "@/components/ui/delete-button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"

import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/api/use-expenses"
import { useSearchFilter } from "@/hooks/use-search-filter"
import { usePagination } from "@/hooks/use-pagination"
import { usePermissions } from "@/hooks/use-permissions"
import { EXPENSE_TYPES, type Expense } from "@/types/expense"

// ─── Zod schema ─────────────────────────────────────────────────────────────

const expenseSchema = z.object({
  expense_type: z.string().min(1, "Expense type is required"),
  amount: z
    .number({ error: "Amount is required" })
    .positive("Amount must be greater than 0"),
  expense_date: z.date({ error: "Date is required" }),
  paid_to: z.string().optional(),
  remarks: z.string().optional(),
  gst_no: z.string().optional(),
  is_cheque_dd: z.boolean().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

const EXPENSE_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  ...EXPENSE_TYPES.map((t) => ({ value: t, label: t })),
]

const FORM_EXPENSE_TYPE_OPTIONS = EXPENSE_TYPES.map((t) => ({ value: t, label: t }))

// ─── Expense Form Sheet ──────────────────────────────────────────────────────

interface ExpenseFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: Expense | null
  onClose: () => void
}

function ExpenseFormSheet({ open, onOpenChange, editTarget, onClose }: ExpenseFormSheetProps) {
  const isEdit = !!editTarget
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense(editTarget?.id ?? 0)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_type: "",
      amount: undefined,
      expense_date: undefined,
      paid_to: "",
      remarks: "",
      gst_no: "",
      is_cheque_dd: false,
    },
  })

  useEffect(() => {
    if (open) {
      if (editTarget) {
        reset({
          expense_type: editTarget.expense_type,
          amount: editTarget.amount,
          expense_date: new Date(editTarget.expense_date),
          paid_to: editTarget.paid_to ?? "",
          remarks: editTarget.remarks ?? "",
          gst_no: editTarget.gst_no ?? "",
          is_cheque_dd: editTarget.is_cheque_dd ?? false,
        })
      } else {
        reset({
          expense_type: "",
          amount: undefined,
          expense_date: undefined,
          paid_to: "",
          remarks: "",
          gst_no: "",
          is_cheque_dd: false,
        })
      }
    }
  }, [open, editTarget, reset])

  const onSubmit = async (values: ExpenseFormValues) => {
    const payload = {
      expense_type: values.expense_type,
      amount: values.amount,
      expense_date: values.expense_date.toISOString().split("T")[0],
      paid_to: values.paid_to || undefined,
      remarks: values.remarks || undefined,
      gst_no: values.gst_no || undefined,
      is_cheque_dd: values.is_cheque_dd ?? false,
    }

    try {
      if (isEdit) {
        await updateExpense.mutateAsync(payload)
        toast.success("Expense updated successfully")
      } else {
        await createExpense.mutateAsync(payload)
        toast.success("Expense added successfully")
      }
      onClose()
    } catch (err: unknown) {
      const error = err as Error & {
        response?: { data?: { message?: string; errors?: { message: string }[] } }
      }
      const data = error.response?.data
      const message =
        data?.errors?.[0]?.message ?? data?.message ?? "Something went wrong"
      toast.error(message)
    }
  }

  const loading = isSubmitting || createExpense.isPending || updateExpense.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>{isEdit ? "Edit Expense" : "Add Expense"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update the details of this expense." : "Fill in the details to record a new expense."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 pb-6">
          {/* Expense Type */}
          <Controller
            name="expense_type"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label="Expense Type"
                required
                value={field.value || ""}
                onValueChange={field.onChange}
                options={FORM_EXPENSE_TYPE_OPTIONS}
                placeholder="Select expense type"
                error={errors.expense_type?.message}
                disabled={loading}
              />
            )}
          />

          {/* Amount */}
          <Input
            label="Amount (₹)"
            required
            type="number"
            placeholder="e.g. 3600"
            min={0}
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            error={errors.amount?.message}
            disabled={loading}
          />

          {/* Expense Date */}
          <Controller
            name="expense_date"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Expense Date"
                required
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a date"
                error={errors.expense_date?.message}
                disabled={loading}
              />
            )}
          />

          {/* Paid To */}
          <Input
            label="Paid To"
            placeholder="e.g. Jio Fiber"
            {...register("paid_to")}
            error={errors.paid_to?.message}
            disabled={loading}
          />

          {/* Remarks */}
          <Input
            label="Remarks"
            placeholder="e.g. Paid by sir"
            {...register("remarks")}
            error={errors.remarks?.message}
            disabled={loading}
          />

          {/* GST No */}
          <Input
            label="GST No."
            placeholder="e.g. 27AADCB2230M1Z2"
            {...register("gst_no")}
            error={errors.gst_no?.message}
            disabled={loading}
          />

          {/* Cheque / DD */}
          <div className="flex items-center gap-2 pt-1">
            <Controller
              name="is_cheque_dd"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="is_cheque_dd"
                  checked={field.value ?? false}
                  onCheckedChange={(checked) => setValue("is_cheque_dd", !!checked)}
                  disabled={loading}
                  label="Paid via Cheque / DD"
                />
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update Expense"
                : "Add Expense"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const ExpensesPage = () => {
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)

  const { canCreateExpense, canUpdateExpense, canDeleteExpense } = usePermissions()

  type ExpenseFilters = { expense_type?: string }

  const { search, setSearch, params, setFilter, resetFilters } =
    useSearchFilter<ExpenseFilters>({
      initialFilters: {},
      onFilterChange: () => setPage(1),
    })

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...params,
      from_date: fromDate ? fromDate.toISOString().split("T")[0] : undefined,
      to_date: toDate ? toDate.toISOString().split("T")[0] : undefined,
    }),
    [page, pageSize, params, fromDate, toDate]
  )

  const { data, isLoading, isFetching } = useExpenses(queryParams)
  const deleteExpense = useDeleteExpense()

  useEffect(() => {
    if (data?.pagination?.totalData !== undefined) {
      setTotal(data.pagination.totalData)
    }
  }, [data?.pagination?.totalData, setTotal])

  const hasActiveFilters =
    !!search || !!params.expense_type || !!fromDate || !!toDate

  const handleResetFilters = useCallback(() => {
    resetFilters()
    setFromDate(null)
    setToDate(null)
    setPage(1)
  }, [resetFilters, setPage])

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteExpense.mutateAsync(id)
      toast.success("Expense deleted successfully")
    } catch (err: unknown) {
      const error = err as Error & {
        response?: { data?: { message?: string; errors?: { message: string }[] } }
      }
      const d = error.response?.data
      toast.error(d?.errors?.[0]?.message ?? d?.message ?? "Failed to delete expense")
    } finally {
      setDeletingId(null)
    }
  }

  const openCreate = () => {
    setEditTarget(null)
    setSheetOpen(true)
  }

  const openEdit = (expense: Expense) => {
    setEditTarget(expense)
    setSheetOpen(true)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setEditTarget(null)
  }

  const breadcrumbs = useMemo(() => [{ label: "Expense Manager" }], [])

  const totalExpenses = data?.summary?.totalExpenses ?? 0

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n)

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy")
    } catch {
      return dateStr
    }
  }

  const showActions = canUpdateExpense || canDeleteExpense
  const columnCount = showActions ? 6 : 5

  return (
    <BodyLayout
      breadcrumbs={breadcrumbs}
      toolbar={
        <div className="flex flex-wrap items-center gap-3 px-2 py-2">
          <SearchBar
            placeholder="Search paid to, remarks, GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
          />

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <CustomSelect
            value={params.expense_type ?? "all"}
            onValueChange={(val) =>
              setFilter("expense_type", val === "all" ? undefined : val)
            }
            triggerClassName="w-[170px] h-10"
            options={EXPENSE_TYPE_OPTIONS}
          />

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-500 shrink-0">From</Label>
            <DatePickerInput
              value={fromDate}
              onChange={(d) => { setFromDate(d); setPage(1) }}
              placeholder="Start date"
              className="h-10 text-sm w-[140px]"
              maxDate={toDate ?? undefined}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-500 shrink-0">To</Label>
            <DatePickerInput
              value={toDate}
              onChange={(d) => { setToDate(d); setPage(1) }}
              placeholder="End date"
              className="h-10 text-sm w-[140px]"
              minDate={fromDate ?? undefined}
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetFilters}
              className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0 rounded-full"
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      }
      actions={
        canCreateExpense ? (
          <Button onClick={openCreate} className="rounded-xl shadow-lg shadow-primary/20 h-10">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        ) : undefined
      }
    >
      {/* Summary Card */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium leading-none mb-0.5">
              Total Expenses
              {hasActiveFilters && (
                <span className="ml-1 text-primary">(filtered)</span>
              )}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {isLoading ? "—" : formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table
          page={page}
          pageSize={pageSize}
          totalPages={data?.pagination?.totalPages ?? 1}
          totalData={data?.pagination?.totalData ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        >
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px]">Sr No</TableHead>
              <TableHead>Expense Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Expense Date</TableHead>
              <TableHead>Remarks</TableHead>
              {showActions && (
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody
            loading={isLoading}
            fetching={isFetching && !isLoading}
            columnCount={columnCount}
            rowCount={pageSize}
          >
            {!isLoading &&
              data?.data.map((expense, index) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-slate-500 font-medium">
                    {(page - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/15">
                      {expense.expense_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {formatDate(expense.expense_date)}
                  </TableCell>
                  <TableCell className="text-slate-500 max-w-[200px] truncate">
                    {expense.remarks || (
                      <span className="text-slate-300 dark:text-slate-600 italic text-xs">
                        —
                      </span>
                    )}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {canUpdateExpense && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg"
                            title="Edit Expense"
                            onClick={() => openEdit(expense)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteExpense && (
                          <DeleteButton
                            title="Expense"
                            loading={deletingId === expense.id}
                            onDelete={() => handleDelete(expense.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-32 text-center text-muted-foreground"
                >
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Slide-over form */}
      <ExpenseFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editTarget={editTarget}
        onClose={closeSheet}
      />
    </BodyLayout>
  )
}

export default ExpensesPage
