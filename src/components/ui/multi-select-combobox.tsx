import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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

export interface MultiSelectOption {
  value: string
  label: string
  subLabel?: string
  badge?: string
}

interface MultiSelectComboBoxProps {
  values: string[]
  onValuesChange: (values: string[]) => void
  options: MultiSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  label?: string
  error?: string
  triggerClassName?: string
  className?: string
  required?: boolean
  isLoading?: boolean
}

export function MultiSelectComboBox({
  values,
  onValuesChange,
  options,
  placeholder = "All active students (Default)",
  searchPlaceholder = "Search students...",
  emptyText = "No students found.",
  disabled = false,
  label,
  error,
  triggerClassName,
  className,
  required,
  isLoading = false,
}: MultiSelectComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    const query = searchValue.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(query)) ||
        (opt.badge && opt.badge.toLowerCase().includes(query))
    )
  }, [options, searchValue])

  const isAllFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => values.includes(opt.value))

  const handleToggleOption = (val: string) => {
    if (values.includes(val)) {
      onValuesChange(values.filter((v) => v !== val))
    } else {
      onValuesChange([...values, val])
    }
  }

  const handleToggleSelectAll = () => {
    const filteredVals = filteredOptions.map((o) => o.value)
    if (isAllFilteredSelected) {
      onValuesChange(values.filter((v) => !filteredVals.includes(v)))
    } else {
      const newVals = new Set([...values, ...filteredVals])
      onValuesChange(Array.from(newVals))
    }
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValuesChange([])
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
      <Popover open={disabled ? false : open} onOpenChange={(v) => !disabled && setOpen(v)}>
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
            <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
              {values.length === 0 ? (
                <span className="text-muted-foreground/70 truncate">{placeholder}</span>
              ) : (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full border border-primary/20">
                    {values.length} selected
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs truncate font-medium">
                    {values.length === 1
                      ? options.find((o) => o.value === values[0])?.label
                      : `${values.length} specific students`}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {values.length > 0 && (
                <span
                  onClick={handleClearAll}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  title="Clear selection"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 text-slate-400" />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 min-w-[300px]"
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
            />

            <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                disabled={isLoading || filteredOptions.length === 0}
                className="font-semibold text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
              >
                {isAllFilteredSelected ? "Deselect All Listed" : "Select All Listed"}
              </button>
              <span className="text-slate-500 font-medium bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {values.length} / {options.length}
              </span>
            </div>

            <CommandList className="max-h-[240px] overflow-y-auto p-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty className="py-6 text-center text-xs text-slate-500">
                  {emptyText}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => {
                    const isSelected = values.includes(option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => handleToggleOption(option.value)}
                        className="cursor-pointer flex items-center justify-between px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                      >
                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                          <span className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">
                            {option.label}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {option.subLabel && (
                              <span className="text-[11px] text-slate-500 truncate">
                                {option.subLabel}
                              </span>
                            )}
                            {option.badge && (
                              <span className="text-[9px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded truncate">
                                {option.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleOption(option.value)}
                          className="h-4 w-4 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
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
