export const EXPENSE_TYPES = [
  "Accounting/CA",
  "Advertisement",
  "AMCs",
  "Broadband",
  "Cafeteria Inventory",
  "Cleaning Supplies",
  "Electricity",
  "Events",
  "LandLine Phone",
  "Miscelleneous",
  "Mobile bills",
  "Recovery",
  "Rent",
  "Repairs",
  "Salary",
  "Stationary",
  "Travel",
] as const

export type ExpenseType = (typeof EXPENSE_TYPES)[number]

export interface Expense {
  id: number
  expense_type: string
  amount: number
  expense_date: string
  paid_to?: string
  remarks?: string
  gst_no?: string
  is_cheque_dd: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseListResponse {
  status: string
  count: number
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
    limit: number
  }
  summary: {
    totalExpenses: number
  }
  data: Expense[]
}

export interface CreateExpensePayload {
  expense_type: string
  amount: number
  expense_date: string
  paid_to?: string
  remarks?: string
  gst_no?: string
  is_cheque_dd?: boolean
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>
