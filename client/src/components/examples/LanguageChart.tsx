import { LanguageChart } from '../language-chart'

export default function LanguageChartExample() {
  const mockData = [
    { name: 'TypeScript', value: 15, color: '#3178C6' },
    { name: 'JavaScript', value: 12, color: '#F7DF1E' },
    { name: 'Python', value: 8, color: '#3776AB' },
    { name: 'Go', value: 5, color: '#00ADD8' },
    { name: 'Rust', value: 3, color: '#CE422B' },
    { name: 'Java', value: 4, color: '#ED8B00' }
  ]

  return (
    <div className="p-4 max-w-md">
      <LanguageChart data={mockData} />
    </div>
  )
}