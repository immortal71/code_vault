import { useState } from "react"
import { SnippetCard } from "@/components/snippet-card"
import { SnippetEditor } from "@/components/snippet-editor"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code2, Grid3X3, List, Plus, Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
        self.session = requests.Session()
    
    def get(self, endpoint: str, params: Optional[Dict] = None, retries: int = 3) -> Dict[Any, Any]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        for attempt in range(retries + 1):
            try:
                response = self.session.get(url, params=params, timeout=self.timeout)
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                if attempt == retries:
                    raise e
                time.sleep(2 ** attempt)`,
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
}

// Usage example:
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);`,
    isFavorite: false,
    createdAt: "2024-01-13T09:20:00Z"
  },
  {
    id: "4",
    title: "Go HTTP Middleware",
    description: "Simple logging middleware for HTTP requests in Go",
    language: "go",
    tags: ["go", "http", "middleware", "logging"],
    code: `package main

import (
    "log"
    "net/http"
    "time"
)

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Create a custom ResponseWriter to capture status code
        lw := &loggedResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
        
        next.ServeHTTP(lw, r)
        
        log.Printf("%s %s %d %v", r.Method, r.URL.Path, lw.statusCode, time.Since(start))
    })
}

type loggedResponseWriter struct {
    http.ResponseWriter
    statusCode int
}

func (lw *loggedResponseWriter) WriteHeader(code int) {
    lw.statusCode = code
    lw.ResponseWriter.WriteHeader(code)
}`,
    isFavorite: true,
    createdAt: "2024-01-12T14:20:00Z"
  }
]

export default function MySnippets() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<typeof mockSnippets[0] | undefined>()
  const [snippets, setSnippets] = useState(mockSnippets)

  const filteredSnippets = snippets.filter(snippet => 
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title)
      case "language":
        return a.language.localeCompare(b.language)
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handleCreateSnippet = () => {
    setEditingSnippet(undefined)
    setIsEditorOpen(true)
  }

  const handleEditSnippet = (id: string) => {
    const snippet = snippets.find(s => s.id === id)
    setEditingSnippet(snippet)
    setIsEditorOpen(true)
    console.log('Edit snippet:', id)
  }

  const handleDeleteSnippet = (id: string) => {
    setSnippets(snippets.filter(s => s.id !== id))
    console.log('Delete snippet:', id)
  }

  const handleToggleFavorite = (id: string) => {
    setSnippets(snippets.map(s => 
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    ))
    console.log('Toggle favorite:', id)
  }

  const handleSaveSnippet = (snippetData: any) => {
    if (editingSnippet) {
      // Update existing snippet
      setSnippets(snippets.map(s => 
        s.id === editingSnippet.id 
          ? { ...s, ...snippetData }
          : s
      ))
    } else {
      // Create new snippet
      const newSnippet = {
        id: Date.now().toString(),
        ...snippetData,
        isFavorite: false,
        createdAt: new Date().toISOString()
      }
      setSnippets([newSnippet, ...snippets])
    }
    console.log('Snippet saved:', snippetData)
  }

  return (
    <div className="space-y-6" data-testid="page-my-snippets">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Snippets</h1>
          <p className="text-muted-foreground">Manage and organize your code snippets</p>
        </div>
        <Button onClick={handleCreateSnippet} data-testid="button-create-snippet">
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-snippets"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32" data-testid="select-sort-snippets">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="language">Language</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
              data-testid="button-view-grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {sortedSnippets.length === 0 ? (
        <EmptyState
          icon={Code2}
          title={searchQuery ? "No snippets found" : "No snippets yet"}
          description={
            searchQuery 
              ? "Try adjusting your search terms or create a new snippet."
              : "Create your first code snippet to get started organizing your code."
          }
          actionLabel="Create First Snippet"
          onAction={handleCreateSnippet}
        />
      ) : (
        <div 
          className={
            viewMode === "grid" 
              ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
          data-testid="snippets-container"
        >
          {sortedSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              {...snippet}
              onEdit={handleEditSnippet}
              onDelete={handleDeleteSnippet}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Snippet Editor Modal */}
      <SnippetEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveSnippet}
        snippet={editingSnippet}
      />
    </div>
  )
}