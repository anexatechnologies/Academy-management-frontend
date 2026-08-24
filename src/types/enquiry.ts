export type EnquiryStatus = "active" | "converted" | "cancelled"

export interface EnquiryLog {
  id: number
  enquiry_id: number
  remark: string
  next_reminder_date: string | null
  created_at: string
}

export interface Enquiry {
  id: number
  enquiry_number?: string
  first_name: string
  middle_name?: string
  last_name: string
  personal_contact: string
  email?: string
  height?: string
  weight?: string
  education?: string
  gender?: string
  parents_contact?: string
  caste?: string
  address?: string
  interested_courses?: string[]
  status: EnquiryStatus
  created_at: string
  updated_at: string
  next_follow_up?: string | null
  logs?: EnquiryLog[]
}

export interface EnquiryWithLogs extends Enquiry {
  logs: EnquiryLog[]
}

export interface CreateEnquiryPayload {
  enquiry_number?: string
  first_name: string
  middle_name?: string
  last_name: string
  personal_contact: string
  email?: string
  height?: string
  weight?: string
  education?: string
  gender?: string
  parents_contact?: string
  caste?: string
  address?: string
  interested_courses?: string[]
}

export type UpdateEnquiryPayload = Partial<CreateEnquiryPayload> & {
  status?: EnquiryStatus
}

export interface AddEnquiryLogPayload {
  remark: string
  next_reminder_date?: string
}

export interface EnquiryListResponse {
  status: string
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  data: Enquiry[]
}

export interface EnquiryDetailResponse {
  status: string
  data: EnquiryWithLogs
}

export interface NextEnquiryNumberResponse {
  status: string
  data: {
    next_enquiry_number: string
    last_enquiry_number: string | null
    current_year: number
    next_seq: number
  }
}
