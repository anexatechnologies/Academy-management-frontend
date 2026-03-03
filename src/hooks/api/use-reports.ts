import { useAxiosPrivate } from "../useAxiosPrivate"

export const useDownloadReport = () => {
  const axiosPrivate = useAxiosPrivate()

  const downloadPdfReport = async (
    endpointUrl: string,
    params: Record<string, any> = {},
    defaultFilename: string = "report.pdf"
  ) => {
    try {
      // 1. Make the request expecting a Blob (binary data)
      const response = await axiosPrivate.get(endpointUrl, {
        params,
        responseType: "blob", // CRITICAL: Tells axios to not parse it as string/JSON
      })

      // 2. Extract filename from Content-Disposition header if possible
      let filename = defaultFilename
      const disposition = response.headers["content-disposition"]
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(disposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "")
        }
      }

      // 3. Create a temporary Blob URL
      const file = new Blob([response.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(file)

      // 4. Create a temporary anchor tag to force download
      const link = document.createElement("a")
      link.href = fileURL
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()

      // 5. Cleanup
      link.parentNode?.removeChild(link)
      URL.revokeObjectURL(fileURL)

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
