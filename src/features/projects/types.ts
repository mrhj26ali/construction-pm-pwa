export interface ProjectRecord {
  name: string
  project_name: string
  status: string
  project_type: string
  priority: string
  expected_start_date: string
  expected_end_date: string
  percent_complete: number
}

export interface CreateProjectPayload {
  project_name: string
  status: string
  project_type: string
  priority: string
  expected_start_date: string
  expected_end_date: string
  percent_complete: number
}
