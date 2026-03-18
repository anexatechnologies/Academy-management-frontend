import * as z from "zod"

export const templateSchema = z.object({
  body: z.string().min(1, "Template body is required"),
  template_id: z.string().optional(), // DLT Template ID
})

export type TemplateFormValues = z.infer<typeof templateSchema>
