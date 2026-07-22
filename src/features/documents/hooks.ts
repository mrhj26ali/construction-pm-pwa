import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listProjectFiles, uploadProjectFile } from './api'
import type { FileRecord, UploadFilePayload } from './types'

export function useProjectFiles(projectName: string) {
  return useQuery<FileRecord[]>({
    queryKey: ['projectFiles', projectName],
    queryFn: () => listProjectFiles(projectName),
    enabled: Boolean(projectName),
  })
}

export function useUploadProjectFile(projectName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UploadFilePayload) => uploadProjectFile(projectName, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectFiles', projectName] }),
  })
}
