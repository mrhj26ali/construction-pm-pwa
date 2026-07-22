import { apiRequest, getCsrfToken } from '@/lib/apiClient'
import type { FileRecord, UploadFilePayload } from './types'

export async function listProjectFiles(projectName: string): Promise<FileRecord[]> {
  const encodedFilter = encodeURIComponent(
    JSON.stringify([
      ['attached_to_doctype', '=', 'Project'],
      ['attached_to_name', '=', projectName],
    ])
  )

  const res = await apiRequest<{ data: FileRecord[] }>(
    `/resource/File?fields=["name","file_name","file_url","is_private","creation","attached_to_doctype","attached_to_name"]&filters=${encodedFilter}&limit_page_length=0`
  )

  return res.data
}

export async function uploadProjectFile(projectName: string, payload: UploadFilePayload): Promise<FileRecord> {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('doctype', 'Project')
  formData.append('docname', projectName)
  formData.append('is_private', payload.is_private ? '1' : '0')

  const res = await fetch('/api/method/upload_file', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-Frappe-CSRF-Token': await getCsrfToken(),
    },
    body: formData,
  })

  if (!res.ok) {
    let serverMessage: string | undefined
    try {
      const body = await res.json()
      serverMessage = body.message ?? body._server_messages
    } catch {
      // ignore
    }
    throw new Error(serverMessage ?? `Upload failed: ${res.status}`)
  }

  const body = await res.json()
  return body.message as FileRecord
}
