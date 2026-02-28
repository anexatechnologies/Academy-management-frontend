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
import { Label } from "@/components/ui/label"

export interface CustomSelectOption {
  value: string
  label: React.ReactNode
}

interface CustomSelectProps {
  label?: string
  error?: string
  required?: boolean
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
  label,
  error,
  required,
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
    <div className="space-y-1.5 w-full">
      {label && (
        <Label 
          className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5"
          required={required}
        >
          {label}
        </Label>
      )}
      <div className="space-y-1">
        <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
          <SelectTrigger className={cn(
            "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-11 w-full",
            error && "border-rose-400 focus:ring-rose-500/20",
            triggerClassName, 
            className
          )}>
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
