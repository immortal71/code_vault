import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

export function StatsCard({ title, value, description, icon: Icon, trend, onClick }: StatsCardProps) {
  return (
    <Card 
      data-testid={`card-stats-${title.toLowerCase().replace(' ', '-')}`}
      className={`transition-all duration-200 ${
        onClick 
          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' 
          : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
      aria-label={onClick ? `View ${title}` : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-stats-value-${title.toLowerCase().replace(' ', '-')}`}>
          {value}
        </div>
        {description && !trend && (
          <p className="text-xs text-muted-foreground" data-testid={`text-stats-description-${title.toLowerCase().replace(' ', '-')}`}>
            {description}
          </p>
        )}
        {trend && (
          <div className={`text-xs flex items-center gap-1 mt-1 font-medium ${
            trend.isPositive 
              ? 'text-green-600 dark:text-green-500' 
              : 'text-red-600 dark:text-red-500'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            )}
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}