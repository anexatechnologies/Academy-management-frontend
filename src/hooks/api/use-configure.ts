import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { Configure } from "@/types/configure"

export const configureKeys = {
  all: ["configure"] as const,
  details: () => [...configureKeys.all, "details"] as const,
}

// Fetch configure details
export function useConfigure() {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: configureKeys.details(),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ status: string; data: Configure }>("/configure")
      return data.data
    },
  })
}

// Update configure details
export function useUpdateConfigure() {
  const queryClient = useQueryClient()
  const axiosPrivate = useAxiosPrivate()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axiosPrivate.put<{ status: string; data: Configure }>(
        "/configure",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configureKeys.all })
    },
  })
}
