import { Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ViewButtonProps {
  title?: string
  onView?: () => void
  loading?: boolean
  className?: string
}

export function ViewButton({ 
  title = "Item", 
  onView, 
  loading = false, 
  className 
}: ViewButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onView}
            disabled={loading}
            className={cn(
              "h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg",
              className
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>View {title} Details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
