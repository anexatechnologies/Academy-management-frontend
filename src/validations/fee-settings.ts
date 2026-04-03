import * as z from "zod"

export const feeSettingsSchema = z.object({
  fee_mode: z.enum(["one-time", "monthly"]),
  tax_percentage: z.string().min(1, "Tax percentage is required"),
  monthly_tax_percentage: z.string().min(1, "Monthly tax percentage is required"),
})

export type FeeSettingsFormValues = z.infer<typeof feeSettingsSchema>
