import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createProject, listProjects, listProjectTemplates } from './api'
import type { CreateProjectPayload, ProjectRecord, ProjectTemplateRecord } from './types'

export function useProjects() {
  return useQuery<ProjectRecord[]>({ queryKey: ['projects'], queryFn: listProjects })
}

export function useProjectTemplates() {
  return useQuery<ProjectTemplateRecord[]>({ queryKey: ['projectTemplates'], queryFn: listProjectTemplates })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
