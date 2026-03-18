import * as z from "zod"

export const bankAccountSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  ifsc_code: z.string().min(1, "IFSC code is required"),
  address: z.string().min(1, "Address is required"),
  opening_balance: z.string().optional().default("0"),
  remark: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>
