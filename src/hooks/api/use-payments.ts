import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { PaymentListResponse, RecordPaymentPayload } from "@/types/payment"

export const usePayments = (studentId?: number) => {
  const axiosPrivate = useAxiosPrivate()

  return useQuery({
    queryKey: ["payments", studentId],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<PaymentListResponse>(`/students/${studentId}/payments`)
      return data.data
    },
    enabled: !!studentId,
  })
}

export const useRecordPayment = (studentId?: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RecordPaymentPayload) => {
      const { data } = await axiosPrivate.post(`/students/${studentId}/payments`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", studentId] })
      queryClient.invalidateQueries({ queryKey: ["students", studentId] })
    },
  })
}
