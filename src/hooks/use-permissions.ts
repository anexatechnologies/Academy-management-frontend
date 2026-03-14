import { useAuth } from "@/context/AuthContext"

type Action = "create" | "read" | "update" | "delete"

export const usePermissions = () => {
  const { auth } = useAuth()

  const hasPermission = (module: string, action: Action) => {
    // Super admin can do everything
    if (auth.user?.role === "super_admin" || auth.user?.role === "SUPER_ADMIN") {
      return true
    }

    if (!auth.user?.permissions) {
      return false
    }

    return auth.user.permissions.some(
      (p) => p.module === module && p.action === action
    )
  }

  // Helper properties for common modules
  return {
    hasPermission,
    canCreateUser: hasPermission("users", "create"),
    canReadUsers: hasPermission("users", "read"),
    canUpdateUser: hasPermission("users", "update"),
    canDeleteUser: hasPermission("users", "delete"),
    canCreateCourse: hasPermission("courses", "create"),
    canReadCourses: hasPermission("courses", "read"),
    canUpdateCourse: hasPermission("courses", "update"),
    canDeleteCourse: hasPermission("courses", "delete"),
    canCreateStaff: hasPermission("staff", "create"),
    canReadStaff: hasPermission("staff", "read"),
    canUpdateStaff: hasPermission("staff", "update"),
    canDeleteStaff: hasPermission("staff", "delete"),
    canCreateBatch: hasPermission("batches", "create"),
    canReadBatches: hasPermission("batches", "read"),
    canUpdateBatch: hasPermission("batches", "update"),
    canDeleteBatch: hasPermission("batches", "delete"),
    canCreateEnquiry: hasPermission("enquiries", "create"),
    canReadEnquiries: hasPermission("enquiries", "read"),
    canUpdateEnquiry: hasPermission("enquiries", "update"),
    canDeleteEnquiry: hasPermission("enquiries", "delete"),
  }
}
