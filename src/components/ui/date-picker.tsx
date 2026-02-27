import * as React from "react"
import DatePicker from "react-datepicker"
import type { DatePickerProps } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface CustomDatePickerProps extends Omit<DatePickerProps, "onChange" | "value" | "selected"> {
  label?: string
  error?: string
  value?: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export function DatePickerInput({
  label,
  error,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  id,
  required,
  ...props
}: CustomDatePickerProps) {
  const generatedId = React.useId()
  const inputId = id || generatedId

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label 
          htmlFor={inputId}
          className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5"
          required={required}
        >
          {label}
        </Label>
      )}
      <div className="space-y-1">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <DatePicker
            id={inputId}
            selected={value}
            onChange={(date: Date | null) => onChange(date)}
            placeholderText={placeholder}
            dateFormat="MMM d, yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-slate-900/50 border-slate-200 h-11 w-full min-w-0 rounded-lg border bg-white pl-10 pr-3.5 py-1 text-[13px] sm:text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all outline-none md:text-sm",
              "hover:border-primary/40 hover:shadow-sm",
              "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:shadow-md",
              error && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
              props.disabled && "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 hover:border-slate-200 hover:shadow-none",
              className
            )}
            wrapperClassName="w-full"
            {...(props as any)}
          />
        </div>
        {error && (
          <div className="min-h-[20px]">
            <p className="text-[12px] font-medium text-rose-500 dark:text-rose-400 ml-0.5 animate-in fade-in slide-in-from-top-0.5 duration-200">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
