import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { Batch, CreateBatchPayload, UpdateBatchPayload, BatchListResponse } from "@/types/batch"

export const useBatches = (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  course_id?: string
}) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["batches", params],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<BatchListResponse>("/batches", {
        params,
      })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export const useBatch = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["batches", id],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ success: boolean; data: Batch }>(
        `/batches/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateBatch = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBatchPayload) => {
      const { data } = await axiosPrivate.post<{ data: Batch }>("/batches", payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
    },
  })
}

export const useUpdateBatch = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateBatchPayload) => {
      const { data } = await axiosPrivate.put<{ data: Batch }>(`/batches/${id}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
      queryClient.invalidateQueries({ queryKey: ["batches", id] })
    },
  })
}

export const useDeleteBatch = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/batches/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
    },
  })
}

export const useToggleBatchStatus = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await axiosPrivate.patch(`/batches/${id}/status`, { status })
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
      queryClient.invalidateQueries({ queryKey: ["batches", variables.id] })
    },
  })
}
