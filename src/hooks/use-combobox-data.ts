import { useState, useCallback, useEffect, useRef } from "react"
import { useCourses } from "@/hooks/api/use-courses"
import { useStaffList } from "@/hooks/api/use-staff"
import { useBatches } from "@/hooks/api/use-batches"
import { useRoles } from "@/hooks/api/use-roles"
import { useStudents } from "@/hooks/api/use-students"
import { useEnquiries } from "@/hooks/api/use-enquiries"
import type { ComboBoxOption } from "@/components/ui/combobox"
import type { Batch } from "@/types/batch"
import type { Enquiry } from "@/types/enquiry"

const PAGE_SIZE = 10
const DEBOUNCE_DELAY = 500

export function useCourseComboBox() {
  const [inputValue, setInputValue] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<ComboBoxOption[]>([])
  const lastProcessed = useRef("")

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue)
      setPage(1)
      lastProcessed.current = ""
    }, DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data, isLoading } = useCourses({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: "active",
  })

  // Accumulate options when data changes
  useEffect(() => {
    if (!data?.data) return
    const key = `${search}-${page}-${data.data.length}`
    if (key === lastProcessed.current) return
    lastProcessed.current = key

    const newOptions = data.data.map((c) => ({
      value: String(c.id),
      label: c.name,
    }))

    if (page === 1) {
      setAccumulated(newOptions)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((o) => o.value))
        const unique = newOptions.filter((o) => !seen.has(o.value))
        return [...prev, ...unique]
      })
    }
  }, [data, search, page])

  const hasMore = data ? page < data.pagination.totalPages : false

  const handleSearch = useCallback((query: string) => {
    setInputValue(query)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1)
    }
  }, [isLoading])

  // Reset to page 1 without causing re-fetch cascade
  const handleReset = useCallback(() => {
    setInputValue("")
    setSearch("")
    setPage(1)
    lastProcessed.current = ""
  }, [])

  return {
    options: accumulated,
    isLoading: isLoading && page === 1,
    isLoadingMore: isLoading && page > 1,
    hasMore,
    onSearch: handleSearch,
    onLoadMore: handleLoadMore,
    onReset: handleReset,
  }
}

export function useStaffComboBox() {
  const [inputValue, setInputValue] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<ComboBoxOption[]>([])
  const lastProcessed = useRef("")

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue)
      setPage(1)
      lastProcessed.current = ""
    }, DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data, isLoading } = useStaffList({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: "active",
  })

  useEffect(() => {
    if (!data?.data) return
    const key = `${search}-${page}-${data.data.length}`
    if (key === lastProcessed.current) return
    lastProcessed.current = key

    const newOptions = data.data.map((s) => ({
      value: String(s.id),
      label: s.full_name + (s.staff_id ? ` (${s.staff_id})` : ""),
    }))

    if (page === 1) {
      setAccumulated(newOptions)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((o) => o.value))
        const unique = newOptions.filter((o) => !seen.has(o.value))
        return [...prev, ...unique]
      })
    }
  }, [data, search, page])

  const hasMore = data ? page < data.pagination.totalPages : false

  const handleSearch = useCallback((query: string) => {
    setInputValue(query)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1)
    }
  }, [isLoading])

  const handleReset = useCallback(() => {
    setInputValue("")
    setSearch("")
    setPage(1)
    lastProcessed.current = ""
  }, [])

  return {
    options: accumulated,
    isLoading: isLoading && page === 1,
    isLoadingMore: isLoading && page > 1,
    hasMore,
    onSearch: handleSearch,
    onLoadMore: handleLoadMore,
    onReset: handleReset,
  }
}

export function useBatchComboBox(options?: { activeOnly?: boolean }) {
  const [inputValue, setInputValue] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<ComboBoxOption[]>([])
  const [rawData, setRawData] = useState<Batch[]>([])
  const lastProcessed = useRef("")

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue)
      setPage(1)
      lastProcessed.current = ""
    }, DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data, isLoading } = useBatches({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: options?.activeOnly ? "active" : undefined,
  })

  useEffect(() => {
    if (!data?.data) return
    const key = `${search}-${page}-${data.data.length}`
    if (key === lastProcessed.current) return
    lastProcessed.current = key
    const activeData = options?.activeOnly 
      ? data.data.filter((b) => b.status?.toLowerCase() === "active")
      : data.data

    const newOptions = activeData.map((b) => ({
      value: String(b.id),
      label: b.name,
    }))

    if (page === 1) {
      setAccumulated(newOptions)
      setRawData(activeData)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((o) => o.value))
        const unique = newOptions.filter((o) => !seen.has(o.value))
        return [...prev, ...unique]
      })
      setRawData((prev) => {
        const seen = new Set(prev.map((b) => b.id))
        const unique = activeData.filter((b) => !seen.has(b.id))
        return [...prev, ...unique]
      })
    }
  }, [data, search, page])

  const hasMore = data ? page < data.pagination.totalPages : false

  const handleSearch = useCallback((query: string) => {
    setInputValue(query)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1)
    }
  }, [isLoading])

  const handleReset = useCallback(() => {
    setInputValue("")
    setSearch("")
    setPage(1)
    lastProcessed.current = ""
  }, [])

  return {
    options: accumulated,
    rawData,
    isLoading: isLoading && page === 1,
    isLoadingMore: isLoading && page > 1,
    hasMore,
    onSearch: handleSearch,
    onLoadMore: handleLoadMore,
    onReset: handleReset,
  }
}

export function useRoleComboBox(valueKey: "id" | "name" = "id") {
  const [inputValue, setInputValue] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<ComboBoxOption[]>([])
  const lastProcessed = useRef("")

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue)
      setPage(1)
      lastProcessed.current = ""
    }, DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data, isLoading } = useRoles({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  })

  useEffect(() => {
    if (!data?.data) return
    const key = `${search}-${page}-${data.data.length}`
    if (key === lastProcessed.current) return
    lastProcessed.current = key

    const newOptions = data.data.map((r) => ({
      value: String(r[valueKey]),
      label: r.name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }))

    if (page === 1) {
      setAccumulated(newOptions)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((o) => o.value))
        const unique = newOptions.filter((o) => !seen.has(o.value))
        return [...prev, ...unique]
      })
    }
  }, [data, search, page])

  const hasMore = data?.pagination ? page < data.pagination.totalPages : false

  const handleSearch = useCallback((query: string) => {
    setInputValue(query)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1)
    }
  }, [isLoading])

  const handleReset = useCallback(() => {
    setInputValue("")
    setSearch("")
    setPage(1)
    lastProcessed.current = ""
  }, [])

  return {
    options: accumulated,
    isLoading: isLoading && page === 1,
    isLoadingMore: isLoading && page > 1,
    hasMore,
    onSearch: handleSearch,
    onLoadMore: handleLoadMore,
    onReset: handleReset,
  }
}

export function useEnquiryComboBox() {
  const [inputValue, setInputValue] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<ComboBoxOption[]>([])
  const [rawData, setRawData] = useState<Enquiry[]>([])
  const lastProcessed = useRef("")

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue)
      setPage(1)
      lastProcessed.current = ""
    }, DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data, isLoading } = useEnquiries({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: "active",
  })

  useEffect(() => {
    if (!data?.data) return
    const key = `${search}-${page}-${data.data.length}`
    if (key === lastProcessed.current) return
    lastProcessed.current = key

    const newOptions = data.data.map((e) => ({
      value: String(e.id),
      label: [e.first_name, e.middle_name, e.last_name].filter(Boolean).join(" ") + ` (${e.personal_contact})`,
    }))

    if (page === 1) {
      setAccumulated(newOptions)
      setRawData(data.data)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((o) => o.value))
        const unique = newOptions.filter((o) => !seen.has(o.value))
        return [...prev, ...unique]
      })
      setRawData((prev) => {
        const seen = new Set(prev.map((e) => e.id))
        const unique = data.data.filter((e) => !seen.has(e.id))
        return [...prev, ...unique]
      })
    }
  }, [data, search, page])

  const hasMore = data?.pagination ? page < data.pagination.totalPages : false

  const handleSearch = useCallback((query: string) => {
    setInputValue(query)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1)
    }
  }, [isLoading])

  const handleReset = useCallback(() => {
    setInputValue("")
    setSearch("")
    setPage(1)
    lastProcessed.current = ""
  }, [])

  return {
    options: accumulated,
    rawData,
    isLoading: isLoading && page === 1,
    isLoadingMore: isLoading && page > 1,
    hasMore,
    onSearch: handleSearch,
    onLoadMore: handleLoadMore,
    onReset: handleReset,
  }
}

export function useStudentComboBox(batchId?: string, valueKey: "id" | "student_id" = "id") {
  const [inputValue, setInputValue] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<ComboBoxOption[]>([])
  const lastProcessed = useRef("")

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue)
      setPage(1)
      lastProcessed.current = ""
    }, DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data, isLoading } = useStudents({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: "active",
    batch_id: batchId,
  })

  useEffect(() => {
    // Reset if batchId changes to prevent showing old students
    setInputValue("")
    setSearch("")
    setPage(1)
    setAccumulated([])
    lastProcessed.current = ""
  }, [batchId])

  useEffect(() => {
    if (!data?.data) return
    const key = `${search}-${page}-${data.data.length}-${batchId}-${valueKey}`
    if (key === lastProcessed.current) return
    lastProcessed.current = key

    const newOptions = data.data.map((s) => ({
      value: String(s[valueKey]),
      label: s.name + (s.student_id ? ` (${s.student_id})` : ""),
    }))

    if (page === 1) {
      setAccumulated(newOptions)
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((o) => o.value))
        const unique = newOptions.filter((o) => !seen.has(o.value))
        return [...prev, ...unique]
      })
    }
  }, [data, search, page, batchId])

  const hasMore = data?.pagination ? page < data.pagination.totalPages : false

  const handleSearch = useCallback((query: string) => {
    setInputValue(query)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1)
    }
  }, [isLoading])

  const handleReset = useCallback(() => {
    setInputValue("")
    setSearch("")
    setPage(1)
    lastProcessed.current = ""
  }, [])

  return {
    options: accumulated,
    isLoading: isLoading && page === 1,
    isLoadingMore: isLoading && page > 1,
    hasMore,
    onSearch: handleSearch,
    onLoadMore: handleLoadMore,
    onReset: handleReset,
  }
}
