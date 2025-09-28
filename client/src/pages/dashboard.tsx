import { useState } from "react"
import { StatsCard } from "@/components/stats-card"
import { LanguageChart } from "@/components/language-chart"
import { SnippetCard } from "@/components/snippet-card"
import { EmptyState } from "@/components/empty-state"
import { Code2, BookOpen, Star, TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  }
]

// todo: remove mock functionality
const mockLanguageData = [
  { name: 'TypeScript', value: 15, color: '#3178C6' },
  { name: 'JavaScript', value: 12, color: '#F7DF1E' },
  { name: 'Python', value: 8, color: '#3776AB' },
  { name: 'Go', value: 5, color: '#00ADD8' },
  { name: 'Rust', value: 3, color: '#CE422B' },
  { name: 'Java', value: 4, color: '#ED8B00' }
]

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState<'recent' | 'favorites'>('recent')

  const recentSnippets = mockSnippets.slice(0, 3)
  const favoriteSnippets = mockSnippets.filter(s => s.isFavorite)

  const handleCreateSnippet = () => {
    console.log('Create new snippet clicked')
  }

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your code snippets and activity</p>
        </div>
        <Button onClick={handleCreateSnippet} data-testid="button-create-snippet">
          <Plus className="h-4 w-4 mr-2" />
          Create Snippet
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Snippets"
          value={mockSnippets.length}
          description="↗ 12% from last month"
          icon={Code2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Collections"
          value={5}
          description="Organized groups"
          icon={BookOpen}
        />
        <StatsCard
          title="Favorites"
          value={favoriteSnippets.length}
          description="Most used snippets"
          icon={Star}
        />
        <StatsCard
          title="Languages"
          value={mockLanguageData.length}
          description="Different technologies"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageChart data={mockLanguageData} />
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Access</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={selectedTab === 'recent' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTab('recent')}
                  data-testid="button-tab-recent"
                >
                  Recent
                </Button>
                <Button
                  variant={selectedTab === 'favorites' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTab('favorites')}
                  data-testid="button-tab-favorites"
                >
                  Favorites
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedTab === 'recent' && recentSnippets.map((snippet) => (
                <div key={snippet.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{snippet.title}</p>
                    <p className="text-xs text-muted-foreground">{snippet.language}</p>
                  </div>
                </div>
              ))}
              
              {selectedTab === 'favorites' && favoriteSnippets.length === 0 && (
                <EmptyState
                  icon={Star}
                  title="No favorites yet"
                  description="Star snippets to see them here"
                />
              )}
              
              {selectedTab === 'favorites' && favoriteSnippets.map((snippet) => (
                <div key={snippet.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{snippet.title}</p>
                    <p className="text-xs text-muted-foreground">{snippet.language}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}