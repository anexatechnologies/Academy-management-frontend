export interface AttendanceSummary {
  date: string
  total_active_students: number
  ground: {
    present: number
    absent: number
  }
  lecture: {
    present: number
    absent: number
  }
}

export interface StudentCount {
  total: number
  male: number
  female: number
  active: number
  inactive: number
}

export interface FeesSummary {
  total_expected: string
  total_collected: string
  total_remaining: string
}

export interface BirthdayStudent {
  id: number
  student_id: string
  name: string
  personal_contact: string
  date_of_birth: string
}

export interface DuePayment {
  id: number
  student_id: number
  student_name: string
  personal_contact: string
  amount: string
  due_date: string
  status: "pending" | "overdue"
}

export interface PaginatedResponse<T> {
  status: string
  count?: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  data: T[]
}
