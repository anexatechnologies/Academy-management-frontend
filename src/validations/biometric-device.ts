import * as z from "zod"

export const biometricDeviceSchema = z.object({
  device_name: z.string().min(1, "Device name is required"),
  ip_address: z.string()
    .min(1, "IP address is required")
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IPv4 address"),
  port: z.number().min(1, "Port is required"),
  password: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type BiometricDeviceFormValues = z.infer<typeof biometricDeviceSchema>
