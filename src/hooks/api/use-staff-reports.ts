import { useAxiosPrivate } from "../useAxiosPrivate"

export function useStaffReports() {
  const axiosPrivate = useAxiosPrivate()

  const formatStaffType = (type?: string) => {
    if (!type || type === "all") return undefined
    return type === "teaching" ? "Teaching" : "Non-Teaching"
  }

  const downloadStaffMonthlyReport = async (month: number, year: number, staffType?: string) => {
    const response = await axiosPrivate.get("/reports/attendance/staff-monthly", {
      params: { 
        month, 
        year, 
        staff_type: formatStaffType(staffType) 
      },
      responseType: "blob",
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    window.open(url, "_blank")
  }

  const downloadStaffTimingReport = async (fromDate: string, toDate: string, staffType?: string) => {
    const response = await axiosPrivate.get("/reports/attendance/staff-timing", {
      params: { 
        from_date: fromDate, 
        to_date: toDate, 
        staff_type: formatStaffType(staffType) 
      },
      responseType: "blob",
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    window.open(url, "_blank")
  }

  return {
    downloadStaffMonthlyReport,
    downloadStaffTimingReport,
  }
}
