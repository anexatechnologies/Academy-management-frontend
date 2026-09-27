export interface Permission {
  id: number
  module: string
  action: string
  description: string
}

export interface User {
  id: number
  username: string
  email: string
  phone: string
  full_name: string
  is_active: boolean
  role_name: string
  role_id: number
  last_login_at: string | null
  created_at: string
  updated_at: string
  permissions?: Permission[]
}

export interface CreateUserPayload {
  username: string
  password?: string
  full_name: string
  role_id: number
  email: string
  phone: string
}

export interface UpdateUserPayload {
  full_name?: string
  email?: string
  phone?: string
  role_id?: number
  is_active?: boolean
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

export interface LoginAuditLog {
  id: number
  user_id: number
  username: string
  full_name: string
  email?: string | null
  role_name: string
  ip_address: string | null
  user_agent: string | null
  status: 'success' | 'failed' | string
  login_at: string
}

export interface LoginAuditLogsResponse {
  status: string
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  data: LoginAuditLog[]
}

export interface LoginAuditLogsParams {
  page?: number
  limit?: number
  search?: string
  user_id?: number
  from_date?: string
  to_date?: string
  status?: string
}
