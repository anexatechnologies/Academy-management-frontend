import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
}

function Input({ className, type, label, error, id, ...props }: InputProps) {
  const inputId = id || React.useId()
  
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label 
          htmlFor={inputId}
          className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5"
        >
          {label}
        </Label>
      )}
      <div className="space-y-1">
        <input
          id={inputId}
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-slate-900/50 border-slate-200 h-11 w-full min-w-0 rounded-lg border bg-white px-3.5 py-1 text-base shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "hover:border-primary/40 hover:shadow-sm",
            "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:shadow-md",
            error && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] font-medium text-rose-500 dark:text-rose-400 ml-0.5 animate-in fade-in slide-in-from-top-0.5 duration-200">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export { Input }
