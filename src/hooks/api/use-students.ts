import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import type { Student, StudentListResponse, CreateStudentPayload, UpdateStudentPayload } from "@/types/student"

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

export const useCreateStudent = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateStudentPayload) => {
      const formData = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || key === "photo_url") return
        if (key === "batch_ids" && Array.isArray(value)) {
          formData.append("batch_ids", JSON.stringify(value))
        } else if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      })
      const { data } = await axiosPrivate.post("/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
    },
  })
}

export const useUpdateStudent = (id: number) => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateStudentPayload) => {
      const formData = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || key === "photo_url") return
        if (key === "batch_ids" && Array.isArray(value)) {
          formData.append("batch_ids", JSON.stringify(value))
        } else if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      })
      const { data } = await axiosPrivate.put(`/students/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      queryClient.invalidateQueries({ queryKey: ["students", id] })
    },
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
