export type PaymentMode = "Cash" | "Online" | "UPI" | "Card" | "Bank Transfer"
export type PaymentType = "instalment" | "monthly"
export type PaymentStatus = "paid" | "pending" | "failed"

export interface Payment {
  id: number
  student_id: number
  student_course_id: number
  amount: string | number
  student_name?: string
  student_reg_id?: string
  batch_name?: string
  course_name?: string
  payment_date: string
  payment_mode: PaymentMode
  payment_type: PaymentType
  transaction_reference?: string
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
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
}

export interface RefundPayload {
  amount: number
}

export interface PendingPayment {
  id: number
  student_id: number
  student_name: string
  student_roll_no: string
  student_contact: string
  student_course_id: number
  course_name: string
  installment_number: number
  amount_due: string
  total_fees_remaining: string
  due_date: string
  status: "pending" | "overdue"
  payment_type: PaymentType
}

export interface PendingPaymentsResponse {
  status: string
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  data: PendingPayment[]
}
