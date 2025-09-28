import { SnippetCard } from '../snippet-card'

export default function SnippetCardExample() {
  const mockSnippet = {
    id: "1",
    title: "React Hook for API Calls",
    description: "A custom hook that handles loading states, error handling, and data fetching with automatic retries.",
    language: "typescript",
    tags: ["react", "hooks", "api", "typescript"],
    code: `import { useState, useEffect } from 'react';

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}`,
    isFavorite: true,
    createdAt: "2024-01-15T10:30:00Z"
  }

  return (
    <div className="p-4 max-w-md">
      <SnippetCard {...mockSnippet} />
    </div>
  )
}