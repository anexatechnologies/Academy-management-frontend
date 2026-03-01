export interface Permission {
  id: number
  module: string
  action: string
  description: string
}

export interface Role {
  id: number
  name: string
  description: string
  created_at: string
}

export interface RoleWithPermissions {
  role: Role
  permissions: Permission[]
}

export interface GroupedPermissions {
  [moduleName: string]: Permission[]
}

export interface PermissionsResponse {
  permissions: Permission[]
  grouped: GroupedPermissions
}

export interface CreateRolePayload {
  name: string
  description: string
  permission_ids: number[]
}

export interface UpdateRolePayload {
  name: string
  description: string
  permission_ids: number[]
}
