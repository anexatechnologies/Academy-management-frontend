import * as z from "zod"

const qualificationEntrySchema = z
  .object({
    degree: z.string().optional(),
    passing_year: z.string().optional(),
    subject_discipline: z.string().optional(),
    board_university: z.string().optional(),
    marks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const py = (data.passing_year ?? "").trim()
    const mk = (data.marks ?? "").trim()

    if (py && !/^\d{4}$/.test(py)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must be a 4-digit year",
        path: ["passing_year"],
      })
    }
    if (mk && !/^\d{1,3}(\.\d{1,2})?$/.test(mk)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid format (e.g. 85.50)",
        path: ["marks"],
      })
    }
  })

export const studentSchema = z.object({
  // Section 1: Personal Info
  photo: z.instanceof(File).optional(),
  photo_url: z.string().nullish(),
  // Full name is still sent to the API, but the form uses separate fields
  name: z.string().nullish(),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().min(1, "Middle name is required"),
  last_name: z.string().min(1, "Last name is required"),
  father_husband_name: z.string().min(1, "Father / Husband name is required"),
  mother_name: z.string().nullish(),
  address: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  pincode: z.string().nullish(),
  gender: z.string().min(1, "Gender is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  registration_date: z.string().min(1, "Registration date is required"),
  registration_no: z.string().optional().or(z.literal("")),
  attendance_id: z.string().regex(/^\d*$/, "Numbers only").optional().or(z.literal("")),
  nationality: z.string().nullish(),
  category: z.string().nullish(),
  religion: z.string().nullish(),
  heard_about_us: z.string().nullish(),
  heard_about_us_remark: z.string().nullish(),
  adhar_no: z.string().regex(/^\d{12}$/, "Adhar number must be exactly 12 digits").nullish().or(z.literal("")),
  place_of_birth: z.string().nullish().or(z.literal("")),
  height: z.string().nullish().or(z.literal("")),
  caste: z.string().nullish().or(z.literal("")),

  // Section 2: Contact Info
  personal_contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
  father_contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits").nullish().or(z.literal('')),
  mother_contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits").nullish().or(z.literal('')),
  email: z.string().email("Invalid email format").nullish().or(z.literal("")),
  father_email: z.string().email("Invalid email format").nullish().or(z.literal("")),
  mother_email: z.string().email("Invalid email format").nullish().or(z.literal("")),
  reference: z.string().nullish(),

  /** Set when registering from an enquiry (URL or dropdown); omitted on edit. */
  enquiry_id: z.number().int().positive().optional(),

  // Section 3: Academic Qualifications (optional; rows with no data are ignored)
  qualifications: z.array(qualificationEntrySchema).optional(),

  // Section 4: Batches
  batch_ids: z.array(z.number()).optional(),

  // Fee & Discount (per registration)
  fee_mode: z.enum(["one-time", "installment"]).default("one-time"),
  discount_amount: z.number().min(0).optional().nullable(),
  discount_percentage: z.number().min(0).max(100).optional().nullable(),
})
  .refine(
    (data) =>
      data.heard_about_us !== "Other" ||
      (typeof data.heard_about_us_remark === "string" &&
        data.heard_about_us_remark.trim().length > 0),
    {
      path: ["heard_about_us_remark"],
      message: "Remark is required when 'Other' is selected",
    }
  )
  .refine(
    (data) => {
      const h = data.height
      if (h == null || String(h).trim() === "") return true
      return /^\d+(\.\d+)?$/.test(String(h).trim())
    },
    {
      path: ["height"],
      message: "Use numbers and decimals only (e.g. 5.8)",
    }
  )

export type StudentFormValues = z.infer<typeof studentSchema>
