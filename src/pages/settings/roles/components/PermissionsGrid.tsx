import { Checkbox } from "@/components/ui/checkbox"
import type { GroupedPermissions } from "@/types/role"
import { Label } from "@/components/ui/label"

interface PermissionsGridProps {
  groupedPermissions: GroupedPermissions
  selectedIds: number[]
  onToggle: (permissionId: number) => void
  onToggleModule: (modulePermissionIds: number[], selectAll: boolean) => void
  disabled?: boolean
}

const PermissionsGrid = ({
  groupedPermissions,
  selectedIds,
  onToggle,
  onToggleModule,
  disabled = false,
}: PermissionsGridProps) => {
  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([moduleName, permissions]) => {
        // Find if all permissions in this module are selected
        const modulePermissionIds = permissions.map((p) => p.id)
        const isAllSelected = modulePermissionIds.every((id) => selectedIds.includes(id))
        const isSomeSelected = modulePermissionIds.some((id) => selectedIds.includes(id)) && !isAllSelected

        return (
          <div
            key={moduleName}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
          >
            {/* Module Header (Select All logic) */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                {moduleName.replace(/_/g, " ")} Module
              </h4>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`module-all-${moduleName}`}
                  checked={isAllSelected}
                  // We simulate 'indeterminate' by visual means or simply rely on checked/unchecked for now
                  onCheckedChange={(checked) => onToggleModule(modulePermissionIds, checked as boolean)}
                  disabled={disabled}
                  className={isSomeSelected && !isAllSelected ? "data-[state=unchecked]:bg-primary/20" : ""}
                />
                <Label
                  htmlFor={`module-all-${moduleName}`}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none"
                >
                  Select All
                </Label>
              </div>
            </div>

            {/* Individual Actions */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              {permissions.map((permission) => {
                const isSelected = selectedIds.includes(permission.id)

                return (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={isSelected}
                      onCheckedChange={() => onToggle(permission.id)}
                      disabled={disabled}
                      className="mt-0.5"
                    />
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor={`permission-${permission.id}`}
                        className="text-[14px] font-medium capitalize cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-200"
                      >
                        {permission.action}
                      </Label>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PermissionsGrid
