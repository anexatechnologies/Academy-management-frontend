import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Info } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  useCreateRole,
  useUpdateRole,
  useAllPermissions,
  useRolePermissions,
} from "@/hooks/api/use-roles"
import PermissionsGrid from "./PermissionsGrid"
import { FormFooter } from "@/components/ui/form-footer"
import { handleApiError } from "@/utils/api-error"

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RoleFormModalProps {
  isOpen: boolean
  onClose: () => void
  roleId: number | null
}

const RoleFormModal = ({ isOpen, onClose, roleId }: RoleFormModalProps) => {
  const isEdit = !!roleId

  const { data: allPermissionsData, isLoading: isLoadingAllPerms } = useAllPermissions()
  const { data: roleData, isLoading: isLoadingRoleData } = useRolePermissions(roleId)

  const createRole = useCreateRole()
  const updateRole = useUpdateRole(roleId as number)

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Sync edit data into form
  useEffect(() => {
    if (isOpen) {
      if (isEdit && roleData) {
        form.reset({
          name: roleData.role.name,
          description: roleData.role.description || "",
        })
        const activeIds = roleData.permissions.map((p) => p.id)
        setSelectedPermissionIds(activeIds)
      } else if (!isEdit) {
        form.reset({
          name: "",
          description: "",
        })
        setSelectedPermissionIds([])
      }
    }
  }, [isOpen, isEdit, roleData, form])

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSelectAllModule = (modulePermissionIds: number[], selectAll: boolean) => {
    if (selectAll) {
      setSelectedPermissionIds((prev) => {
        const newSet = new Set([...prev, ...modulePermissionIds])
        return Array.from(newSet)
      })
    } else {
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !modulePermissionIds.includes(id))
      )
    }
  }

  const onSubmit = async (values: RoleFormValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description || "",
        permission_ids: selectedPermissionIds,
      }

      if (isEdit) {
        await updateRole.mutateAsync(payload)
        toast.success("Role updated successfully")
      } else {
        await createRole.mutateAsync(payload)
        toast.success("Role created successfully")
      }
      onClose()
    } catch (error: any) {
      handleApiError(error, form.setError)
    }
  }

  const isLoadingData = isEdit ? isLoadingRoleData || isLoadingAllPerms : isLoadingAllPerms
  const isSaving = createRole.isPending || updateRole.isPending

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
               <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-6 w-6" />
               </div>
               {isEdit ? "Edit Access Control" : "Define New Security Role"}
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-400 mt-1">
              Configure system-wide privileges and operational boundaries for this persona.
            </DialogDescription>
          </DialogHeader>
        </div>

        {isLoadingData ? (
          <div className="flex-1 flex items-center justify-center p-12 min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form
            id="role-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto min-h-0"
          >
            <div className="p-6 md:p-8 space-y-10">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Identity Details</h4>
                  </div>
                  <Input
                    {...form.register("name")}
                    label="Internal Role Name"
                    required
                    placeholder="e.g. Master Administrator"
                    error={form.formState.errors.name?.message}
                    disabled={isSaving}
                    className="h-12 bg-slate-50 dark:bg-slate-900 rounded-xl border-slate-100 dark:border-slate-800"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Contextual Info</h4>
                  </div>
                  <Input
                    {...form.register("description")}
                    label="Operational Description"
                    placeholder="Describe limits or intent of this role"
                    error={form.formState.errors.description?.message}
                    disabled={isSaving}
                    className="h-12 bg-slate-50 dark:bg-slate-900 rounded-xl border-slate-100 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Permissions Grid Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                      Module Access Matrices
                    </h3>
                    <p className="text-xs font-medium text-slate-400">Grant or revoke specific functional capabilities across the platform.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                    <span className="text-xs font-black text-primary uppercase tracking-widest leading-none">
                      {selectedPermissionIds.length} Selected
                    </span>
                  </div>
                </div>
                
                {allPermissionsData?.grouped ? (
                  <div className="bg-slate-50/30 dark:bg-slate-900/10 rounded-3xl border border-slate-100 dark:border-slate-800 p-1">
                    <PermissionsGrid
                      groupedPermissions={allPermissionsData.grouped}
                      selectedIds={selectedPermissionIds}
                      onToggle={handleTogglePermission}
                      onToggleModule={handleSelectAllModule}
                      disabled={isSaving}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl gap-4">
                     <Info className="h-8 w-8 text-slate-400" />
                     <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">No functional permissions available for mapping.</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        <div className="p-6 pt-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <FormFooter 
            isLoading={isSaving}
            onCancel={onClose}
            submitLabel={isEdit ? "Update Privileges" : "Finalize Role"}
            className="border-none shadow-none p-0 bg-transparent"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoleFormModal
