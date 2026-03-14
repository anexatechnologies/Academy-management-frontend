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
  first_name: string
  middle_name?: string
  last_name: string
  personal_contact: string
  email?: string
  height?: string
  weight?: string
  education?: string
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
  first_name: string
  middle_name?: string
  last_name: string
  personal_contact: string
  email?: string
  height?: string
  weight?: string
  education?: string
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
