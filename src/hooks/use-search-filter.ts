import { useState, useMemo, useEffect, useCallback, useRef } from "react"

interface UseSearchFilterOptions<T extends Record<string, string | undefined>> {
  initialFilters: T
  debounceMs?: number
  onFilterChange?: () => void
}

interface UseSearchFilterReturn<T extends Record<string, string | undefined>> {
  search: string
  setSearch: (value: string) => void
  debouncedSearch: string
  filters: T
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void
  resetFilters: () => void
  params: { search?: string } & Partial<T>
}

export function useSearchFilter<T extends Record<string, string | undefined>>(
  options: UseSearchFilterOptions<T>
): UseSearchFilterReturn<T> {
  const { initialFilters, debounceMs = 300, onFilterChange } = options

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFilters] = useState<T>(initialFilters)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [search, debounceMs])

  // Use a ref for the callback to avoid re-running the effect when the function reference changes
  const onFilterChangeRef = useRef(onFilterChange)
  onFilterChangeRef.current = onFilterChange

  // Call onFilterChange when debouncedSearch or filters change
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onFilterChangeRef.current?.()
  }, [debouncedSearch, filters])

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setSearch("")
    setDebouncedSearch("")
    setFilters(initialFilters)
  }, [initialFilters])

  // Build combined params object for API calls, omitting empty values
  const params = useMemo(() => {
    const result: Record<string, string> = {}
    if (debouncedSearch) result.search = debouncedSearch
    for (const [key, value] of Object.entries(filters)) {
      if (value) result[key] = value
    }
    return result as { search?: string } & Partial<T>
  }, [debouncedSearch, filters])

  return {
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    resetFilters,
    params,
  }
}
