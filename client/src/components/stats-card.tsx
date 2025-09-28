import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card data-testid={`card-stats-${title.toLowerCase().replace(' ', '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-stats-value-${title.toLowerCase().replace(' ', '-')}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground" data-testid={`text-stats-description-${title.toLowerCase().replace(' ', '-')}`}>
            {description}
          </p>
        )}
        {trend && (
          <div className={`text-xs flex items-center gap-1 mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}