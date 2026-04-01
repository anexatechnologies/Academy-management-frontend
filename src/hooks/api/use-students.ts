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
  payment_status?: "pending" | "overdue" | ""
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
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
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
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
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

export const useDeleteStudent = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosPrivate.delete(`/students/${id}`)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      queryClient.removeQueries({ queryKey: ["students", id] })
    },
  })
}

export const useDownloadAdmissionForm = () => {
  const axiosPrivate = useAxiosPrivate()

  const downloadAdmissionForm = async (studentId: number) => {
    try {
      const response = await axiosPrivate.get(`/students/${studentId}/admission-form`, {
        responseType: "blob",
      })

      const file = new Blob([response.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, "_blank")
      return true
    } catch (error) {
      console.error("Failed to download admission form:", error)
      throw error
    }
  }

  return { downloadAdmissionForm }
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
