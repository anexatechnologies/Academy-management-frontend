export type AnnouncementTargetType = 
  | "batch" 
  | "course" 
  | "enquiry" 
  | "all_students" 
  | "staff" 
  | "outstanding_fees" 
  | "single_student"

export interface AnnouncementTemplate {
  id: number
  category: string
  channel: string
  template_name: string
  subject?: string
  body: string
  is_active: boolean
  dlt_template_id?: string
  entity_id?: string
  target: 'student' | 'parent' | 'both'
}

export interface TargetCountItem {
  id: number
  name: string
  student_count: number
}

export interface TargetCountResponse {
  all_students_count: number
  staff_count: number
  outstanding_fees_count: number
  enquiries_count: number
  batches: TargetCountItem[]
  courses: TargetCountItem[]
  enquiries?: TargetCountItem[]
}

export interface AnnouncementPayload {
  target_type: AnnouncementTargetType
  target_ids: number[]
  template_id: number
  channels: string[]
  data?: Record<string, string>
}

export interface AnnouncementResponse {
  status: string
  message: string
  sent_count: number
  errors?: {
    recipient?: string
    phone?: string
    error: string
  }[]
}
