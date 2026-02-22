import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

function Input({ className, type, label, error, id, leftIcon, ...props }: InputProps) {
  const inputId = id || React.useId()
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === "password"
  
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
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            data-slot="input"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-slate-900/50 border-slate-200 h-11 w-full min-w-0 rounded-lg border bg-white px-3.5 py-1 text-base shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "hover:border-primary/40 hover:shadow-sm",
              "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:shadow-md",
              leftIcon && "pl-12",
              isPassword && "pr-10",
              error && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
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

export { Input }
