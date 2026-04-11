export interface Qualification {
  degree: "S.S.C." | "H.S.C." | "Degree" | "Post Graduate"
  passing_year: string
  subject_discipline: string
  board_university: string
  marks: string
}

export interface Installment {
  id: number
  student_course_id: number
  installment_number: number
  original_amount: number | string
  amount_due: number | string
  due_date: string
  status: "pending" | "paid" | "overridden"
  paid_on?: string | null
}

export interface EnrolledBatch {
  id: number
  student_course_id: number
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
  installments: Installment[]
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
  registration_no: string
  attendance_id: string
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
  status: "active" | "inactive"
  adhar_no?: string
  place_of_birth?: string
  height?: string
  caste?: string
  qualifications?: Qualification[]
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
  registration_no?: string | null
  attendance_id?: string | null
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
  adhar_no?: string | null
  place_of_birth?: string | null
  height?: string | null
  caste?: string | null
  qualifications?: Qualification[]
  batch_ids?: number[]
  /** Links new student registration to the source enquiry */
  enquiry_id?: number
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
