import { useState, useMemo, useEffect } from "react"
import { Plus, Building2, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormFooter } from "@/components/ui/form-footer"
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
import { useBankAccounts, useCreateBankAccount, useUpdateBankAccount, useDeleteBankAccount } from "@/hooks/api/use-settings"
import { handleApiError } from "@/utils/api-error"
import { usePagination } from "@/hooks/use-pagination"
import { bankAccountSchema, type BankAccountFormValues } from "@/validations/bank-account"
import type { BankAccount } from "@/types/settings"
import { usePermissions } from "@/hooks/use-permissions"

const BankAccountsTab = () => {
  const { hasPermission } = usePermissions()
  const canUpdate = hasPermission("settings", "update")
  const { data: rawAccounts, isLoading } = useBankAccounts()
  const createAccount = useCreateBankAccount()
  const updateAccount = useUpdateBankAccount()
  const deleteAccount = useDeleteBankAccount()
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()

  // Sync total for pagination
  useEffect(() => {
    if (rawAccounts) {
      setTotal(rawAccounts.length)
    }
  }, [rawAccounts, setTotal])

  // Client-side pagination
  const accounts = useMemo(() => {
    if (!rawAccounts) return []
    const start = (page - 1) * pageSize
    return rawAccounts.slice(start, start + pageSize)
  }, [rawAccounts, page, pageSize])

  const [isOpen, setIsOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema) as any,
    defaultValues: {
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      address: "",
      is_active: true,
      opening_balance: "0",
      remark: "",
    },
  })

  const handleOpenEdit = (account: BankAccount) => {
    setEditingAccount(account)
    form.reset({
      bank_name: account.bank_name,
      account_number: account.account_number,
      ifsc_code: account.ifsc_code,
      address: account.address,
      is_active: account.is_active,
      opening_balance: account.opening_balance,
      remark: account.remark || "",
    })
    setIsOpen(true)
  }

  const handleOpenAdd = () => {
    setEditingAccount(null)
    form.reset({
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      address: "",
      is_active: true,
      opening_balance: "0",
      remark: "",
    })
    setIsOpen(true)
  }

  const onSubmit = async (values: BankAccountFormValues) => {
    try {
      if (editingAccount) {
        await updateAccount.mutateAsync({ id: editingAccount.id, ...values })
        toast.success("Bank account updated")
      } else {
        await createAccount.mutateAsync(values)
        toast.success("Bank account added")
      }
      setIsOpen(false)
      form.reset()
    } catch (error) {
      handleApiError(error, form.setError)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAccount.mutateAsync(id)
      toast.success("Bank account deleted")
    } catch (error) {
      handleApiError(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
        {canUpdate && (
          <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="h-5 w-5" /> Add New Account
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table
          page={page}
          pageSize={pageSize}
          totalPages={Math.ceil((rawAccounts?.length || 0) / pageSize)}
          totalData={rawAccounts?.length || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        >
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <TableHead className="w-[80px] font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Sr No</TableHead>
              <TableHead className="w-[250px] font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Bank Name</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Bank Address</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Account No</TableHead>
              {canUpdate && <TableHead className="text-right font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canUpdate ? 5 : 4} className="h-64 text-center text-slate-500 border-none">
                   <div className="flex flex-col items-center justify-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">No Registry Found</p>
                        <p className="text-sm font-medium text-slate-400">Initialize your first bank account to start collecting fees.</p>
                      </div>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((acc, index) => (
                <TableRow key={acc.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50 dark:border-slate-800/50">
                  <TableCell className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none flex items-center h-4">
                      {(page - 1) * pageSize + index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:rotate-6 transition-transform">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{acc.bank_name}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Primary Carrier</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-sm">
                    <p className="font-medium text-slate-600 dark:text-slate-400 line-clamp-2">{acc.address}</p>
                  </TableCell>
                  <TableCell className="py-6 text-sm">
                    <div className="space-y-1">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tracking-tight">{acc.account_number}</span>
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">{acc.ifsc_code}</p>
                    </div>
                  </TableCell>
                  {canUpdate && (
                    <TableCell className="text-right px-8 py-6">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <EditButton title="Account" onEdit={() => handleOpenEdit(acc)} />
                        <DeleteButton title="Account" onDelete={() => handleDelete(acc.id)} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-xl p-0 border-none shadow-3xl bg-white dark:bg-slate-950 overflow-hidden flex flex-col max-h-[85vh]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 h-full">
            <div className="p-8 pb-4 shrink-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Building2 className="h-6 w-6" />
                  </div>
                  {editingAccount ? "Modify Account" : "Add Account"}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-2 space-y-8 min-h-0">
              <div className="grid grid-cols-1 gap-6 pb-2">
                <Input 
                  {...form.register("bank_name")}
                  label="Bank Name" 
                  required 
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900"
                  placeholder="e.g. State Bank of India"
                  error={form.formState.errors.bank_name?.message}
                />
                <Input 
                  {...form.register("account_number")}
                  label="Account Number" 
                  required 
                  className="h-12 rounded-xl font-mono bg-slate-50 dark:bg-slate-900"
                  placeholder="XXXX XXXX XXXX XXXX"
                  error={form.formState.errors.account_number?.message}
                />
                <div className="grid grid-cols-2 gap-6">
                  <Input 
                    {...form.register("ifsc_code")}
                    label="IFSC Code" 
                    required 
                    className="h-12 rounded-xl uppercase font-mono bg-slate-50 dark:bg-slate-900"
                    placeholder="SBIN0001234"
                    error={form.formState.errors.ifsc_code?.message}
                  />
                  <Input 
                    {...form.register("opening_balance")}
                    label="Opening Balance" 
                    type="number" 
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900"
                    placeholder="0.00"
                    error={form.formState.errors.opening_balance?.message}
                  />
                </div>
                <Textarea 
                  {...form.register("address")}
                  label="Address" 
                  required 
                  className="rounded-xl bg-slate-50 dark:bg-slate-900 min-h-[80px]"
                  placeholder="Full bank address..."
                  error={form.formState.errors.address?.message}
                />
                <Textarea 
                  {...form.register("remark")}
                  label="Remark" 
                  className="rounded-xl bg-slate-50 dark:bg-slate-900 min-h-[80px]"
                  placeholder="Optional remarks..."
                  error={form.formState.errors.remark?.message}
                />
                
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50">
                  <Checkbox 
                    id="acc-active"
                    checked={form.watch("is_active")}
                    onCheckedChange={(checked) => form.setValue("is_active", !!checked)}
                  />
                  <label htmlFor="acc-active" className="text-sm font-bold text-slate-700 dark:text-slate-300">Set as Active Account</label>
                </div>
              </div>
            </div>
            
            <div className="p-8 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/30 dark:bg-slate-900/30">
              <FormFooter 
                isLoading={createAccount.isPending || updateAccount.isPending}
                onCancel={() => setIsOpen(false)}
                submitLabel={editingAccount ? "Save Changes" : "Create Account"}
                className="border-none shadow-none p-0 bg-transparent mt-0"
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BankAccountsTab
