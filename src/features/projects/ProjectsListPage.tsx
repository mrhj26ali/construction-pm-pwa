import { Link } from 'react-router-dom'
import { useProjects } from './hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function ProjectsListPage() {
  const { data: projects, isLoading, error } = useProjects()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Projects</h1>
          <p className="text-sm text-gray-500">Track active workstreams and progress across construction projects.</p>
        </div>
        <Button asChild>
          <Link to="/projects/new">New project</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project list</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading projects...
            </div>
          ) : error ? (
            <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-4 text-sm text-status-overdue">
              Could not load projects. Please refresh or contact your administrator.
            </div>
          ) : projects?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Project</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Priority</th>
                    <th className="py-3 pr-4">Start</th>
                    <th className="py-3 pr-4">End</th>
                    <th className="py-3">% Complete</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                      <td className="py-3 pr-4 text-brand-900">
                        <Link to={`/projects/${encodeURIComponent(project.name)}`} className="hover:underline">
                          {project.project_name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{project.status || 'Unknown'}</td>
                      <td className="py-3 pr-4 text-gray-700">{project.project_type || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{project.priority || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{project.expected_start_date || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{project.expected_end_date || '—'}</td>
                      <td className="py-3 text-gray-700">{project.percent_complete ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
              No projects found yet. Create a new project to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
