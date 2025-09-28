import { useState, useEffect } from "react"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Save, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"

interface SnippetEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (snippet: {
    title: string
    description: string
    code: string
    language: string
    tags: string[]
  }) => void
  snippet?: {
    id?: string
    title: string
    description: string
    code: string
    language: string
    tags: string[]
  }
}

const languages = [
  "typescript", "javascript", "python", "java", "csharp", "php", 
  "go", "rust", "cpp", "html", "css", "sql", "json", "yaml", "markdown"
]

export function SnippetEditor({ isOpen, onClose, onSave, snippet }: SnippetEditorProps) {
  const { theme } = useTheme()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("typescript")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title)
      setDescription(snippet.description)
      setCode(snippet.code)
      setLanguage(snippet.language)
      setTags(snippet.tags)
    } else {
      // Reset form for new snippet
      setTitle("")
      setDescription("")
      setCode("")
      setLanguage("typescript")
      setTags([])
    }
  }, [snippet, isOpen])

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  const handleSave = () => {
    if (!title.trim() || !code.trim()) return
    
    onSave?.({
      title: title.trim(),
      description: description.trim(),
      code: code.trim(),
      language,
      tags
    })
    
    console.log('Snippet saved:', { title, description, code, language, tags })
    onClose()
  }

  const handleAiGenerate = () => {
    // Simulate AI-generated description
    console.log('AI generate description triggered')
    setDescription(`Auto-generated description for ${language} code snippet`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle data-testid="text-editor-title">
            {snippet?.id ? 'Edit Snippet' : 'Create New Snippet'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Label>Code</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 border rounded-md overflow-hidden">
              <Editor
                height="100%"
                language={language}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>
          
          {/* Metadata Panel */}
          <div className="w-80 flex flex-col gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter snippet title..."
                data-testid="input-title"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="description">Description</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAiGenerate}
                  className="h-6 px-2"
                  data-testid="button-ai-generate"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this snippet does..."
                rows={3}
                data-testid="textarea-description"
              />
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags..."
                data-testid="input-tags"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`button-remove-tag-${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex-1" />
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1" 
                disabled={!title.trim() || !code.trim()}
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}