import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { FilterPanel } from "@/components/filter-panel"
import { SnippetCard } from "@/components/snippet-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"

// todo: remove mock functionality
const mockSnippets = [
  {
    id: "1",
    title: "React useLocalStorage Hook",
    description: "A custom hook for persisting state in localStorage with TypeScript support",
    language: "typescript",
    tags: ["react", "hooks", "localStorage"],
    code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
    isFavorite: true,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2", 
    title: "Python API Client",
    description: "Simple HTTP client with retry logic and error handling",
    language: "python",
    tags: ["python", "api", "http", "requests"],
    code: `import requests
import time
from typing import Optional, Dict, Any

class APIClient:
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()`,
    isFavorite: false,
    createdAt: "2024-01-14T15:45:00Z"
  },
  {
    id: "3",
    title: "JavaScript Debounce Function", 
    description: "Utility function to debounce rapid function calls",
    language: "javascript",
    tags: ["javascript", "utils", "performance", "debounce"],
    code: `function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}`,
    isFavorite: false,
    createdAt: "2024-01-13T09:20:00Z"
  }
]

// todo: remove mock functionality
const mockLanguages = [
  { name: 'TypeScript', count: 15 },
  { name: 'JavaScript', count: 12 },
  { name: 'Python', count: 8 },
  { name: 'Go', count: 5 },
  { name: 'Rust', count: 3 },
  { name: 'Java', count: 4 }
]

// todo: remove mock functionality
const mockTags = [
  { name: 'react', count: 18 },
  { name: 'hooks', count: 12 },
  { name: 'api', count: 10 },
  { name: 'utils', count: 8 },
  { name: 'async', count: 6 },
  { name: 'performance', count: 4 },
  { name: 'typescript', count: 15 },
  { name: 'javascript', count: 12 },
  { name: 'python', count: 8 }
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    languages: [] as string[],
    tags: [] as string[],
    sortBy: "recent",
    dateRange: "all"
  })
  const [showFilters, setShowFilters] = useState(false)
  const [recentSearches] = useState([
    "react hooks",
    "python api",
    "javascript utils",
    "typescript interfaces"
  ])

  // Filter snippets based on search query and filters
  const filteredSnippets = mockSnippets.filter(snippet => {
    // Text search
    const matchesSearch = !searchQuery || 
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    // Language filter
    const matchesLanguage = filters.languages.length === 0 || 
      filters.languages.includes(snippet.language)

    // Tag filter
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => snippet.tags.includes(tag))

    return matchesSearch && matchesLanguage && matchesTags
  })

  // Sort results
  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    switch (filters.sortBy) {
      case "name":
        return a.title.localeCompare(b.title)
      case "language":
        return a.language.localeCompare(b.language)
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log('Search triggered:', query)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    console.log('Filters changed:', newFilters)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setFilters({
      languages: [],
      tags: [],
      sortBy: "recent", 
      dateRange: "all"
    })
  }

  const hasActiveFilters = filters.languages.length > 0 || filters.tags.length > 0 || 
    filters.sortBy !== "recent" || filters.dateRange !== "all"

  return (
    <div className="space-y-6" data-testid="page-search">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">Search Snippets</h1>
        <p className="text-muted-foreground">Find code snippets by content, tags, or language</p>
      </div>

      {/* Search Bar */}
      <div className="space-y-4">
        <SearchBar 
          onSearch={handleSearch}
          className="max-w-2xl mx-0"
        />
        
        {/* Filter Toggle and Active Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
            data-testid="button-toggle-filters"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {filters.languages.length + filters.tags.length}
              </Badge>
            )}
          </Button>

          {/* Active Filter Tags */}
          {filters.languages.map(lang => (
            <Badge key={lang} variant="secondary" className="gap-1">
              {lang}
              <button 
                onClick={() => handleFiltersChange({
                  ...filters,
                  languages: filters.languages.filter(l => l !== lang)
                })}
                className="hover:text-destructive"
                data-testid={`remove-language-filter-${lang}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              #{tag}
              <button 
                onClick={() => handleFiltersChange({
                  ...filters,
                  tags: filters.tags.filter(t => t !== tag)
                })}
                className="hover:text-destructive"
                data-testid={`remove-tag-filter-${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearSearch}
              data-testid="button-clear-all-filters"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Recent searches:</p>
            <div className="flex gap-2 flex-wrap">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(search)}
                  data-testid={`button-recent-search-${index}`}
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            languages={mockLanguages}
            tags={mockTags}
            onFiltersChange={handleFiltersChange}
          />
        )}

        {/* Results */}
        <div className="flex-1">
          {searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {sortedSnippets.length} result{sortedSnippets.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            </div>
          )}

          {sortedSnippets.length === 0 && searchQuery ? (
            <EmptyState
              icon={Search}
              title="No snippets found"
              description="Try adjusting your search terms or filters to find what you're looking for."
              actionLabel="Clear Search"
              onAction={clearSearch}
            />
          ) : sortedSnippets.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Start searching"
              description="Enter a search term to find code snippets by title, description, content, or tags."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="search-results">
              {sortedSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  {...snippet}
                  onEdit={(id) => console.log('Edit snippet:', id)}
                  onDelete={(id) => console.log('Delete snippet:', id)}
                  onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}