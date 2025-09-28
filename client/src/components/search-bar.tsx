import { Search, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export function SearchBar({ 
  placeholder = "Search snippets by description, tags, or code content...", 
  onSearch,
  className = ""
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
    console.log('Search triggered:', value)
  }

  return (
    <div className={`relative max-w-md mx-auto ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9 pr-16"
        data-testid="input-search"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
        <Command className="h-3 w-3" />
        <span>K</span>
      </div>
    </div>
  )
}