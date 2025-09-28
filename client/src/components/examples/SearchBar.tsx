import { SearchBar } from '../search-bar'

export default function SearchBarExample() {
  return (
    <div className="p-4 w-full max-w-2xl">
      <SearchBar onSearch={(query) => console.log('Search:', query)} />
    </div>
  )
}