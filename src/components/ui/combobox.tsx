import * as React from "react"
import { Check, ChevronsUpDown, Loader2, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export interface ComboBoxOption {
  value: string
  label: string
}

interface ComboBoxProps {
  value?: string
  onValueChange: (value: string) => void
  options: ComboBoxOption[]
  onSearch?: (query: string) => void
  onLoadMore?: () => void
  onReset?: () => void
  hasMore?: boolean
  isLoading?: boolean
  isLoadingMore?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  label?: string
  error?: string
  triggerClassName?: string
  className?: string
  required?: boolean
}

export function ComboBox({
  value,
  onValueChange,
  options,
  onSearch,
  onLoadMore,
  onReset,
  hasMore = false,
  isLoading = false,
  isLoadingMore = false,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  label,
  error,
  triggerClassName,
  className,
  required,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [canScrollUp, setCanScrollUp] = React.useState(false)
  const [canScrollDown, setCanScrollDown] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)

  const selectedLabel = React.useMemo(() => {
    const found = options.find((o) => o.value === value)
    return found?.label
  }, [options, value])

  // Reset state on close
  React.useEffect(() => {
    if (!open) {
      onReset?.()
    }
  }, [open, onReset])

  // Check scroll position and update arrow indicators
  const updateScrollIndicators = React.useCallback(() => {
    const el = listRef.current
    if (!el) return
    setCanScrollUp(el.scrollTop > 4)
    setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 4)
  }, [])

  // Update indicators when options change or popover opens
  React.useEffect(() => {
    if (!open) return
    // Wait a tick for the DOM to render
    const t = setTimeout(updateScrollIndicators, 50)
    return () => clearTimeout(t)
  }, [open, options.length, updateScrollIndicators])

  // Load more when scrolled near bottom
  const handleScroll = React.useCallback(() => {
    updateScrollIndicators()
    const el = listRef.current
    if (!el || !hasMore || isLoadingMore) return
    const threshold = 40
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      onLoadMore?.()
    }
  }, [hasMore, isLoadingMore, onLoadMore, updateScrollIndicators])

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue === value ? "" : optionValue)
    setOpen(false)
  }

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      {label && (
        <Label 
          className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5"
          required={required}
        >
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all",
              "hover:border-primary/40 hover:shadow-sm",
              "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]",
              "dark:bg-slate-950 dark:border-slate-800",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-none",
              error && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
              triggerClassName
            )}
          >
            <span className={cn("truncate", !selectedLabel && "text-muted-foreground/60")}>
              {selectedLabel || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={!onSearch}>
            <CommandInput
              placeholder={searchPlaceholder}
              onValueChange={(val) => onSearch?.(val)}
            />

            {/* Scroll up indicator */}
            {canScrollUp && (
              <div className="flex justify-center py-0.5 border-b border-slate-100 dark:border-slate-800">
                <ChevronUp className="h-3 w-3 text-slate-400" />
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            <CommandList
              ref={listRef}
              onScroll={handleScroll}
              onWheel={(e) => e.stopPropagation()}
              className="max-h-[220px]"
            >
              {!isLoading && <CommandEmpty>{emptyText}</CommandEmpty>}
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate">{option.label}</span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        value === option.value ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}

                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </CommandGroup>
            </CommandList>

            {/* Scroll down / more items indicator */}
            {(canScrollDown || hasMore) && (
              <div className="flex justify-center py-0.5 border-t border-slate-100 dark:border-slate-800">
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-[12px] font-medium text-rose-500 dark:text-rose-400 ml-0.5 animate-in fade-in slide-in-from-top-0.5 duration-200">
          {error}
        </p>
      )}
    </div>
  )
}
