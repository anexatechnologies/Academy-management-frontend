export interface Batch {
  id: number
  course_id: number
  course_name: string
  name: string
  capacity: number
  hall_no: string
  start_date: string
  end_date: string
  staff_id: number
  staff_name: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface CreateBatchPayload {
  course_id: number
  name: string
  capacity: number
  hall_no: string
  start_date: string
  end_date: string
  staff_id: number
}

export type UpdateBatchPayload = Partial<CreateBatchPayload>

export interface BatchListResponse {
  success: boolean
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  data: Batch[]
}
