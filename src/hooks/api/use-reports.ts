import { useAxiosPrivate } from "../useAxiosPrivate"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const useDownloadReport = () => {
  const axiosPrivate = useAxiosPrivate()

  const downloadPdfReport = async (
    endpointUrl: string,
    params: Record<string, any> = {}
  ) => {
    try {
      // 1. Make the request expecting a Blob (binary data)
      const response = await axiosPrivate.get(endpointUrl, {
        params,
        responseType: "blob", // CRITICAL: Tells axios to not parse it as string/JSON
      })

      // 3. Create a temporary Blob URL
      const file = new Blob([response.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(file)

      // 4. Open in a new tab
      window.open(fileURL, "_blank")

      return true // Success
    } catch (error: any) {
      console.error("Failed to download PDF:", error)
      
      // If server returned JSON error instead of blob, parse it
      if (
        error.response &&
        error.response.data &&
        error.response.data instanceof Blob &&
        error.response.data.type === "application/json"
      ) {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            try {
              const errorData = JSON.parse(reader.result)
              console.error("Parsed JSON error from Blob:", errorData)
              // We could throw it to be handled by the UI
            } catch (e) {
              console.error("Failed to parse error blob", e)
            }
          }
        }
        reader.readAsText(error.response.data)
      }
      
      throw error // Re-throw to show a toast in UI
    }
  }

  const downloadExcelReport = async (
    endpointUrl: string,
    data: Record<string, any> = {}
  ) => {
    try {
      const response = await axiosPrivate.post(endpointUrl, data, {
        responseType: "blob", // CRITICAL: Tells axios to not parse it as string/JSON
      })

      const file = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const fileURL = URL.createObjectURL(file)

      const link = document.createElement('a')
      link.href = fileURL
      link.setAttribute('download', 'student_master_report.xlsx')
      document.body.appendChild(link)
      link.click()
      
      link.remove()
      window.URL.revokeObjectURL(fileURL)

      return true // Success
    } catch (error: any) {
      console.error("Failed to download Excel:", error)
      
      if (
        error.response &&
        error.response.data &&
        error.response.data instanceof Blob &&
        error.response.data.type === "application/json"
      ) {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            try {
              const errorData = JSON.parse(reader.result)
              console.error("Parsed JSON error from Blob:", errorData)
            } catch (e) {
              console.error("Failed to parse error blob", e)
            }
          }
        }
        reader.readAsText(error.response.data)
      }
      
      throw error
    }
  }

  return { downloadPdfReport, downloadExcelReport }
}

export interface DownloadIdCardsPayload {
  studentIds?: number[]
  batchId?: number
  courseId?: number
  all?: boolean
}

export const useDownloadIdCards = () => {
  const axiosPrivate = useAxiosPrivate()

  return useMutation({
    mutationFn: async (payload: DownloadIdCardsPayload) => {
      const response = await axiosPrivate.post("/reports/id-cards", payload, {
        responseType: "blob",
      })

      const file = new Blob([response.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, "_blank")
      return true
    },
    onSuccess: () => {
      toast.success("ID cards generated successfully")
    },
    onError: (error: any) => {
      console.error("Failed to generate ID cards:", error)
      toast.error("Failed to generate ID cards. Please try again.")
    },
  })
}

export const useDownloadEnquiryPdf = () => {
  const axiosPrivate = useAxiosPrivate()

  return useMutation({
    mutationFn: async (enquiryId: number) => {
      const response = await axiosPrivate.get(`/reports/enquiry-form/${enquiryId}`, {
        responseType: "blob",
      })

      const file = new Blob([response.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, "_blank")
      return true
    },
    onError: (error: any) => {
      console.error("Failed to generate enquiry PDF:", error)
      toast.error("Failed to generate enquiry PDF form")
    },
  })
}


