import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Filter, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterPanelProps {
  languages: Array<{ name: string; count: number }>
  tags: Array<{ name: string; count: number }>
  onFiltersChange?: (filters: {
    languages: string[]
    tags: string[]
    sortBy: string
    dateRange: string
  }) => void
}

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "name", label: "Name (A-Z)" },
  { value: "language", label: "Language" },
]

const dateRanges = [
  { value: "all", label: "All Time" },
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "year", label: "Last Year" },
]

export function FilterPanel({ languages, tags, onFiltersChange }: FilterPanelProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("recent")
  const [dateRange, setDateRange] = useState("all")

  const updateFilters = (updates: Partial<{
    languages: string[]
    tags: string[]
    sortBy: string
    dateRange: string
  }>) => {
    const newFilters = {
      languages: updates.languages ?? selectedLanguages,
      tags: updates.tags ?? selectedTags,
      sortBy: updates.sortBy ?? sortBy,
      dateRange: updates.dateRange ?? dateRange,
    }
    
    onFiltersChange?.(newFilters)
    console.log('Filters updated:', newFilters)
  }

  const handleLanguageToggle = (language: string, checked: boolean) => {
    const newLanguages = checked
      ? [...selectedLanguages, language]
      : selectedLanguages.filter(l => l !== language)
    
    setSelectedLanguages(newLanguages)
    updateFilters({ languages: newLanguages })
  }

  const handleTagToggle = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag)
    
    setSelectedTags(newTags)
    updateFilters({ tags: newTags })
  }

  const clearAllFilters = () => {
    setSelectedLanguages([])
    setSelectedTags([])
    setSortBy("recent")
    setDateRange("all")
    updateFilters({ languages: [], tags: [], sortBy: "recent", dateRange: "all" })
  }

  const hasActiveFilters = selectedLanguages.length > 0 || selectedTags.length > 0 || sortBy !== "recent" || dateRange !== "all"

  return (
    <Card className="w-80" data-testid="panel-filters">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2"
              data-testid="button-clear-filters"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort Options */}
        <div>
          <Label className="text-xs font-medium">Sort By</Label>
          <Select value={sortBy} onValueChange={(value) => { setSortBy(value); updateFilters({ sortBy: value }) }}>
            <SelectTrigger className="mt-2" data-testid="select-sort-by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Range */}
        <div>
          <Label className="text-xs font-medium flex items-center gap-2">
            <CalendarDays className="h-3 w-3" />
            Date Range
          </Label>
          <Select value={dateRange} onValueChange={(value) => { setDateRange(value); updateFilters({ dateRange: value }) }}>
            <SelectTrigger className="mt-2" data-testid="select-date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Languages */}
        <div>
          <Label className="text-xs font-medium">Languages</Label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
            {languages.map((language) => (
              <div key={language.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language.name}`}
                    checked={selectedLanguages.includes(language.name)}
                    onCheckedChange={(checked) => handleLanguageToggle(language.name, !!checked)}
                    data-testid={`checkbox-language-${language.name}`}
                  />
                  <Label htmlFor={`lang-${language.name}`} className="text-sm cursor-pointer">
                    {language.name}
                  </Label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {language.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div>
          <Label className="text-xs font-medium">Tags</Label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
            {tags.slice(0, 10).map((tag) => (
              <div key={tag.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.name}`}
                    checked={selectedTags.includes(tag.name)}
                    onCheckedChange={(checked) => handleTagToggle(tag.name, !!checked)}
                    data-testid={`checkbox-tag-${tag.name}`}
                  />
                  <Label htmlFor={`tag-${tag.name}`} className="text-sm cursor-pointer">
                    {tag.name}
                  </Label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {tag.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}