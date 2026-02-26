import { useState, useCallback, useEffect, useRef } from "react"
import { useCourses } from "@/hooks/api/use-courses"
import { useStaffList } from "@/hooks/api/use-staff"
import type { ComboBoxOption } from "@/components/ui/combobox"

const PAGE_SIZE = 10

export function useCourseComboBox() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<ComboBoxOption[]>([])
  const lastProcessed = useRef("")

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
    setSearch(query)
    setPage(1)
    lastProcessed.current = ""
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1)
    }
  }, [isLoading])

  // Reset to page 1 without causing re-fetch cascade
  const handleReset = useCallback(() => {
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
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<ComboBoxOption[]>([])
  const lastProcessed = useRef("")

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
      label: s.full_name,
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
    setSearch(query)
    setPage(1)
    lastProcessed.current = ""
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1)
    }
  }, [isLoading])

  const handleReset = useCallback(() => {
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
