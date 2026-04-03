import * as React from "react"
import { Trash2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DeleteButtonProps {
  title?: string
  onDelete?: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function DeleteButton({ 
  title = "Item", 
  onDelete, 
  loading = false, 
  disabled = false,
  className 
}: DeleteButtonProps) {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
    onDelete?.()
  }

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={loading || disabled}
                    className={cn(
                      "h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-lg",
                      open && "bg-rose-50 text-rose-600 shadow-inner",
                      className
                    )}
                  >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            {!open && (
              <TooltipContent side="top">
                <p>Delete {title}</p>
              </TooltipContent>
            )}
          </Tooltip>
          
          <PopoverContent className="w-80 p-4" align="end" side="top">
            <div className="flex gap-4">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900 leading-none">Delete {title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Do you want to Delete this {title}? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-slate-600"
                    onClick={() => setOpen(false)}
                  >
                    No, Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 px-3 shadow-sm"
                    onClick={handleConfirm}
                  >
                    Yes, Delete
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}
