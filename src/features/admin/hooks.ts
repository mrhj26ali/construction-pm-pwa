import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listUsers, createUser, setUserEnabled } from './api'
import type { CreateUserPayload } from '@/types/user'

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: listUsers })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useSetUserEnabled() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ email, enabled }: { email: string; enabled: boolean }) =>
      setUserEnabled(email, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}