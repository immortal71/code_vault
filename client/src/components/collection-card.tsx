import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BookOpen, Edit, MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    console.log('Collection clicked:', id)
  }

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all duration-200"
      onClick={handleClick}
      data-testid={`card-collection-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div 
            className="w-1 h-full absolute left-0 top-0 rounded-l-md"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 min-w-0 pl-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm truncate" data-testid={`text-collection-name-${id}`}>
                {name}
              </h3>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-collection-description-${id}`}>
                {description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                data-testid={`button-collection-menu-${id}`}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
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
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Snippets</span>
            <Badge variant="secondary" className="text-xs" data-testid={`text-snippet-count-${id}`}>
              {snippetCount}
            </Badge>
          </div>
          
          {previewSnippets.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Recent:</span>
              {previewSnippets.slice(0, 2).map((snippet, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-xs">
                    {snippet.language}
                  </Badge>
                  <span className="truncate text-muted-foreground">
                    {snippet.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}