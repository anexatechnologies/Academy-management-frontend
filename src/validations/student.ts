import * as z from "zod"

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
  nationality: z.string().nullish(),
  category: z.string().nullish(),
  religion: z.string().nullish(),
  heard_about_us: z.string().nullish(),
  heard_about_us_remark: z.string().nullish(),

  // Section 2: Contact Info
  personal_contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
  father_contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits").nullish().or(z.literal('')),
  mother_contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits").nullish().or(z.literal('')),
  email: z.string().email("Invalid email format").nullish().or(z.literal("")),
  father_email: z.string().email("Invalid email format").nullish().or(z.literal("")),
  mother_email: z.string().email("Invalid email format").nullish().or(z.literal("")),
  reference: z.string().nullish(),

  // Section 3: College/School Info
  school_college_company: z.string().nullish(),
  stream: z.string().nullish(),
  class_year: z.string().nullish(),
  semester: z.string().nullish(),
  university_enrollment_no: z.string().nullish(),

  // Section 4: Batches
  batch_ids: z.array(z.number()).optional(),

  // Fee & Discount (per registration)
  fee_mode: z.enum(["one-time", "installment"]).default("one-time"),
  discount_amount: z.number().min(0).optional().nullable(),
  discount_percentage: z.number().min(0).max(100).optional().nullable(),
}).refine(
  (data) =>
    data.heard_about_us !== "Other" ||
    (typeof data.heard_about_us_remark === "string" &&
      data.heard_about_us_remark.trim().length > 0),
  {
    path: ["heard_about_us_remark"],
    message: "Remark is required when 'Other' is selected",
  }
)

export type StudentFormValues = z.infer<typeof studentSchema>
