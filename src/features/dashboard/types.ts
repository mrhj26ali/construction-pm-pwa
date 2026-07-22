export interface DashboardSummary {
  activeProjects: number
  openRequests: number
  pendingApprovals: number
  openTasks: number
  recentActivity: Array<{ name: string; status?: string; project?: string; createdAt?: string }>
}
