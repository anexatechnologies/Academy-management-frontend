import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { PaymentListResponse, PendingPaymentsResponse, RecordPaymentPayload, RefundPayload } from "@/types/payment"

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

export const useRefundPayment = (studentId?: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ paymentId, payload }: { paymentId: number; payload: RefundPayload }) => {
      const { data } = await axiosPrivate.post(`/payments/${paymentId}/refund`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", studentId] })
      queryClient.invalidateQueries({ queryKey: ["students", studentId] })
    },
  })
}

export const useUpdateInstallmentDueDate = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ installmentId, due_date }: { installmentId: number; due_date: string }) => {
      const { data } = await axiosPrivate.put(`/payments/installments/${installmentId}/due-date`, { due_date })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-payments"] })
    },
  })
}

export const usePendingPayments = (params: {
  page?: number
  limit?: number
  search?: string
  status?: "pending" | "overdue" | ""
  sort?: "newest" | string
}) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["pending-payments", params],
    queryFn: async () => {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== undefined)
      )
      const { data } = await axiosPrivate.get<PendingPaymentsResponse>("/payments/pending", { params: cleanParams })
      return data
    },
    placeholderData: keepPreviousData,
  })
}
