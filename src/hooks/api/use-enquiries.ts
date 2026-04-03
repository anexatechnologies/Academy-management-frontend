import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type {
  Enquiry,
  EnquiryWithLogs,
  EnquiryListResponse,
  EnquiryDetailResponse,
  CreateEnquiryPayload,
  UpdateEnquiryPayload,
  AddEnquiryLogPayload,
} from "@/types/enquiry"

export const enquiryKeys = {
  all: ["enquiries"] as const,
  list: (params?: object) => [...enquiryKeys.all, "list", params] as const,
  detail: (id: number) => [...enquiryKeys.all, "detail", id] as const,
  logs: (id: number) => [...enquiryKeys.all, "logs", id] as const,
}

// Fetch all enquiries
export function useEnquiries(params: {
  page?: number
  limit?: number
  search?: string
  status?: string
  from_date?: string
  to_date?: string
} = {}) {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: enquiryKeys.list(params),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<EnquiryListResponse>("/enquiries", { params })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

// Fetch single enquiry with logs
export function useEnquiry(id: number) {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: enquiryKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<EnquiryDetailResponse>(`/enquiries/${id}`)
      return data.data as EnquiryWithLogs
    },
    enabled: !!id,
  })
}

// Create enquiry
export function useCreateEnquiry() {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateEnquiryPayload) => {
      const { data } = await axiosPrivate.post<{ status: string; data: Enquiry }>("/enquiries", payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all })
    },
  })
}

// Update enquiry
export function useUpdateEnquiry(id: number) {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateEnquiryPayload) => {
      const { data } = await axiosPrivate.put(`/enquiries/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all })
      queryClient.invalidateQueries({ queryKey: enquiryKeys.detail(id) })
    },
  })
}

// Delete enquiry
export function useDeleteEnquiry() {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosPrivate.delete(`/enquiries/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all })
    },
  })
}

// Add a follow-up log
export function useAddEnquiryLog(enquiryId: number) {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AddEnquiryLogPayload) => {
      const { data } = await axiosPrivate.post(`/enquiries/${enquiryId}/logs`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.detail(enquiryId) })
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all })
    },
  })
}

// Delete a follow-up log
export function useDeleteEnquiryLog(enquiryId: number) {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (logId: number) => {
      const { data } = await axiosPrivate.delete(`/enquiries/logs/${logId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.detail(enquiryId) })
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all })
    },
  })
}

// Fetch active enquiries for student conversion selector
export function useActiveEnquiries(search?: string) {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: enquiryKeys.list({ status: "active", search }),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<EnquiryListResponse>("/enquiries", {
        params: { status: "active", search, limit: 50 },
      })
      return data.data
    },
  })
}
