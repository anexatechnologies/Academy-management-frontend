import * as z from "zod"

export const templateSchema = z.object({
  template_name: z.string().min(1, "Template name is required"),
  category: z.string().min(1, "Category is required"),
  channel: z.string().min(1, "Channel is required"),
  body: z.string().min(1, "Template body is required"),
  target: z.enum(["student", "parent", "both"]).default("student"),
  template_id: z.string().optional(), // DLT Template ID (SMS) / WhatsApp Template ID
  entity_id: z.string().optional(),   // Principal Entity ID (DLT)
})

export type TemplateFormValues = z.infer<typeof templateSchema>
