import { apiRequest } from '@/lib/apiClient'
import type { CreateTaskPayload, TaskRecord } from './types'

const taskFields = [
  'name',
  'subject',
  'project',
  'status',
  'priority',
  'exp_start_date',
  'exp_end_date',
  'progress',
  'is_milestone',
  'is_group',
  'parent_task',
  'task_weight',
  'type',
  'depends_on',
]

export async function listProjectTasks(projectId: string): Promise<TaskRecord[]> {
  const res = await apiRequest<{ data: TaskRecord[] }>(
    `/resource/Task?fields=${encodeURIComponent(JSON.stringify(taskFields))}&filters=${encodeURIComponent(JSON.stringify([
      ['project', '=', projectId],
    ]))}&limit_page_length=0`
  )
  return res.data
}

export async function createTask(payload: CreateTaskPayload): Promise<TaskRecord> {
  const res = await apiRequest<{ data: TaskRecord }>('/resource/Task', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function updateTaskStatus(taskName: string, status: string): Promise<void> {
  await apiRequest(`/resource/Task/${encodeURIComponent(taskName)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export async function addTaskDependency(taskName: string, dependencyTaskName: string): Promise<void> {
  const res = await apiRequest<{ data: { depends_on?: Array<{ task: string }> } }>(
    `/resource/Task/${encodeURIComponent(taskName)}?fields=${encodeURIComponent(JSON.stringify(['depends_on']))}`
  )

  const currentDependencies = res.data.depends_on ?? []
  const updatedDependencies = [...currentDependencies, { task: dependencyTaskName }]

  await apiRequest(`/resource/Task/${encodeURIComponent(taskName)}`, {
    method: 'PUT',
    body: JSON.stringify({ depends_on: updatedDependencies }),
  })
}
