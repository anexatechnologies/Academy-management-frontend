import type { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"

interface RequirePermissionProps {
  module: string
  action: "create" | "read" | "update" | "delete"
  children: ReactNode
  fallback?: ReactNode
}

export const RequirePermission = ({
  module,
  action,
  children,
  fallback = null,
}: RequirePermissionProps) => {
  const { hasPermission } = usePermissions()

  if (!hasPermission(module, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
