import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { FeeSettingsResponse, UpdateFeeSettingsPayload } from "@/types/fee-settings"

export const useFeeSettings = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["fee-settings"],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<FeeSettingsResponse>("/fee-settings")
      return data.data
    },
  })
}

export const useUpdateFeeSettings = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateFeeSettingsPayload) => {
      const { data } = await axiosPrivate.put("/fee-settings", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-settings"] })
    },
  })
}
