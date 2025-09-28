import { StatsCard } from '../stats-card'
import { Code2 } from 'lucide-react'

export default function StatsCardExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
      <StatsCard
        title="Total Snippets"
        value={47}
        description="↗ 12% from last month"
        icon={Code2}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Languages"
        value={8}
        description="TypeScript, JavaScript, Python..."
      />
    </div>
  )
}