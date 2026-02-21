import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TablePaginationProps {
  page: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export function TablePagination({
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 50, 100],
}: TablePaginationProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 py-2">
      <div className="flex items-center gap-2">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px] border-slate-200 dark:border-slate-800 focus:ring-primary/20 text-xs rounded-lg">
            <SelectValue placeholder={pageSize.toString()} />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={option.toString()} className="text-xs">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Pagination className="w-auto mx-0">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1); }}
              className={cn(
                "h-8 w-auto px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg",
                page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              )}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1
            if (totalPages <= 5 || (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1)) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); onPageChange(pageNum); }}
                    isActive={page === pageNum}
                    className={cn(
                      "h-8 w-8 text-xs cursor-pointer rounded-lg",
                      page === pageNum ? "bg-primary text-white hover:bg-primary/90 hover:text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            } else if (pageNum === 2 || pageNum === totalPages - 1) {
              return <PaginationItem key={pageNum}><span className="px-2 text-xs text-slate-400">...</span></PaginationItem>
            }
            return null
          })}

          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1); }}
              className={cn(
                "h-8 w-auto px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg",
                page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
