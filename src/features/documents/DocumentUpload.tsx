import { useState } from 'react'
import { useUploadProjectFile } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError } from '@/lib/apiClient'

interface DocumentUploadProps {
  projectName: string
}

export function DocumentUpload({ projectName }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const uploadFile = useUploadProjectFile(projectName)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    if (!file) {
      setErrorMessage('Select a file before uploading.')
      return
    }

    try {
      await uploadFile.mutateAsync({ file, is_private: isPrivate })
      setFile(null)
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.serverMessage ?? err.message : 'File upload failed.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload document</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentFile">File</Label>
            <Input
              id="documentFile"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
                className="h-4 w-4 rounded border border-input text-brand-500"
              />
              Private
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-3 text-sm text-status-overdue">
              {errorMessage}
            </div>
          )}

          <Button type="submit" disabled={uploadFile.status === 'pending'}>
            {uploadFile.status === 'pending' ? 'Uploading…' : 'Upload document'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
