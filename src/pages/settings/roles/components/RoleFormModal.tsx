import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  useCreateRole,
  useUpdateRole,
  useAllPermissions,
  useRolePermissions,
} from "@/hooks/api/use-roles"
import PermissionsGrid from "./PermissionsGrid"

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
      const errMessage = error.response?.data?.message || "Failed to save role"
      toast.error(errMessage)
    }
  }

  const isLoadingData = isEdit ? isLoadingRoleData || isLoadingAllPerms : isLoadingAllPerms
  const isSaving = createRole.isPending || updateRole.isPending

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-950">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEdit ? "Edit Role" : "Create New Role"}
            </DialogTitle>
            <DialogDescription>
              Define the role details and assign specific module permissions.
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
            className="flex-1 overflow-y-auto"
          >
            <div className="p-6 md:p-8 space-y-8">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  {...form.register("name")}
                  label="Role Name"
                  required
                  placeholder="e.g. Counselor, Finance Admin"
                  error={form.formState.errors.name?.message}
                  disabled={isSaving}
                  className="bg-slate-50 dark:bg-slate-900 rounded-lg"
                />
                
                <Input
                  {...form.register("description")}
                  label="Description (Optional)"
                  placeholder="Brief context about this role's purpose"
                  error={form.formState.errors.description?.message}
                  disabled={isSaving}
                  className="bg-slate-50 dark:bg-slate-900 rounded-lg"
                />
              </div>

              {/* Permissions Grid Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Permissions Access
                  </h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {selectedPermissionIds.length} Selected
                  </span>
                </div>
                
                {allPermissionsData?.grouped ? (
                  <PermissionsGrid
                    groupedPermissions={allPermissionsData.grouped}
                    selectedIds={selectedPermissionIds}
                    onToggle={handleTogglePermission}
                    onToggleModule={handleSelectAllModule}
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-sm text-slate-500 italic">No permissions available to configure.</p>
                )}
              </div>
            </div>
          </form>
        )}

        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl h-11 px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="role-form"
            disabled={isSaving || isLoadingData}
            className="rounded-xl h-11 px-8 shadow-lg shadow-primary/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Role"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoleFormModal
