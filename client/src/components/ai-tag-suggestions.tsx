import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyzeCode } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface AiTagSuggestionsProps {
  code: string;
  language: string;
  onTagsSelected: (tags: string[]) => void;
  onDescriptionGenerated?: (description: string) => void;
  onFrameworkDetected?: (framework: string | null) => void;
  onComplexityDetected?: (complexity: string) => void;
}

export function AiTagSuggestions({
  code,
  language,
  onTagsSelected,
  onDescriptionGenerated,
  onFrameworkDetected,
  onComplexityDetected,
}: AiTagSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to analyze",
        description: "Please enter some code first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeCode(code, language);
      setSuggestions(analysis.tags);
      
      if (analysis.description && onDescriptionGenerated) {
        onDescriptionGenerated(analysis.description);
      }
      
      if (analysis.framework && onFrameworkDetected) {
        onFrameworkDetected(analysis.framework);
      }
      
      if (analysis.complexity && onComplexityDetected) {
        onComplexityDetected(analysis.complexity);
      }
      
      toast({
        title: "AI analysis complete!",
        description: `Found ${analysis.tags.length} suggested tags`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTag = (tag: string) => {
    onTagsSelected([tag]);
    setSuggestions(suggestions.filter(t => t !== tag));
  };

  const handleSelectAll = () => {
    onTagsSelected(suggestions);
    setSuggestions([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">AI Tag Suggestions</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={loading || !code.trim()}
          data-testid="button-ai-analyze"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              Analyze Code
            </>
          )}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Suggested tags:</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-6 text-xs"
              data-testid="button-add-all-tags"
            >
              Add all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                onClick={() => handleSelectTag(tag)}
                data-testid={`badge-suggestion-${tag}`}
              >
                {tag}
                <span className="ml-1 text-xs" aria-hidden="true">+</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
