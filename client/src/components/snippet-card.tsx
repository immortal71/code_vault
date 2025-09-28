import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Copy, Edit, Heart, MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SnippetCardProps {
  id: string
  title: string
  description?: string
  language: string
  tags: string[]
  code: string
  isFavorite?: boolean
  createdAt: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  onCopy?: (code: string) => void
}

const languageColors: Record<string, string> = {
  typescript: "bg-blue-500",
  javascript: "bg-yellow-500",
  python: "bg-green-500",
  java: "bg-orange-500",
  csharp: "bg-purple-500",
  php: "bg-indigo-500",
  go: "bg-cyan-500",
  rust: "bg-red-500",
  cpp: "bg-blue-600",
  html: "bg-orange-400",
  css: "bg-blue-400",
  sql: "bg-teal-500",
}

export function SnippetCard({
  id,
  title,
  description,
  language,
  tags,
  code,
  isFavorite = false,
  createdAt,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy
}: SnippetCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [favorite, setFavorite] = useState(isFavorite)

  const handleToggleFavorite = () => {
    setFavorite(!favorite)
    onToggleFavorite?.(id)
    console.log('Toggle favorite:', id)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    onCopy?.(code)
    console.log('Copied snippet:', id)
  }

  const codePreview = code.split('\n').slice(0, 4).join('\n')

  return (
    <Card 
      className="hover-elevate transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-snippet-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate" data-testid={`text-snippet-title-${id}`}>
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1" data-testid={`text-snippet-description-${id}`}>
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${favorite ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={handleToggleFavorite}
              data-testid={`button-favorite-${id}`}
            >
              <Heart className={`h-3 w-3 ${favorite ? 'fill-current' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  data-testid={`button-menu-${id}`}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(id)} data-testid={`menu-edit-${id}`}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy} data-testid={`menu-copy-${id}`}>
                  <Copy className="h-3 w-3 mr-2" />
                  Copy Code
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(id)} 
                  className="text-destructive"
                  data-testid={`menu-delete-${id}`}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge 
            className={`text-xs ${languageColors[language.toLowerCase()] || 'bg-gray-500'} text-white`}
            data-testid={`badge-language-${id}`}
          >
            {language}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid={`text-date-${id}`}>
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="bg-muted rounded-md p-3 font-mono text-xs overflow-hidden">
          <pre className="whitespace-pre-wrap text-muted-foreground" data-testid={`text-code-preview-${id}`}>
            {codePreview}
            {code.split('\n').length > 4 && '...'}
          </pre>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs" data-testid={`tag-${tag}-${id}`}>
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}