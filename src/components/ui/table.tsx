import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TablePagination } from "@/components/ui/table-pagination"
import { cn } from "@/lib/utils"

interface TableProps extends React.ComponentProps<"table"> {
  paginationRequired?: boolean
  page?: number
  pageSize?: number
  totalPages?: number
  totalData?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  containerClassName?: string
  tableContainerClassName?: string
}

function Table({ 
  className, 
  paginationRequired = true,
  page = 1,
  pageSize = 10,
  totalPages = 1,
  totalData = 0,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  containerClassName,
  tableContainerClassName,
  ...props 
}: TableProps) {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className={cn(
        "relative flex flex-col w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm",
        containerClassName
      )}>
        <div
          data-slot="table-container"
          className={cn("relative w-full overflow-auto max-h-[calc(100vh-280px)]", tableContainerClassName)}
        >
          <table
            data-slot="table"
            className={cn("w-full caption-bottom text-sm border-collapse", className)}
            {...props}
          />
        </div>
      </div>
      {paginationRequired && (
        <TablePagination 
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalData={totalData}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b bg-slate-100/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm", className)}
      {...props}
    />
  )
}

interface TableBodyProps extends React.ComponentProps<"tbody"> {
  loading?: boolean
  fetching?: boolean
  columnCount?: number
  rowCount?: number
}

function TableBody({ 
  className, 
  loading, 
  fetching,
  columnCount, 
  rowCount = 5, 
  children, 
  ...props 
}: TableBodyProps) {
  if (loading && columnCount) {
    return (
      <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props}>
        {Array.from({ length: rowCount }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: columnCount }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-5 w-full min-w-[100px] max-w-[150px]" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    )
  }

  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0 relative transition-opacity duration-200",
        fetching && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-slate-50/80 dark:hover:bg-slate-800/20 data-[state=selected]:bg-muted border-b transition-colors group animate-in fade-in duration-300",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-slate-600 dark:text-slate-400 h-10 px-4 text-left align-middle font-semibold whitespace-nowrap border-r border-slate-200 dark:border-slate-800 last:border-r-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 px-4 align-middle whitespace-nowrap text-left border-r border-slate-200 dark:border-slate-800 last:border-r-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
