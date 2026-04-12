import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type {
  Expense,
  ExpenseListResponse,
  CreateExpensePayload,
  UpdateExpensePayload,
} from "@/types/expense"

export interface ExpenseQueryParams {
  page?: number
  limit?: number
  search?: string
  expense_type?: string
  from_date?: string
  to_date?: string
}

export const useExpenses = (params?: ExpenseQueryParams) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: async () => {
      const response = await axiosPrivate.get<ExpenseListResponse>("/expenses", { params })
      return response.data
    },
    placeholderData: keepPreviousData,
  })
}

export const useCreateExpense = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const response = await axiosPrivate.post<{ data: Expense }>("/expenses", payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })
}

export const useUpdateExpense = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateExpensePayload) => {
      const response = await axiosPrivate.put<{ data: Expense }>(`/expenses/${id}`, payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })
}

export const useDeleteExpense = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/expenses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })
}
