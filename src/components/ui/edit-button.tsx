import { Pencil, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface EditButtonProps {
  title?: string
  onEdit?: () => void
  loading?: boolean
  className?: string
}

export function EditButton({ 
  title = "Item", 
  onEdit, 
  loading = false, 
  className 
}: EditButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            disabled={loading}
            className={cn(
              "h-9 w-9 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg",
              className
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Edit {title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
