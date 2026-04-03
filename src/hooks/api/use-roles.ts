import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"

import type {
  Role,
  RoleWithPermissions,
  PermissionsResponse,
  CreateRolePayload,
  UpdateRolePayload,
} from "@/types/role"

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
  permissionsAll: () => ["permissions", "all"] as const,
  permissionsDetail: (id: number) => ["permissions", "detail", id] as const,
}

export const useRoles = (params?: { page?: number; limit?: number; search?: string }) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: [...roleKeys.lists(), params],
    queryFn: async () => {
      const response = await axiosPrivate.get<{ 
        data: Role[]; 
        pagination?: { 
          page: number; 
          limit: number; 
          totalData: number; 
          totalPages: number;
        } 
      }>("/roles", { params })
      return response.data
    },
    placeholderData: keepPreviousData,
  })
}

export const useAllPermissions = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: roleKeys.permissionsAll(),
    queryFn: async () => {
      const response = await axiosPrivate.get<{ data: PermissionsResponse }>("/roles/permissions")
      return response.data.data
    },
  })
}

export const useRolePermissions = (roleId: number | null) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: roleKeys.permissionsDetail(roleId as number),
    queryFn: async () => {
      const response = await axiosPrivate.get<{ data: RoleWithPermissions }>(`/roles/${roleId}/permissions`)
      return response.data.data
    },
    enabled: !!roleId,
  })
}

export const useCreateRole = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      const response = await axiosPrivate.post("/roles", payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}

export const useUpdateRole = (roleId: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateRolePayload) => {
      const response = await axiosPrivate.put(`/roles/${roleId}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) })
      queryClient.invalidateQueries({ queryKey: roleKeys.permissionsDetail(roleId) })
    },
  })
}

export const useDeleteRole = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (roleId: number) => {
      const response = await axiosPrivate.delete(`/roles/${roleId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}
