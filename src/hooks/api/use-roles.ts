import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { Role, Permission, RoleWithPermissions } from "@/types/user"

export const useRoles = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await axiosPrivate.get<{ data: Role[] }>("/roles")
      return response.data.data
    },
  })
}

export const useAllPermissions = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await axiosPrivate.get<{ data: Permission[] | Record<string, Permission[]> }>("/roles/permissions")
      return response.data.data
    },
  })
}

export const useRolePermissions = (roleId: number) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["roles", roleId, "permissions"],
    queryFn: async () => {
      const response = await axiosPrivate.get<{ data: RoleWithPermissions }>(`/roles/${roleId}/permissions`)
      return response.data.data
    },
    enabled: !!roleId,
  })
}

export const useUpdateRolePermissions = (roleId: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (permissionIds: number[]) => {
      await axiosPrivate.put(`/roles/${roleId}/permissions`, {
        permission_ids: permissionIds,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", roleId, "permissions"] })
      queryClient.invalidateQueries({ queryKey: ["users"] }) // Users might have combined permissions
    },
  })
}
