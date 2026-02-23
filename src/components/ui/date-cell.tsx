import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/date-formatter"
import type { DateFormatOptions } from "@/utils/date-formatter"

interface DateCellProps {
  date: Date | string | null | undefined
  format?: DateFormatOptions
  showIcon?: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
}

/**
 * A reusable component for consistently displaying formatted dates across the application.
 * Utilizes the `formatDate` utility to handle string or Date objects and generate friendly formats like "25th Feb, 2026".
 */
export function DateCell({ 
  date, 
  format = 'readable', 
  showIcon = false, 
  className,
  iconClassName,
  textClassName 
}: DateCellProps) {
  if (!date) {
    return <span className={cn("text-muted-foreground italic", className)}>N/A</span>
  }

  const formattedDate = formatDate(date, format)

  if (!formattedDate) {
    return <span className={cn("text-muted-foreground italic", className)}>Invalid Date</span>
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <CalendarDays className={cn("h-4 w-4 shrink-0 text-muted-foreground/70", iconClassName)} />
      )}
      <span className={cn("truncate", textClassName)}>
        {formattedDate}
      </span>
    </div>
  )
}
