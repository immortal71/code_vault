import { CollectionCard } from '../collection-card'

export default function CollectionCardExample() {
  const mockCollection = {
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
  }

  return (
    <div className="p-4 max-w-md">
      <CollectionCard {...mockCollection} />
    </div>
  )
}