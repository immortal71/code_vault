import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BookOpen, Edit, MoreHorizontal, Trash2, Code2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CollectionCardProps {
  id: string
  name: string
  description?: string
  color: string
  snippetCount: number
  previewSnippets?: Array<{
    title: string
    language: string
  }>
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

export function CollectionCard({
  id,
  name,
  description,
  color,
  snippetCount,
  previewSnippets = [],
  onEdit,
  onDelete,
  onClick
}: CollectionCardProps) {
  
  const handleClick = () => {
    onClick?.(id)
  }

  const languageColors: Record<string, string> = {
    typescript: "bg-blue-500",
    javascript: "bg-yellow-500",
    python: "bg-green-500",
    java: "bg-red-500",
    cpp: "bg-purple-500",
    go: "bg-cyan-500",
  }

  return (
    <TooltipProvider>
      <Card 
        className="hover-elevate cursor-pointer transition-all duration-200 relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        onClick={handleClick}
        data-testid={`card-collection-${id}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        aria-label={`Collection ${name}, ${snippetCount} snippets`}
      >
        {/* Color accent border - more prominent */}
        <div 
          className="w-1.5 h-full absolute left-0 top-0 rounded-l-md transition-all duration-200 group-hover:w-2"
          style={{ backgroundColor: color }}
        />
        
        {/* Subtle color glow on hover */}
        <div 
          className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-50 transition-opacity duration-200"
          style={{ 
            background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`
          }}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 pl-3">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="p-1.5 rounded-md transition-colors duration-200"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <BookOpen 
                    className="h-4 w-4" 
                    style={{ color: color }}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-medium text-sm truncate" data-testid={`text-collection-name-${id}`}>
                  {name}
                </h3>
              </div>
              {description && (
                <p className="text-xs text-muted-foreground line-clamp-2 pl-8" data-testid={`text-collection-description-${id}`}>
                  {description}
                </p>
              )}
            </div>
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      data-testid={`button-collection-menu-${id}`}
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More options</p>
                </TooltipContent>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(id) }} data-testid={`menu-edit-collection-${id}`}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete?.(id) }} 
                    className="text-destructive"
                    data-testid={`menu-delete-collection-${id}`}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </div>
        </CardHeader>
      
      <CardContent className="pt-0 pl-3">
        <div className="space-y-3">
          {/* Snippet count with icon */}
          <div className="flex items-center gap-2 pl-8">
            <Code2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">
              {snippetCount} {snippetCount === 1 ? 'snippet' : 'snippets'}
            </span>
          </div>
          
          {/* Preview snippets with thumbnail-like cards */}
          {previewSnippets.length > 0 && (
            <div className="space-y-1.5 pl-8">
              <span className="text-xs font-medium text-muted-foreground">Recent snippets:</span>
              <div className="space-y-1">
                {previewSnippets.slice(0, 3).map((snippet, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 p-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Badge 
                      className={`text-xs ${
                        languageColors[snippet.language.toLowerCase()] || 'bg-gray-500'
                      } text-white`}
                    >
                      {snippet.language}
                    </Badge>
                    <span className="truncate text-xs text-muted-foreground flex-1">
                      {snippet.title}
                    </span>
                  </div>
                ))}
              </div>
              {previewSnippets.length > 3 && (
                <p className="text-xs text-muted-foreground pl-1.5">
                  +{previewSnippets.length - 3} more
                </p>
              )}
            </div>
          )}

          {/* Empty state for collections with no snippets */}
          {snippetCount === 0 && (
            <div className="pl-8 text-xs text-muted-foreground italic">
              No snippets yet
            </div>
          )}
        </div>
      </CardContent>
      </Card>
    </TooltipProvider>
  )
}