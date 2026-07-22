import { useMemo } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useDashboardSummary } from './hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

function getRoleWidgets(summary: ReturnType<typeof useDashboardSummary>['data'] | undefined, roles: string[]) {
  const activeProjects = summary?.activeProjects ?? 0
  const openRequests = summary?.openRequests ?? 0
  const pendingApprovals = summary?.pendingApprovals ?? 0
  const openTasks = summary?.openTasks ?? 0

  const widgetConfig = {
    Admin: [
      { title: 'Active projects', value: String(activeProjects) },
      { title: 'Open requests', value: String(openRequests) },
      { title: 'Pending approvals', value: String(pendingApprovals) },
    ],
    PM: [
      { title: 'Open tasks', value: String(openTasks) },
      { title: 'Active projects', value: String(activeProjects) },
      { title: 'Pending approvals', value: String(pendingApprovals) },
    ],
    SE: [
      { title: 'Open tasks', value: String(openTasks) },
      { title: 'Open requests', value: String(openRequests) },
      { title: 'Pending approvals', value: String(pendingApprovals) },
    ],
    Sub: [
      { title: 'Assigned tasks', value: String(openTasks) },
      { title: 'Open requests', value: String(openRequests) },
      { title: 'Recent approvals', value: String(pendingApprovals) },
    ],
  }

  if (roles.includes('System Manager') || roles.includes('Administrator') || roles.includes('Admin')) {
    return widgetConfig.Admin
  }
  if (roles.includes('Project Manager') || roles.includes('PM')) {
    return widgetConfig.PM
  }
  if (roles.includes('Site Engineer') || roles.includes('SE')) {
    return widgetConfig.SE
  }
  if (roles.includes('Subcontractor') || roles.includes('Sub')) {
    return widgetConfig.Sub
  }
  return widgetConfig.PM
}

export function DashboardPage() {
  const { user } = useAuth()
  const summaryQuery = useDashboardSummary()
  const widgets = useMemo(
    () => getRoleWidgets(summaryQuery.data, user?.roles ?? []),
    [summaryQuery.data, user?.roles]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Role-aware dashboards surface the most relevant insights for your team.</p>
        </div>
        <Button variant="outline" onClick={() => summaryQuery.refetch()} disabled={summaryQuery.isFetching}>
          {summaryQuery.isFetching ? 'Refreshing…' : 'Refresh data'}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {widgets.map((widget) => (
          <Card key={widget.title}>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-brand-900">{widget.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading recent activity...
            </div>
          ) : summaryQuery.isError ? (
            <p className="text-sm text-red-600">Unable to load recent activity.</p>
          ) : summaryQuery.data?.recentActivity.length ? (
            <div className="space-y-3">
              {summaryQuery.data.recentActivity.map((item) => (
                <div key={item.name} className="rounded-xl border border-surface-border bg-white px-4 py-3">
                  <p className="font-medium text-brand-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.project ?? 'No project specified'}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="rounded-full bg-surface-muted px-2 py-1">{item.status ?? 'Status unknown'}</span>
                    <span className="rounded-full bg-surface-muted px-2 py-1">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
