import { type FormEvent, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectTasks, useAddTaskDependency } from './hooks'
import { NewTaskDialog } from './NewTaskDialog'
import { GanttView } from './GanttView'
import { KanbanView } from './KanbanView'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'
import type { TaskRecord } from './types'

const sectionTabs = ['Tasks', 'Requests', 'Field Data'] as const
const viewTabs = ['List', 'Gantt', 'Kanban'] as const

type SectionTab = (typeof sectionTabs)[number]
type ViewMode = (typeof viewTabs)[number]

export function TaskListPage() {
  const { projectId } = useParams()
  const { data: tasks, isLoading, error } = useProjectTasks(projectId ?? '')
  const addDependency = useAddTaskDependency(projectId ?? '')
  const [activeSection, setActiveSection] = useState<SectionTab>('Tasks')
  const [viewMode, setViewMode] = useState<ViewMode>('List')
  const [taskName, setTaskName] = useState('')
  const [dependencyTaskName, setDependencyTaskName] = useState('')
  const [dependencyError, setDependencyError] = useState<string | null>(null)
  const [dependencySuccess, setDependencySuccess] = useState<string | null>(null)

  const taskOptions = useMemo(() => tasks ?? [], [tasks])

  async function handleAddDependency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDependencyError(null)
    setDependencySuccess(null)

    if (!taskName || !dependencyTaskName) {
      setDependencyError('Select both a task and a dependency.')
      return
    }

    if (taskName === dependencyTaskName) {
      setDependencyError('A task cannot depend on itself.')
      return
    }

    try {
      await addDependency.mutateAsync({ taskName, dependencyTaskName })
      setDependencySuccess('Dependency added successfully.')
      setTaskName('')
      setDependencyTaskName('')
    } catch (err) {
      const message =
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : 'Could not add dependency. Please try again.'
      setDependencyError(message)
    }
  }

  function renderTasks(tasks: TaskRecord[]) {
    if (viewMode === 'Gantt') {
      return <GanttView tasks={tasks} />
    }
    if (viewMode === 'Kanban') {
      return <KanbanView projectId={projectId ?? ''} tasks={tasks} />
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-surface-border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-gray-500">
              <th className="py-3 pr-4">Task</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Priority</th>
              <th className="py-3 pr-4">Start</th>
              <th className="py-3 pr-4">End</th>
              <th className="py-3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                <td className="py-3 pr-4 text-brand-900">{task.subject}</td>
                <td className="py-3 pr-4 text-gray-700">{task.status}</td>
                <td className="py-3 pr-4 text-gray-700">{task.type}</td>
                <td className="py-3 pr-4 text-gray-700">{task.priority}</td>
                <td className="py-3 pr-4 text-gray-700">{task.exp_start_date || '—'}</td>
                <td className="py-3 pr-4 text-gray-700">{task.exp_end_date || '—'}</td>
                <td className="py-3 text-gray-700">{task.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function renderSection() {
    if (activeSection === 'Requests') {
      return (
        <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
          Requests are coming soon. This tab will let you create and review project requests.
        </div>
      )
    }

    if (activeSection === 'Field Data') {
      return (
        <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
          Field Data is coming soon. Capture daily logs and field reports from the job site here.
        </div>
      )
    }

    return (
      <>
        <div className="flex flex-wrap items-center gap-3">
          {viewTabs.map((tab) => (
            <Button
              key={tab}
              variant={viewMode === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
        {tasks?.length ? (
          renderTasks(tasks)
        ) : (
          <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
            No tasks exist yet for this project. Create one to begin planning work.
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Project tasks</h1>
          <p className="text-sm text-gray-500">Manage the work breakdown for project {projectId || 'details'}.</p>
        </div>
        <Button asChild>
          <Link to="/projects">Back to projects</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-surface-border bg-white p-2">
        {sectionTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeSection === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <NewTaskDialog projectId={projectId ?? ''} ancestors={tasks ?? []} onCreated={() => {}} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add task dependency</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDependency} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taskName">Task</Label>
                  <select
                    id="taskName"
                    value={taskName}
                    onChange={(event) => setTaskName(event.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Select task</option>
                    {taskOptions.map((task) => (
                      <option key={task.name} value={task.name}>{task.subject}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dependencyTaskName">Depends on</Label>
                  <select
                    id="dependencyTaskName"
                    value={dependencyTaskName}
                    onChange={(event) => setDependencyTaskName(event.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Select dependency</option>
                    {taskOptions.map((task) => (
                      <option key={task.name} value={task.name}>{task.subject}</option>
                    ))}
                  </select>
                </div>

                {dependencyError && (
                  <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-3 text-sm text-status-overdue">
                    {dependencyError}
                  </div>
                )}

                {dependencySuccess && (
                  <div className="rounded-md border border-status-ontrack/30 bg-status-ontrack/10 p-3 text-sm text-status-ontrack">
                    {dependencySuccess}
                  </div>
                )}

                <Button type="submit" disabled={addDependency.status === 'pending'}>
                  {addDependency.status === 'pending' ? 'Adding dependency…' : 'Add dependency'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{activeSection}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Loading tasks...
                </div>
              ) : error ? (
                <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-4 text-sm text-status-overdue">
                  Could not load tasks for this project.
                </div>
              ) : (
                renderSection()
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
