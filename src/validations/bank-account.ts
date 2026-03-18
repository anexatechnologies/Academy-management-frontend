import * as z from "zod"

export const bankAccountSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string()
    .min(1, "Account number is required")
    .regex(/^\d+$/, "Account number must contain only digits"),
  ifsc_code: z.string()
    .min(1, "IFSC code is required")
    .transform((val) => val.toUpperCase())
    .refine((val) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val), {
      message: "Invalid IFSC format (e.g., ABCD0123456)",
    }),
  address: z.string().min(1, "Address is required"),
  opening_balance: z.string().optional().default("0"),
  remark: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>
