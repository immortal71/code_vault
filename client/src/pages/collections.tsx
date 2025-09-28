import { useState } from "react"
import { CollectionCard } from "@/components/collection-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Plus, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// todo: remove mock functionality
const mockCollections = [
  {
    id: "1",
    name: "React Hooks",
    description: "Collection of useful React hooks for common patterns and functionality",
    color: "#3B82F6",
    snippetCount: 12,
    previewSnippets: [
      { title: "useLocalStorage", language: "typescript" },
      { title: "useDebounce", language: "typescript" },
      { title: "useFetch", language: "javascript" }
    ]
  },
  {
    id: "2",
    name: "Python Utilities",
    description: "Handy Python functions and classes for common development tasks",
    color: "#10B981",
    snippetCount: 8,
    previewSnippets: [
      { title: "API Client", language: "python" },
      { title: "Database Helper", language: "python" }
    ]
  },
  {
    id: "3",
    name: "Data Structures",
    description: "Implementation of common data structures in various languages",
    color: "#F59E0B",
    snippetCount: 15,
    previewSnippets: [
      { title: "Binary Tree", language: "java" },
      { title: "Linked List", language: "cpp" },
      { title: "Hash Table", language: "python" }
    ]
  },
  {
    id: "4",
    name: "API Patterns",
    description: "Common patterns for building REST APIs and handling HTTP requests",
    color: "#EF4444",
    snippetCount: 6,
    previewSnippets: [
      { title: "Error Handler", language: "typescript" },
      { title: "Auth Middleware", language: "javascript" }
    ]
  }
]

export default function Collections() {
  const [searchQuery, setSearchQuery] = useState("")
  const [collections, setCollections] = useState(mockCollections)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [newCollectionColor, setNewCollectionColor] = useState("#3B82F6")

  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return

    const newCollection = {
      id: Date.now().toString(),
      name: newCollectionName.trim(),
      description: newCollectionDescription.trim(),
      color: newCollectionColor,
      snippetCount: 0,
      previewSnippets: []
    }

    setCollections([newCollection, ...collections])
    setNewCollectionName("")
    setNewCollectionDescription("")
    setNewCollectionColor("#3B82F6")
    setIsCreateDialogOpen(false)
    
    console.log('Collection created:', newCollection)
  }

  const handleEditCollection = (id: string) => {
    console.log('Edit collection:', id)
  }

  const handleDeleteCollection = (id: string) => {
    setCollections(collections.filter(c => c.id !== id))
    console.log('Delete collection:', id)
  }

  const handleCollectionClick = (id: string) => {
    console.log('Collection clicked:', id)
    // todo: Navigate to collection detail view
  }

  const colorOptions = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
  ]

  return (
    <div className="space-y-6" data-testid="page-collections">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Collections</h1>
          <p className="text-muted-foreground">Organize your snippets into collections</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-collection">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Enter collection name..."
                  data-testid="input-collection-name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  rows={3}
                  data-testid="textarea-collection-description"
                />
              </div>
              
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCollectionColor(color)}
                      className={`w-8 h-8 rounded-md border-2 ${
                        newCollectionColor === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      data-testid={`button-color-${color}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                  data-testid="button-cancel-collection"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCollection}
                  className="flex-1"
                  disabled={!newCollectionName.trim()}
                  data-testid="button-save-collection"
                >
                  Create Collection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-collections"
        />
      </div>

      {/* Content */}
      {filteredCollections.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={searchQuery ? "No collections found" : "No collections yet"}
          description={
            searchQuery 
              ? "Try adjusting your search terms or create a new collection."
              : "Create your first collection to start organizing your snippets by topic or project."
          }
          actionLabel="Create First Collection"
          onAction={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="collections-grid">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              {...collection}
              onEdit={handleEditCollection}
              onDelete={handleDeleteCollection}
              onClick={handleCollectionClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}