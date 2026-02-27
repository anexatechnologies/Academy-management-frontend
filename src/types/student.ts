
export interface EnrolledBatch {
  id: number
  batch_id: number
  batch_name: string
  name?: string // UI compatibility
  course_id: number
  course_name: string
  start_date: string
  end_date: string
  course_base_fees: string | number
  course_fees?: string | number // UI compatibility
  total_fees_with_tax: string | number
  fees_paid: string | number
  fees_remaining: string | number
  is_removable: boolean
}

export interface Student {
  id: number
  student_id: string
  name: string
  father_husband_name: string
  mother_name: string
  address: string
  state: string
  city: string
  pincode: string
  gender: string
  date_of_birth: string
  registration_date: string
  nationality: string
  category: string
  religion: string
  heard_about_us: string
  photo_url: string
  personal_contact: string
  father_contact: string
  mother_contact: string
  email: string
  father_email: string
  mother_email: string
  reference: string
  school_college_company: string
  stream: string
  class_year: string
  semester: string
  university_enrollment_no: string
  status: "active" | "inactive"
  batches?: EnrolledBatch[]
  created_at: string
  updated_at: string
}

export interface CreateStudentPayload {
  name: string
  photo?: File
  photo_url?: string | null
  father_husband_name?: string | null
  mother_name?: string | null
  address?: string | null
  state?: string | null
  city?: string | null
  pincode?: string | null
  gender?: string | null
  date_of_birth?: string | null
  registration_date?: string | null
  nationality?: string | null
  category?: string | null
  religion?: string | null
  heard_about_us?: string | null
  personal_contact: string
  father_contact?: string | null
  mother_contact?: string | null
  email?: string | null
  father_email?: string | null
  mother_email?: string | null
  reference?: string | null
  school_college_company?: string | null
  stream?: string | null
  class_year?: string | null
  semester?: string | null
  university_enrollment_no?: string | null
  batch_ids?: number[]
}

export type UpdateStudentPayload = Partial<CreateStudentPayload>

export interface StudentListResponse {
  success: boolean
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  data: Student[]
}
