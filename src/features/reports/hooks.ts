import { useQuery } from '@tanstack/react-query'
import { fetchProfitabilitySummary, fetchBudgetVariance, fetchRequestAging } from './api'
import type { ProfitabilitySummary, ProjectVarianceRecord, RequestAgingRecord } from './types'

export function useProfitabilitySummary() {
  return useQuery<ProfitabilitySummary>({ queryKey: ['reports', 'profitability'], queryFn: fetchProfitabilitySummary })
}

export function useBudgetVariance() {
  return useQuery<ProjectVarianceRecord[]>({ queryKey: ['reports', 'budgetVariance'], queryFn: fetchBudgetVariance })
}

export function useRequestAging() {
  return useQuery<RequestAgingRecord[]>({ queryKey: ['reports', 'requestAging'], queryFn: fetchRequestAging })
}
