import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface CustomSelectOption {
  value: string
  label: React.ReactNode
}

interface CustomSelectProps {
  value?: string
  onValueChange: (value: string) => void
  options: CustomSelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  isLoading?: boolean
  disabled?: boolean
  allowClear?: boolean // If true, "All" or a clear option can be selected
}

export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  triggerClassName,
  isLoading,
  disabled,
}: CustomSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger className={cn("bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 w-[150px]", triggerClassName, className)}>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
