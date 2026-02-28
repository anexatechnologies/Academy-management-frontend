export type PaymentMode = "Cash" | "Online" | "UPI" | "Card" | "Bank Transfer"
export type PaymentType = "instalment" | "monthly"
export type PaymentStatus = "paid" | "pending" | "failed"

export interface Payment {
  id: number
  student_id: number
  student_course_id: number
  amount: string | number
  payment_date: string
  payment_mode: PaymentMode
  payment_type: PaymentType
  transaction_reference?: string
  course_name?: string
  batch_name?: string
  status: PaymentStatus
  due_date?: string
  created_at?: string
}

export interface RecordPaymentPayload {
  student_course_id: number
  amount: number
  payment_date?: string
  payment_mode?: PaymentMode
  payment_type?: PaymentType
  transaction_reference?: string
  due_date?: string
  status?: PaymentStatus
}

export interface PaymentListResponse {
  status: string
  count: number
  data: Payment[]
}
