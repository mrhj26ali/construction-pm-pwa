import { useMemo } from 'react'
import { useProjectFiles } from './hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface DocumentListProps {
  projectName: string
}

export function DocumentList({ projectName }: DocumentListProps) {
  const { data: files, isLoading, error } = useProjectFiles(projectName)

  const sortedFiles = useMemo(
    () => [...(files ?? [])].sort((a, b) => new Date(b.creation).getTime() - new Date(a.creation).getTime()),
    [files]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Project documents</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading documents...
          </div>
        ) : error ? (
          <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-4 text-sm text-status-overdue">
            Could not load documents for this project.
          </div>
        ) : sortedFiles.length ? (
          <div className="space-y-3">
            {sortedFiles.map((file) => (
              <div key={file.name} className="rounded-xl border border-surface-border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <a href={file.file_url} target="_blank" rel="noreferrer" className="font-semibold text-brand-900 hover:underline">
                    {file.file_name}
                  </a>
                  <span className="rounded-full bg-surface-card px-2 py-1 text-xs text-gray-500">
                    {file.is_private ? 'Private' : 'Public'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">Uploaded {new Date(file.creation).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
            No documents uploaded yet. Add files to store drawings and reports for this project.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
