import { useState } from "react"
import { Plus, Building2, Trash2, Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { cn } from "@/lib/utils"
import type { BankAccount } from "@/types/settings"

const BankAccountsTab = () => {
  const { data: accounts, isLoading } = useBankAccounts()
  const createAccount = useCreateBankAccount()
  const updateAccount = useUpdateBankAccount()
  const deleteAccount = useDeleteBankAccount()

  const [isOpen, setIsOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [formData, setFormData] = useState<Omit<BankAccount, "id">>({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch: "",
    is_active: true,
    opening_balance: "0",
    remark: "",
  })

  const resetForm = () => {
    setFormData({
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      branch: "",
      is_active: true,
      opening_balance: "0",
      remark: "",
    })
    setEditingAccount(null)
  }

  const handleOpenEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      ifsc_code: account.ifsc_code,
      branch: account.branch,
      is_active: account.is_active,
      opening_balance: account.opening_balance,
      remark: account.remark || "",
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAccount) {
        await updateAccount.mutateAsync({ id: editingAccount.id, ...formData })
        toast.success("Bank account updated")
      } else {
        await createAccount.mutateAsync(formData)
        toast.success("Bank account added")
      }
      setIsOpen(false)
      resetForm()
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bank account?")) return
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
        <Button onClick={() => { resetForm(); setIsOpen(true); }} className="h-12 px-6 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="h-5 w-5" /> Add New Account
        </Button>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/5">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <TableHead className="w-[250px] font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Bank Identity</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Credential Details</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Status</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Current Liquidity</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center text-slate-500 border-none">
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
              accounts?.map((acc) => (
                <TableRow key={acc.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50 dark:border-slate-800/50">
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
                    <div className="space-y-1">
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-400 tracking-tight">{acc.account_number}</span>
                      <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">{acc.branch} ({acc.ifsc_code})</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      acc.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-500"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", acc.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                      {acc.is_active ? "Active" : "Disabled"}
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-1.5">
                       <span className="text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">₹{acc.opening_balance}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8 py-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl" onClick={() => handleOpenEdit(acc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-500 hover:text-white" onClick={() => handleDelete(acc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-8 border-none shadow-3xl bg-white dark:bg-slate-950">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Building2 className="h-6 w-6" />
               </div>
               {editingAccount ? "Modify Account" : "Add Account"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <Input 
                label="Bank Name" 
                required 
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900"
                value={formData.bank_name} 
                onChange={e => setFormData(prev => ({ ...prev, bank_name: e.target.value }))} 
                placeholder="e.g. State Bank of India"
              />
              <Input 
                label="Account Number" 
                required 
                className="h-12 rounded-xl font-mono bg-slate-50 dark:bg-slate-900"
                value={formData.account_number} 
                onChange={e => setFormData(prev => ({ ...prev, account_number: e.target.value }))} 
                placeholder="XXXX XXXX XXXX XXXX"
              />
              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="IFSC Code" 
                  required 
                  className="h-12 rounded-xl uppercase font-mono bg-slate-50 dark:bg-slate-900"
                  value={formData.ifsc_code} 
                  onChange={e => setFormData(prev => ({ ...prev, ifsc_code: e.target.value }))} 
                  placeholder="SBIN0001234"
                />
                <Input 
                  label="Opening Balance" 
                  type="number" 
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900"
                  value={formData.opening_balance} 
                  onChange={e => setFormData(prev => ({ ...prev, opening_balance: e.target.value }))} 
                  placeholder="0.00"
                />
              </div>
              <Input 
                label="Branch" 
                required 
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900"
                value={formData.branch} 
                onChange={e => setFormData(prev => ({ ...prev, branch: e.target.value }))} 
                placeholder="e.g. Andheri East"
              />
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50">
                <Checkbox 
                  id="acc-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, is_active: !!checked }))}
                />
                <label htmlFor="acc-active" className="text-sm font-bold text-slate-700 dark:text-slate-300">Set as Active Account</label>
              </div>
            </div>
            
            <DialogFooter className="pt-6 border-t border-slate-100 dark:border-slate-800 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl h-12 font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
              <Button type="submit" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20" disabled={createAccount.isPending || updateAccount.isPending}>
                {createAccount.isPending || updateAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingAccount ? "Save Changes" : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BankAccountsTab
