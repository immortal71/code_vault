import { EmptyState } from '../empty-state'
import { Code2 } from 'lucide-react'

export default function EmptyStateExample() {
  return (
    <div className="p-4">
      <EmptyState
        icon={Code2}
        title="No snippets found"
        description="You haven't created any code snippets yet. Start by creating your first snippet to organize your code."
        actionLabel="Create First Snippet"
        onAction={() => console.log('Create snippet clicked')}
      />
    </div>
  )
}