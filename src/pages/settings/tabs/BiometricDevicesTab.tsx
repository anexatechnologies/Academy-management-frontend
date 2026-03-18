import { useState, useMemo, useEffect } from "react"
import { Plus, Settings, Loader2, Cpu, Globe } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { 
  useBiometricDevices, 
  useCreateBiometricDevice, 
  useUpdateBiometricDevice, 
  useDeleteBiometricDevice 
} from "@/hooks/api/use-settings"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FormFooter } from "@/components/ui/form-footer"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { handleApiError } from "@/utils/api-error"
import { usePagination } from "@/hooks/use-pagination"
import { biometricDeviceSchema, type BiometricDeviceFormValues } from "@/validations/biometric-device"
import type { BiometricDevice } from "@/types/settings"
import { cn } from "@/lib/utils"

const BiometricDevicesTab = () => {
  const { data: rawDevices, isLoading } = useBiometricDevices()
  const createDevice = useCreateBiometricDevice()
  const updateDevice = useUpdateBiometricDevice()
  const deleteDevice = useDeleteBiometricDevice()
  const { page, pageSize, setPage, setPageSize, setTotal } = usePagination()

  // Sync total for pagination
  useEffect(() => {
    if (rawDevices) {
      setTotal(rawDevices.length)
    }
  }, [rawDevices, setTotal])

  // Client-side pagination
  const devices = useMemo(() => {
    if (!rawDevices) return []
    const start = (page - 1) * pageSize
    return rawDevices.slice(start, start + pageSize)
  }, [rawDevices, page, pageSize])

  const [isOpen, setIsOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null)

  const form = useForm<BiometricDeviceFormValues>({
    resolver: zodResolver(biometricDeviceSchema) as any,
    defaultValues: {
      name: "",
      ip_address: "",
      port: 4370,
      password: "",
      is_active: true,
    },
  })

  const handleOpenEdit = (device: BiometricDevice) => {
    setEditingDevice(device)
    form.reset({
      name: device.name,
      ip_address: device.ip_address,
      port: device.port,
      password: device.password || "",
      is_active: device.is_active,
    })
    setIsOpen(true)
  }

  const handleOpenAdd = () => {
    setEditingDevice(null)
    form.reset({
      name: "",
      ip_address: "",
      port: 4370,
      password: "",
      is_active: true,
    })
    setIsOpen(true)
  }

  const onSubmit = async (values: BiometricDeviceFormValues) => {
    try {
      if (editingDevice) {
        await updateDevice.mutateAsync({ id: editingDevice.id, ...values })
        toast.success("Device updated successfully")
      } else {
        await createDevice.mutateAsync(values)
        toast.success("Device linked successfully")
      }
      setIsOpen(false)
      form.reset()
    } catch (error) {
      handleApiError(error, form.setError)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this biometric device?")) return
    try {
      await deleteDevice.mutateAsync(id)
      toast.success("Device deleted successfully")
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleToggleActive = async (device: BiometricDevice) => {
    try {
      const { id, ...rest } = device
      await updateDevice.mutateAsync({ id, ...rest, is_active: !device.is_active })
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
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-6 text-end">
        <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="h-5 w-5" /> Integrate Hardware
        </Button>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/5">
        <Table
          page={page}
          pageSize={pageSize}
          totalPages={Math.ceil((rawDevices?.length || 0) / pageSize)}
          totalData={rawDevices?.length || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        >
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-800/30 hover:bg-transparent border-slate-100 dark:border-slate-800">
              <TableHead className="w-[80px] font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Sr No</TableHead>
              <TableHead className="w-[250px] font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Device Alias</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Network address</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Logic State</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[2px] py-5">Heartbeat</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-[2px] px-8 py-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center text-slate-500 border-none">
                   <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-500">
                     <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                        <Cpu className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">No Hardware Linked</p>
                        <p className="text-sm font-medium text-slate-400">Add your first ZKTeco/ESSL device to start automated attendance.</p>
                     </div>
                     <Button variant="outline" onClick={handleOpenAdd} className="rounded-xl mt-2">
                        Quick Setup Device
                     </Button>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              devices.map((dev, index) => (
                <TableRow key={dev.id} className="group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.02] transition-colors border-slate-50 dark:border-slate-800/50">
                  <TableCell className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none flex items-center h-4">
                      {(page - 1) * pageSize + index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-500 shadow-md",
                        dev.is_active ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-100 text-slate-400 shadow-none"
                      )}>
                        <Cpu className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{dev.name}</span>
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
                    <div className="flex items-center justify-end gap-2 transition-all">
                      <EditButton title="Device" onEdit={() => handleOpenEdit(dev)} />
                      <DeleteButton title="Device" onDelete={() => handleDelete(dev.id)} />
                    </div>
                  </TableCell>
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
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
                   <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Settings className="h-5 w-5" />
                   </div>
                   {editingDevice ? "Device Settings" : "Link New Hardware"}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-2 space-y-6 min-h-0">
              <Input 
                {...form.register("name")}
                label="Friendly Name" 
                required 
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900" 
                placeholder="e.g. Front Gate Scanner"
                error={form.formState.errors.name?.message}
              />
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input 
                    {...form.register("ip_address")}
                    label="IP Address" 
                    required 
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 font-mono" 
                    placeholder="192.168.1.1"
                    error={form.formState.errors.ip_address?.message}
                  />
                </div>
                <Input 
                  {...form.register("port", { valueAsNumber: true })}
                  label="Port" 
                  required 
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 font-mono" 
                  placeholder="4370"
                  error={form.formState.errors.port?.message}
                />
              </div>
              <Input 
                {...form.register("password")}
                label="Connection Key (Optional)" 
                type="password" 
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900" 
                placeholder="••••••••"
                error={form.formState.errors.password?.message}
              />
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <Checkbox 
                  id="device-active" 
                  checked={form.watch("is_active")} 
                  onCheckedChange={(checked) => form.setValue("is_active", !!checked)}
                />
                <label htmlFor="device-active" className="text-sm font-black text-slate-600 dark:text-slate-400">Initialize device immediately</label>
              </div>
            </div>

            <div className="p-8 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/30 dark:bg-slate-900/30">
              <FormFooter 
                isLoading={createDevice.isPending || updateDevice.isPending}
                onCancel={() => setIsOpen(false)}
                submitLabel={editingDevice ? "Update Settings" : "Link Hardware"}
                className="border-none shadow-none p-0 bg-transparent mt-0"
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BiometricDevicesTab
