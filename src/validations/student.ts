import * as z from "zod"

export const studentSchema = z.object({
  // Section 1: Personal Info
  photo: z.instanceof(File).optional(),
  photo_url: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  father_husband_name: z.string().optional(),
  mother_name: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  registration_date: z.string().optional(),
  nationality: z.string().optional(),
  category: z.string().optional(),
  religion: z.string().optional(),
  heard_about_us: z.string().optional(),

  // Section 2: Contact Info
  personal_contact: z.string().min(10, "Contact must be at least 10 digits").max(15, "Contact is too long"),
  father_contact: z.string().optional(),
  mother_contact: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  father_email: z.string().email("Invalid email format").optional().or(z.literal("")),
  mother_email: z.string().email("Invalid email format").optional().or(z.literal("")),
  reference: z.string().optional(),

  // Section 3: College/School Info
  school_college_company: z.string().optional(),
  stream: z.string().optional(),
  class_year: z.string().optional(),
  semester: z.string().optional(),
  university_enrollment_no: z.string().optional(),

  // Section 4: Batches
  batch_ids: z.array(z.number()).optional(),
})

export type StudentFormValues = z.infer<typeof studentSchema>
