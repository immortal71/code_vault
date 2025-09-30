import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in-50 duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 animate-in zoom-in-50 duration-200">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium mb-2 animate-in slide-in-from-bottom-4 duration-200" data-testid="text-empty-title">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md animate-in slide-in-from-bottom-4 duration-300" data-testid="text-empty-description">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          data-testid="button-empty-action"
          className="animate-in slide-in-from-bottom-4 duration-300"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}