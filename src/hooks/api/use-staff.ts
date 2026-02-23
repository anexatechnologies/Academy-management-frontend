import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type {
  Staff,
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffListResponse,
} from "@/types/staff"

export const useStaffList = (params: {
  page?: number
  limit?: number
  search?: string
  staff_type?: string
  status?: string
}) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["staff", params],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<StaffListResponse>("/staff", {
        params,
      })
      return data
    },
  })
}

export const useStaff = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ success: boolean; data: Staff }>(
        `/staff/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateStaff = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      const formData = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && key !== 'photo_url') {
          formData.append(key, value instanceof File ? value : String(value))
        }
      })
      const { data } = await axiosPrivate.post("/staff", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    },
  })
}

export const useUpdateStaff = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateStaffPayload) => {
      const formData = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && key !== 'photo_url') {
          formData.append(key, value instanceof File ? value : String(value))
        }
      })
      const { data } = await axiosPrivate.put(`/staff/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      queryClient.invalidateQueries({ queryKey: ["staff", id] })
    },
  })
}

export const useDeleteStaff = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosPrivate.delete(`/staff/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    },
  })
}

export const useToggleStaffStatus = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await axiosPrivate.patch(`/staff/${id}/status`, { status })
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] })
    },
  })
}
