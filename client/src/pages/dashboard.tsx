import { useState } from "react"
import { useLocation } from "wouter"
import { StatsCard } from "@/components/stats-card"
import { LanguageChart } from "@/components/language-chart"
import { SnippetCard } from "@/components/snippet-card"
import { EmptyState } from "@/components/empty-state"
import { Code2, BookOpen, Star, TrendingUp, Plus, Copy, ExternalLink, Edit, Clock } from "lucide-react"
import { SiReact, SiPython, SiJavascript, SiTypescript, SiGo, SiRust, SiCplusplus, SiPhp, SiSharp, SiHtml5, SiCss3 } from "react-icons/si"
import { useToast } from "@/hooks/use-toast"
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

const languageColors: Record<string, string> = {
  typescript: "#3178C6",
  javascript: "#F7DF1E",
  python: "#3776AB",
  java: "#ED8B00",
  go: "#00ADD8",
  rust: "#CE422B"
}

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState<'recent' | 'favorites'>('recent')
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const [hoveredSnippet, setHoveredSnippet] = useState<string | null>(null)

  const recentSnippets = mockSnippets.slice(0, 3)
  const favoriteSnippets = mockSnippets.filter(s => s.isFavorite)

  const handleCreateSnippet = () => {
    console.log('Create new snippet clicked')
  }

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
    })
  }

  const getDaysAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  const getLanguageIcon = (language: string) => {
    const lang = language.toLowerCase()
    const iconProps = { className: "h-5 w-5", style: { flexShrink: 0 } }
    
    switch (lang) {
      case 'react':
      case 'jsx':
        return <SiReact {...iconProps} color="#61DAFB" />
      case 'typescript':
      case 'ts':
      case 'tsx':
        return <SiTypescript {...iconProps} color="#3178C6" />
      case 'javascript':
      case 'js':
        return <SiJavascript {...iconProps} color="#F7DF1E" />
      case 'python':
      case 'py':
        return <SiPython {...iconProps} color="#3776AB" />
      case 'go':
      case 'golang':
        return <SiGo {...iconProps} color="#00ADD8" />
      case 'java':
        return <Code2 {...iconProps} className="h-5 w-5" style={{ color: '#ED8B00' }} />
      case 'rust':
      case 'rs':
        return <SiRust {...iconProps} color="#CE422B" />
      case 'cpp':
      case 'c++':
        return <SiCplusplus {...iconProps} color="#00599C" />
      case 'php':
        return <SiPhp {...iconProps} color="#777BB4" />
      case 'csharp':
      case 'c#':
        return <SiSharp {...iconProps} color="#239120" />
      case 'html':
        return <SiHtml5 {...iconProps} color="#E34F26" />
      case 'css':
        return <SiCss3 {...iconProps} color="#1572B6" />
      default:
        return <Code2 {...iconProps} className="h-5 w-5 text-muted-foreground" />
    }
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
          icon={Code2}
          trend={{ value: 12, isPositive: true }}
          onClick={() => setLocation('/snippets')}
        />
        <StatsCard
          title="Collections"
          value={5}
          description="Organized groups"
          icon={BookOpen}
          onClick={() => setLocation('/collections')}
        />
        <StatsCard
          title="Favorites"
          value={favoriteSnippets.length}
          description="Most used snippets"
          icon={Star}
          onClick={() => setLocation('/snippets')}
        />
        <StatsCard
          title="Languages"
          value={mockLanguageData.length}
          description="Different technologies"
          icon={TrendingUp}
          onClick={() => setLocation('/snippets')}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageChart 
              data={mockLanguageData}
              onLanguageClick={(language) => {
                console.log('Navigate to snippets filtered by:', language)
                setLocation('/snippets')
              }}
            />
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
                <div 
                  key={snippet.id} 
                  className="relative group rounded-md border border-l-4 hover-elevate transition-all duration-200 cursor-pointer"
                  style={{ borderLeftColor: languageColors[snippet.language.toLowerCase()] || '#888' }}
                  onMouseEnter={() => setHoveredSnippet(snippet.id)}
                  onMouseLeave={() => setHoveredSnippet(null)}
                  onClick={() => setLocation('/snippets')}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getLanguageIcon(snippet.language)}
                          <p className="text-sm font-medium truncate">{snippet.title}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{snippet.language}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getDaysAgo(snippet.createdAt)}
                          </span>
                        </div>
                      </div>
                      {hoveredSnippet === snippet.id && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleCopyCode(snippet.code, e)}
                            aria-label="Copy code"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); setLocation('/snippets') }}
                            aria-label="Open snippet"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); console.log('Edit:', snippet.id) }}
                            aria-label="Edit snippet"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="bg-muted/50 rounded-sm p-2 font-mono text-xs overflow-hidden">
                      <pre className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                        {snippet.code.split('\n').slice(0, 3).join('\n')}
                      </pre>
                    </div>
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
                <div 
                  key={snippet.id} 
                  className="relative group rounded-md border border-l-4 hover-elevate transition-all duration-200 cursor-pointer"
                  style={{ borderLeftColor: languageColors[snippet.language.toLowerCase()] || '#888' }}
                  onMouseEnter={() => setHoveredSnippet(snippet.id)}
                  onMouseLeave={() => setHoveredSnippet(null)}
                  onClick={() => setLocation('/snippets')}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getLanguageIcon(snippet.language)}
                          <p className="text-sm font-medium truncate">{snippet.title}</p>
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{snippet.language}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getDaysAgo(snippet.createdAt)}
                          </span>
                        </div>
                      </div>
                      {hoveredSnippet === snippet.id && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleCopyCode(snippet.code, e)}
                            aria-label="Copy code"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); setLocation('/snippets') }}
                            aria-label="Open snippet"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); console.log('Edit:', snippet.id) }}
                            aria-label="Edit snippet"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="bg-muted/50 rounded-sm p-2 font-mono text-xs overflow-hidden">
                      <pre className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                        {snippet.code.split('\n').slice(0, 3).join('\n')}
                      </pre>
                    </div>
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