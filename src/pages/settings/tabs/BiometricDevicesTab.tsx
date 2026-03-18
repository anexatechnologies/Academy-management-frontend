import { useState } from "react"
import { Plus, Cpu, Trash2, Pencil, Loader2, Globe, Lock } from "lucide-react"
import { toast } from "sonner"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useBiometricDevices, useCreateBiometricDevice, useUpdateBiometricDevice, useDeleteBiometricDevice } from "@/hooks/api/use-settings"
import { handleApiError } from "@/utils/api-error"
import type { BiometricDevice } from "@/types/settings"
import { cn } from "@/lib/utils"

const BiometricDevicesTab = () => {
  const { data: devices, isLoading } = useBiometricDevices()
  const createDevice = useCreateBiometricDevice()
  const updateDevice = useUpdateBiometricDevice()
  const deleteDevice = useDeleteBiometricDevice()

  const [isOpen, setIsOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null)
  const [formData, setFormData] = useState<Omit<BiometricDevice, "id">>({
    device_name: "",
    ip_address: "",
    port: 4370,
    password: "",
    is_active: true,
  })

  const resetForm = () => {
    setFormData({
      device_name: "",
      ip_address: "",
      port: 4370,
      password: "",
      is_active: true,
    })
    setEditingDevice(null)
  }

  const handleOpenEdit = (device: BiometricDevice) => {
    setEditingDevice(device)
    setFormData({
      device_name: device.device_name,
      ip_address: device.ip_address,
      port: device.port,
      password: device.password || "",
      is_active: device.is_active,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDevice) {
        await updateDevice.mutateAsync({ id: editingDevice.id, ...formData })
        toast.success("Device updated")
      } else {
        await createDevice.mutateAsync(formData)
        toast.success("Device added")
      }
      setIsOpen(false)
      resetForm()
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this biometric device?")) return
    try {
      await deleteDevice.mutateAsync(id)
      toast.success("Device deleted")
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleToggleActive = async (device: BiometricDevice) => {
    try {
      await updateDevice.mutateAsync({ ...device, is_active: !device.is_active })
      toast.success(`Device ${!device.is_active ? "activated" : "deactivated"}`)
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
          <Plus className="h-5 w-5" /> Integrate Hardware
        </Button>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/5">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-800/30 hover:bg-transparent border-slate-100 dark:border-slate-800">
              <TableHead className="w-[250px] font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Device Alias</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Network address</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Logic State</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Heartbeat</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center text-slate-500 border-none">
                   <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-500">
                     <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                        <Cpu className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">No Hardware Linked</p>
                        <p className="text-sm font-medium text-slate-400">Add your first ZKTeco/ESSL device to start automated attendance.</p>
                     </div>
                     <Button variant="outline" onClick={() => setIsOpen(true)} className="rounded-xl mt-2">
                        Quick Setup Device
                     </Button>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              devices?.map((dev) => (
                <TableRow key={dev.id} className="group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.02] transition-colors border-slate-50 dark:border-slate-800/50">
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-500 shadow-md",
                        dev.is_active ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-100 text-slate-400 shadow-none"
                      )}>
                        <Cpu className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{dev.device_name}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Standard UDP Interface</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg w-fit">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      <span>{dev.ip_address}:{dev.port}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                       <Checkbox 
                         checked={dev.is_active} 
                         onCheckedChange={() => handleToggleActive(dev)}
                         className="h-5 w-5 rounded-md"
                       />
                       <span className={cn(
                         "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                         dev.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                       )}>
                         {dev.is_active ? "Online Mode" : "Deactivated"}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    {dev.is_active ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-bold uppercase tracking-tight">Active Pulse</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <span className="text-xs font-bold uppercase tracking-tight">Standby</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-8 py-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary hover:text-white transition-colors" onClick={() => handleOpenEdit(dev)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-500 hover:text-white transition-colors" onClick={() => handleDelete(dev.id)}>
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
        <DialogContent className="max-w-md rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
               <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Cpu className="h-6 w-6" />
               </div>
               {editingDevice ? "Edit hardware" : "Link hardware"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Input 
                label="Identifier (Alias)" 
                required 
                className="h-12 rounded-xl"
                value={formData.device_name} 
                onChange={e => setFormData(prev => ({ ...prev, device_name: e.target.value }))} 
                placeholder="e.g. Lobby Entrance"
              />
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <Input 
                    label="IPv4 Address" 
                    required 
                    className="h-12 rounded-xl font-mono"
                    value={formData.ip_address} 
                    onChange={e => setFormData(prev => ({ ...prev, ip_address: e.target.value }))} 
                    placeholder="192.168.1.100"
                  />
                </div>
                <Input 
                  label="Net Port" 
                  type="number" 
                  required 
                  className="h-12 rounded-xl font-mono"
                  value={formData.port} 
                  onChange={e => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))} 
                />
              </div>
              <Input 
                label="CommKey (Encryption)" 
                type="password"
                leftIcon={<Lock className="h-4 w-4" />}
                className="h-12 rounded-xl"
                value={formData.password} 
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} 
                placeholder="Leave blank for null key"
              />
            </div>
            <DialogFooter className="pt-6 border-t border-slate-100 dark:border-slate-800 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl h-12 font-bold uppercase tracking-widest text-[10px]">Back</Button>
              <Button type="submit" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20" disabled={createDevice.isPending || updateDevice.isPending}>
                {createDevice.isPending || updateDevice.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingDevice ? "Synchronize" : "Finalize link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BiometricDevicesTab
