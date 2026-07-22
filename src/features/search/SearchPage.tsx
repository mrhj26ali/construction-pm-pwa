import { useState } from 'react'
import { useGlobalSearch } from './hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const { data, isLoading, isError, refetch } = useGlobalSearch(query)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Global Search</h1>
          <p className="text-sm text-gray-500">Search across projects, documents, requests, and more.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={!query || isLoading}
        >
          Search
        </Button>
      </div>

      <Card>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              refetch()
            }}
            className="flex items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-2"
          >
            <Search size={18} className="text-gray-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for projects, requests, documents, users..."
              className="border-0 p-0 focus:ring-0"
            />
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isError && (
          <Card>
            <CardContent>
              <p className="text-sm text-red-600">Unable to complete search. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {!query ? (
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Enter a query to search across your construction data.</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Searching...</p>
            </CardContent>
          </Card>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((result) => (
              <Card key={`${result.doctype}-${result.name}`}>
                <CardHeader>
                  <CardTitle className="text-sm text-brand-900">{result.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{result.description || 'No description available.'}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="rounded-full bg-surface-muted px-2 py-1">{result.doctype}</span>
                    <span className="rounded-full bg-surface-muted px-2 py-1">{result.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">No results found for "{query}".</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
