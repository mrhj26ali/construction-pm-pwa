import { useQuery } from '@tanstack/react-query'
import { fetchDashboardSummary } from './api'
import type { DashboardSummary } from './types'

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60 * 1000,
  })
}
