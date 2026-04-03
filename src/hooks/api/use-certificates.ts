import { useQuery } from "@tanstack/react-query"
import { useAxiosPrivate } from "../useAxiosPrivate"
import type { PaymentListResponse } from "@/types/payment"

export const useCertificates = () => {
  const axiosPrivate = useAxiosPrivate()

  const downloadCertificate = async (
    type: string,
    params: Record<string, any> = {}
  ) => {
    try {
      const response = await axiosPrivate.get(`/certificates/${type}`, {
        params,
        responseType: "blob",
      })

      const file = new Blob([response.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, "_blank")

      return true
    } catch (error: any) {
      console.error("Failed to download certificate:", error)
      throw error
    }
  }

  return { downloadCertificate }
}

export const useCertificatePayments = (params: {
  student_id?: string | number
  batch_id?: string
  course_id?: string
  search?: string
  from_date?: string
  to_date?: string
  status?: string
  page?: number
  limit?: number
} = {}) => {
  const axiosPrivate = useAxiosPrivate()

  return useQuery({
    queryKey: ["certificate-payments", params],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<PaymentListResponse>("/payments", {
        params: { ...params, status: params.status || "paid" }
      })
      return data
    },
  })
}
