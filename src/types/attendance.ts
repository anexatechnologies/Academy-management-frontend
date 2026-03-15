export type AttendanceSlot = "ground" | "lecture"
export type AttendanceSource = "biometric" | "manual"

export interface AttendanceLog {
  id: number
  student_name: string
  biometric_id: string
  punch_time: string | null
  date: string
  time_slot: AttendanceSlot
  course_name: string | null
  batch_name: string | null
  source: AttendanceSource
  status: string
}

export interface StaffAttendanceLog {
  id: number
  staff_name: string
  biometric_id: string
  punch_time: string | null
  date: string
  staff_type: "teaching" | "non-teaching"
  source: AttendanceSource
  status: string
}

export interface AttendanceFilters {
  [key: string]: string | number | undefined
  page?: number
  limit?: number
  search?: string
  from_date?: string
  to_date?: string
  student_id?: string
  batch_id?: string
  course_id?: string
  slot?: string
  source?: string
}

export interface StaffAttendanceFilters {
  [key: string]: string | number | undefined
  page?: number
  limit?: number
  from_date?: string
  to_date?: string
  staff_id?: string
  staff_type?: "teaching" | "non-teaching"
}

export interface AttendanceListResponse {
  status: string
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  } | null
  data: AttendanceLog[]
}

export interface StaffAttendanceListResponse {
  status: string
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  } | null
  data: StaffAttendanceLog[]
}

export interface ManualAttendancePayload {
  student_id?: string // For students
  staff_id?: string // For staff
  date: string // YYYY-MM-DD
  time_slot?: AttendanceSlot // Optional for staff
  status: "present"
}
