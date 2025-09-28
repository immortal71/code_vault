import { FilterPanel } from '../filter-panel'

export default function FilterPanelExample() {
  const mockLanguages = [
    { name: 'TypeScript', count: 15 },
    { name: 'JavaScript', count: 12 },
    { name: 'Python', count: 8 },
    { name: 'Go', count: 5 },
    { name: 'Rust', count: 3 }
  ]

  const mockTags = [
    { name: 'react', count: 18 },
    { name: 'hooks', count: 12 },
    { name: 'api', count: 10 },
    { name: 'utils', count: 8 },
    { name: 'async', count: 6 },
    { name: 'performance', count: 4 }
  ]

  return (
    <div className="p-4">
      <FilterPanel 
        languages={mockLanguages}
        tags={mockTags}
        onFiltersChange={(filters) => console.log('Filters:', filters)}
      />
    </div>
  )
}