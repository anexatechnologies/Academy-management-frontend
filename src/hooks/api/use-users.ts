import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types/user"

export const useUsers = (params?: { page?: number; limit?: number; search?: string }) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const response = await axiosPrivate.get<{
        status: string
        count: number
        pagination: {
          totalData: number
          totalPages: number
          currentPage: number
          limit: number
        }
        data: User[]
      }>("/users", {
        params,
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })
}

export const useUser = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await axiosPrivate.get<{ data: User }>(`/users/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const response = await axiosPrivate.post<{ data: User }>("/users", payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export const useUpdateUser = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const response = await axiosPrivate.put<{ data: User }>(`/users/${id}`, payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", id] })
    },
  })
}

export const useDeleteUser = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export const useToggleUserStatus = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosPrivate.patch<{
        status: string;
        message: string;
        data: User;
      }>(`/users/${id}/status`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
