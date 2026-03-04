import { useAxiosPrivate } from "../useAxiosPrivate"

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

  return { downloadPdfReport }
}
