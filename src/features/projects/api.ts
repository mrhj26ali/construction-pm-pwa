import { apiRequest } from '@/lib/apiClient'
import type { CreateProjectPayload, ProjectRecord } from './types'

export async function listProjects(): Promise<ProjectRecord[]> {
  const res = await apiRequest<{ data: ProjectRecord[] }>(
    '/resource/Project?fields=["name","project_name","status","project_type","priority","expected_start_date","expected_end_date","percent_complete"]&limit_page_length=0'
  )
  return res.data
}

export async function createProject(payload: CreateProjectPayload): Promise<ProjectRecord> {
  const res = await apiRequest<{ data: ProjectRecord }>('/resource/Project', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}
