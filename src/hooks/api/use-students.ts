import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { Student, StudentListResponse } from "@/types/student"

export const useStudents = (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  gender?: string
  from_date?: string
  to_date?: string
  course_id?: string
  batch_id?: string
}) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<StudentListResponse>("/students", {
        params,
      })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export const useStudent = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<{ success: boolean; data: Student }>(
        `/students/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })
}

export const useDeactivateStudent = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/students/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
    },
  })
}

export const useToggleStudentStatus = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosPrivate.patch(`/students/${id}/status`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
    },
  })
}
