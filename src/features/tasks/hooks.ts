import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addTaskDependency, createTask, listProjectTasks, updateTaskStatus } from './api'
import type { CreateTaskPayload, TaskRecord } from './types'

export function useProjectTasks(projectId: string) {
  return useQuery<TaskRecord[]>({
    queryKey: ['projectTasks', projectId],
    queryFn: () => listProjectTasks(projectId),
    enabled: Boolean(projectId),
  })
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<CreateTaskPayload, 'project'>) => createTask({ ...payload, project: projectId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] }),
  })
}

export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskName, status }: { taskName: string; status: string }) => updateTaskStatus(taskName, status),
    onMutate: async ({ taskName, status }) => {
      await queryClient.cancelQueries({ queryKey: ['projectTasks', projectId] })
      const previousTasks = queryClient.getQueryData<TaskRecord[]>(['projectTasks', projectId])
      queryClient.setQueryData<TaskRecord[]>(['projectTasks', projectId], (old) =>
        old?.map((task) =>
          task.name === taskName
            ? {
                ...task,
                status,
              }
            : task
        ) ?? []
      )
      return { previousTasks }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['projectTasks', projectId], context.previousTasks)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] }),
  })
}

export function useAddTaskDependency(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskName, dependencyTaskName }: { taskName: string; dependencyTaskName: string }) =>
      addTaskDependency(taskName, dependencyTaskName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] }),
  })
}
