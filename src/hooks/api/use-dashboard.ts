import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import { toast } from "sonner"
import type {
  AttendanceSummary,
  StudentCount,
  FeesSummary,
  BirthdayStudent,
  DuePayment,
  PaginatedResponse,
} from "@/types/dashboard"

const dashboardKeys = {
  all: ["dashboard"] as const,
  attendance: () => [...dashboardKeys.all, "attendance-summary"] as const,
  studentCount: () => [...dashboardKeys.all, "student-count"] as const,
  feesSummary: () => [...dashboardKeys.all, "fees-summary"] as const,
  birthdays: (params: { page?: number; limit?: number }) => [...dashboardKeys.all, "birthdays", params] as const,
  duePayments: (params: { page?: number; limit?: number }) => [...dashboardKeys.all, "due-payments", params] as const,
}

export const useAttendanceSummary = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: dashboardKeys.attendance(),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ status: string; data: AttendanceSummary }>(
        "/dashboard/attendance-summary"
      )
      return data.data
    },
  })
}

export const useStudentCount = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: dashboardKeys.studentCount(),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ status: string; data: StudentCount }>(
        "/dashboard/student-count"
      )
      return data.data
    },
  })
}

export const useFeesSummary = () => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: dashboardKeys.feesSummary(),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ status: string; data: FeesSummary }>(
        "/dashboard/fees-summary"
      )
      return data.data
    },
  })
}

export const useTodayBirthdays = (params: { page?: number; limit?: number }) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: dashboardKeys.birthdays(params),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<PaginatedResponse<BirthdayStudent>>(
        "/dashboard/birthdays",
        { params }
      )
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export const useSendBirthdayWishes = () => {
  const axiosPrivate = useAxiosPrivate()
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosPrivate.post<{ status: string; message: string }>(
        "/dashboard/send-birthday-wishes"
      )
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message || "Birthday wishes sent successfully!")
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to send birthday wishes"
      toast.error(msg)
    },
  })
}

export const useDuePayments = (params: { page?: number; limit?: number }) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: dashboardKeys.duePayments(params),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<PaginatedResponse<DuePayment>>(
        "/dashboard/due-payments",
        { params }
      )
      return data
    },
    placeholderData: keepPreviousData,
  })
}
