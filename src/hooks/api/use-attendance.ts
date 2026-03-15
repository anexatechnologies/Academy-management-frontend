import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAxiosPrivate } from "../useAxiosPrivate"
import type { 
  AttendanceListResponse, 
  AttendanceFilters, 
  ManualAttendancePayload,
  StaffAttendanceFilters,
  StaffAttendanceListResponse
} from "@/types/attendance"

export function useAttendanceLogs(filters: AttendanceFilters = {}) {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: ["attendance-logs", filters],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<AttendanceListResponse>("/attendance", {
        params: filters,
      })
      return data
    },
  })
}

export function useStaffAttendanceLogs(filters: StaffAttendanceFilters = {}) {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: ["staff-attendance-logs", filters],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<StaffAttendanceListResponse>("/attendance/staff-logs", {
        params: filters,
      })
      return data
    },
  })
}

export function useMarkManualAttendance() {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (payload: ManualAttendancePayload) => {
      const { data } = await axiosPrivate.post("/attendance/manual", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-logs"] })
      queryClient.invalidateQueries({ queryKey: ["staff-attendance-logs"] })
    },
  })
}
