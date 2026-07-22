export interface TaskRecord {
  name: string
  subject: string
  project: string
  status: string
  priority: string
  exp_start_date: string
  exp_end_date: string
  progress: number
  is_milestone: number
  is_group: number
  parent_task: string
  task_weight: number
  type: string
  depends_on?: Array<{ task: string }>
}

export interface CreateTaskPayload {
  subject: string
  project: string
  status: string
  priority: string
  exp_start_date: string
  exp_end_date: string
  progress: number
  is_milestone: number
  is_group: number
  parent_task?: string
  task_weight: number
  type: string
}
