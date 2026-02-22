import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { Course, CreateCoursePayload, UpdateCoursePayload, CourseListResponse } from "@/types/course"

export const useCourses = (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["courses", params],
    queryFn: async () => {
      const response = await axiosPrivate.get<CourseListResponse>("/courses", {
        params,
      })
      return response.data
    },
  })
}

export const useCourse = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  return useQuery({
    queryKey: ["courses", id],
    queryFn: async () => {
      const response = await axiosPrivate.get<{ data: Course }>(`/courses/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export const useCreateCourse = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateCoursePayload) => {
      const response = await axiosPrivate.post<{ data: Course }>("/courses", payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

export const useUpdateCourse = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateCoursePayload) => {
      const response = await axiosPrivate.put<{ data: Course }>(`/courses/${id}`, payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      queryClient.invalidateQueries({ queryKey: ["courses", id] })
    },
  })
}

export const useDeleteCourse = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/courses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

export const useToggleCourseStatus = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosPrivate.patch<{ data: { id: number; status: string } }>(`/courses/${id}/status`)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}
