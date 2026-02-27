export type StaffType = "Teaching" | "Non-Teaching"
export type StaffCategory = "General" | "OBC" | "SC" | "ST" | "Other"
export type StaffEducation = "SSC" | "HSC" | "Diploma" | "Graduate" | "Post Graduate" | "PhD" | "Other"
export type StaffStatus = "active" | "inactive"

export interface Staff {
  id: number
  staff_type: StaffType
  full_name: string
  photo_url?: string
  address: string
  contact_number: string
  email: string
  date_of_birth: string
  category: StaffCategory
  remarks?: string
  joining_date: string
  education: StaffEducation
  experience_years: number
  last_employer?: string
  status: StaffStatus
  created_at: string
  updated_at: string
}

export interface CreateStaffPayload {
  staff_type: StaffType
  full_name: string
  photo?: File
  photo_url?: string | null
  address: string
  contact_number: string
  email: string
  date_of_birth: string
  category: StaffCategory
  remarks?: string | null
  joining_date: string
  education: StaffEducation
  experience_years: number
  last_employer?: string | null
}

export type UpdateStaffPayload = Partial<CreateStaffPayload>

export interface StaffListResponse {
  success: boolean
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  data: Staff[]
}
