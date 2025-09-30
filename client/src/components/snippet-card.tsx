import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Copy, Edit, Heart, MoreHorizontal, Trash2, Eye, Clock } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

interface SnippetCardProps {
  id: string
  title: string
  description?: string
  language: string
  tags: string[]
  code: string
  isFavorite?: boolean
  createdAt: string
  usageCount?: number
  lastUsed?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  onCopy?: (code: string) => void
  viewMode?: 'grid' | 'list'
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
  usageCount = 0,
  lastUsed,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
  viewMode = 'grid'
}: SnippetCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [favorite, setFavorite] = useState(isFavorite)
  const [isAnimating, setIsAnimating] = useState(false)
  const { toast } = useToast()

  const handleToggleFavorite = () => {
    setFavorite(!favorite)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
    onToggleFavorite?.(id)
    console.log('Toggle favorite:', id)
  }

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    navigator.clipboard.writeText(code)
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
      duration: 2000,
    })
    onCopy?.(code)
    console.log('Copied snippet:', id)
  }

  const getDaysAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  const codeLines = code.split('\n')
  const codePreview = codeLines.slice(0, 5).join('\n')
  const hasMoreLines = codeLines.length > 5

  return (
    <TooltipProvider>
      <Card 
        className="hover-elevate transition-all duration-200 relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`card-snippet-${id}`}
      >
        {/* Quick Copy Button - Always rendered for keyboard/touch accessibility */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-md"
                onClick={handleCopy}
                data-testid={`button-quick-copy-${id}`}
                aria-label="Copy code"
                tabIndex={0}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy code</p>
            </TooltipContent>
          </Tooltip>
        </div>

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
              
              {/* Usage Stats */}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Used {usageCount} times
                </span>
                {lastUsed && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getDaysAgo(lastUsed)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 transition-all ${
                      favorite ? 'text-red-500' : 'text-muted-foreground'
                    } ${isAnimating ? 'scale-125' : 'scale-100'}`}
                    onClick={handleToggleFavorite}
                    data-testid={`button-favorite-${id}`}
                    aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`h-3 w-3 transition-all ${favorite ? 'fill-current' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{favorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                </TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                    data-testid={`button-menu-${id}`}
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(id)} data-testid={`menu-edit-${id}`}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopy()} data-testid={`menu-copy-${id}`}>
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
          <div className="relative bg-muted rounded-md p-3 font-mono text-xs overflow-hidden">
            <pre className="whitespace-pre-wrap text-muted-foreground" data-testid={`text-code-preview-${id}`}>
              {codePreview}
            </pre>
            {hasMoreLines && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted to-transparent pointer-events-none" />
            )}
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
    </TooltipProvider>
  )
}