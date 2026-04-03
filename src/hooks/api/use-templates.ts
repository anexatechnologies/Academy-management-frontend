import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { AnnouncementTemplate } from "@/types/announcement"

export const useTemplates = (params?: { category?: string; channel?: string; search?: string }) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["templates", params],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ 
        success: boolean; 
        data: AnnouncementTemplate[];
        count: number;
      }>("/templates", { params })
      return data.data
    },
    placeholderData: keepPreviousData,
  })
}

export const useCreateTemplate = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<AnnouncementTemplate, "id">) => {
      const { data } = await axiosPrivate.post("/templates", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
    }
  })
}

export const useUpdateTemplate = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<AnnouncementTemplate> & { id: number }) => {
      const { data } = await axiosPrivate.put(`/templates/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
    }
  })
}

export const useDeleteTemplate = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/templates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
    }
  })
}
