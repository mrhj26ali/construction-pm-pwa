import { useQuery } from '@tanstack/react-query'
import { searchGlobal } from './api'
import type { GlobalSearchResult } from './types'

export function useGlobalSearch(query: string) {
  return useQuery<GlobalSearchResult[]>({
    queryKey: ['search', query],
    queryFn: () => searchGlobal(query),
    enabled: Boolean(query),
    staleTime: 5 * 60 * 1000,
  })
}
