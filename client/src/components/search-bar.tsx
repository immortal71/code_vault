import { Search, Command, X, Clock, Code2, BookOpen, Hash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  showDropdown?: boolean
}

interface SearchSuggestion {
  type: 'snippet' | 'collection' | 'tag'
  title: string
  subtitle?: string
  id: string
}

const mockSuggestions: SearchSuggestion[] = [
  { type: 'snippet', title: 'React useLocalStorage Hook', subtitle: 'TypeScript', id: '1' },
  { type: 'snippet', title: 'Python API Client', subtitle: 'Python', id: '2' },
  { type: 'collection', title: 'React Hooks', subtitle: '12 snippets', id: 'c1' },
  { type: 'tag', title: 'api', id: 't1' },
  { type: 'tag', title: 'hooks', id: 't2' },
]

const recentSearches = ['react hooks', 'python api', 'javascript utils']

export function SearchBar({ 
  placeholder = "Search snippets... ⌘K", 
  onSearch,
  className = "",
  showDropdown = true
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredSuggestions = searchQuery 
    ? mockSuggestions.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
    setIsOpen(true)
  }

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.title)
    onSearch?.(suggestion.title)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleSelectRecent = (search: string) => {
    setSearchQuery(search)
    onSearch?.(search)
    setIsOpen(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    onSearch?.("")
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getIcon = (type: string) => {
    switch (type) {
      case 'snippet': return Code2
      case 'collection': return BookOpen
      case 'tag': return Hash
      default: return Search
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" aria-hidden="true" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { setIsFocused(true); setIsOpen(true) }}
          onBlur={() => setIsFocused(false)}
          className={`pl-9 pr-20 h-11 transition-all duration-200 ${
            isFocused 
              ? 'ring-2 ring-primary shadow-lg' 
              : 'shadow-sm hover:shadow-md'
          }`}
          data-testid="input-search"
          aria-label="Search snippets"
          aria-expanded={isOpen}
          aria-controls="search-dropdown"
          aria-autocomplete="list"
          role="combobox"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-14 top-1/2 -translate-y-1/2 h-6 w-6 z-10"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground font-medium border border-border">
          <Command className="h-3 w-3" />
          <span>K</span>
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && isOpen && (
        <div 
          ref={dropdownRef}
          id="search-dropdown"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          data-testid="search-dropdown"
        >
          {!searchQuery && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => setRecentSearches([])}
                >
                  Clear
                </Button>
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectRecent(search)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
                  data-testid={`recent-search-${idx}`}
                  role="option"
                  aria-selected="false"
                >
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}

          {searchQuery && filteredSuggestions.length > 0 && (
            <>
              {['snippet', 'collection', 'tag'].map((type) => {
                const items = filteredSuggestions.filter(s => s.type === type)
                if (items.length === 0) return null

                return (
                  <div key={type} className="p-2">
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground capitalize">
                      {type === 'snippet' ? 'Snippets' : type === 'collection' ? 'Collections' : 'Tags'}
                    </div>
                    {items.map((suggestion) => {
                      const Icon = getIcon(suggestion.type)
                      return (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors flex items-center gap-3"
                          data-testid={`suggestion-${suggestion.id}`}
                          role="option"
                          aria-selected="false"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{suggestion.title}</p>
                            {suggestion.subtitle && (
                              <p className="text-xs text-muted-foreground truncate">{suggestion.subtitle}</p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </>
          )}

          {searchQuery && filteredSuggestions.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">No results found</p>
              <p className="text-xs text-muted-foreground">
                Try different keywords or create a new snippet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}