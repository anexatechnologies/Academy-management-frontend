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
  course_fees: string | number
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

export interface BatchStudent {
  id: number
  student_id: string
  name: string
  personal_contact: string
  status: string
  assigned_at: string
}

export interface BatchStudentsResponse {
  status: string
  count: number
  data: BatchStudent[]
}

export interface AssignBatchStudentPayload {
  student_ids: number[]
  force?: boolean
}

export interface BatchAssignmentConflict {
  student_name: string
  student_id: string
  subject: string
  existing_batch: string
  new_batch: string
}
