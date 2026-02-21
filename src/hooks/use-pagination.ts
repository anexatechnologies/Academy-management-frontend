import { useState, useMemo } from "react"

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface UsePaginationProps {
  initialPage?: number
  initialPageSize?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [total, setTotal] = useState(totalItems)

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize])

  const handlePageChange = (newPage: number) => {
    const validatedPage = Math.max(1, Math.min(newPage, totalPages || 1))
    setPage(validatedPage)
    onPageChange?.(validatedPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when page size changes
    onPageSizeChange?.(newPageSize)
  }

  return {
    page,
    pageSize,
    total,
    totalPages,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    setTotal,
    nextPage: () => handlePageChange(page + 1),
    prevPage: () => handlePageChange(page - 1),
    canNextPage: page < totalPages,
    canPrevPage: page > 1,
  }
}
