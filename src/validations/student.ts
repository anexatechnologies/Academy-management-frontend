import * as z from "zod"

export const studentSchema = z.object({
  // Section 1: Personal Info
  photo: z.instanceof(File).optional(),
  photo_url: z.string().nullish(),
  name: z.string().min(1, "Name is required"),
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
})

export type StudentFormValues = z.infer<typeof studentSchema>
