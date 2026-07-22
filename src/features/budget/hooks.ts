import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createBudgetRecord,
  listBudgetRecords,
  listProjects,
  listBudgetVariance,
  listProcurementForProject,
  createMaterialRequest,
} from './api'
import type {
  BudgetRecord,
  CreateBudgetPayload,
  ProjectReference,
  ProjectVarianceRecord,
  ProcurementRecord,
  CreateMaterialRequestPayload,
} from './types'

export function useBudgetRecords() {
  return useQuery<BudgetRecord[]>({ queryKey: ['budgetRecords'], queryFn: listBudgetRecords })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) => createBudgetRecord(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgetRecords'] }),
  })
}

export function useProjectsList() {
  return useQuery<ProjectReference[]>({ queryKey: ['projectsList'], queryFn: listProjects })
}

export function useBudgetVariance() {
  return useQuery<ProjectVarianceRecord[]>({ queryKey: ['budgetVariance'], queryFn: listBudgetVariance })
}

export function useProcurement(projectName?: string) {
  return useQuery<ProcurementRecord[]>({
    queryKey: ['procurement', projectName ?? 'all'],
    queryFn: () => listProcurementForProject(projectName),
  })
}

export function useCreateMaterialRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMaterialRequestPayload) => createMaterialRequest(payload),
    onSuccess: (_, payload) => queryClient.invalidateQueries({ queryKey: ['procurement', payload.project ?? 'all'] }),
  })
}
