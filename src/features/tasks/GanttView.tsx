import { useEffect, useRef } from 'react'
import 'frappe-gantt/dist/frappe-gantt.css'
import Gantt from 'frappe-gantt'
import type { TaskRecord } from './types'

interface GanttViewProps {
  tasks: TaskRecord[]
}

export function GanttView({ tasks }: GanttViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    element.innerHTML = ''

    const ganttTasks = tasks
      .filter((task) => task.exp_start_date && task.exp_end_date)
      .map((task) => ({
        id: task.name,
        name: task.subject,
        start: task.exp_start_date,
        end: task.exp_end_date,
        progress: Math.round(task.progress ?? 0),
        dependencies: (task.depends_on ?? []).map((dependency) => dependency.task).join(','),
        custom_class: task.status ? task.status.toLowerCase().replace(/\s+/g, '-') : undefined,
      }))

    if (ganttTasks.length === 0) {
      element.innerHTML = '<div class="p-6 text-sm text-gray-600">No tasks with valid start and end dates are available for the Gantt chart.</div>'
      return
    }

    const gantt = new Gantt(element, ganttTasks, {
      view_mode: 'Day',
      language: 'en',
      custom_popup_html: (task) =>
        `<div class="gantt-tooltip"><strong>${task.name}</strong><br />${task.start} → ${task.end}<br />${task.progress}% complete</div>`,
    })

    return () => {
      gantt.$svg?.remove()
      element.innerHTML = ''
    }
  }, [tasks])

  return <div ref={containerRef} className="rounded-xl border border-surface-border bg-white" style={{ minHeight: 420 }} />
}
