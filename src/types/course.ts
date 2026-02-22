export interface Course {
  id: number
  name: string
  fees: number
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface CreateCoursePayload {
  name: string
  fees: number
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>

export interface CourseListResponse {
  success: boolean
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  data: Course[]
}
