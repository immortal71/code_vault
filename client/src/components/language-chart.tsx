import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts'
import { useState } from 'react'

interface LanguageData {
  name: string
  value: number
  color: string
}

interface LanguageChartProps {
  data: LanguageData[]
  onLanguageClick?: (language: string) => void
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

export function LanguageChart({ data, onLanguageClick }: LanguageChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const handleClick = (entry: LanguageData) => {
    onLanguageClick?.(entry.name)
    console.log('Filter by language:', entry.name)
  }

  const handleLegendClick = (entry: any) => {
    const language = data.find(d => d.name === entry.value)
    if (language) {
      handleClick(language)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1)
      return (
        <div
          style={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            padding: '8px 12px'
          }}
        >
          <p style={{ color: 'hsl(var(--foreground))', fontWeight: '600', marginBottom: '4px' }}>
            {payload[0].name}
          </p>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>
            {payload[0].value} snippets ({percentage}%)
          </p>
          <p style={{ color: 'hsl(var(--primary))', fontSize: '12px', marginTop: '4px' }}>
            Click to filter
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[300px]" data-testid="chart-languages">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
            onClick={(entry) => handleClick(entry as LanguageData)}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            onClick={handleLegendClick}
            formatter={(value) => (
              <span 
                style={{ 
                  color: 'hsl(var(--foreground))',
                  cursor: 'pointer'
                }}
              >
                {value}
              </span>
            )}
            wrapperStyle={{ cursor: 'pointer' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}