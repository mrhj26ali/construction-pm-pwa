import { apiRequest } from '@/lib/apiClient'
import type { PlatformUser, CreateUserPayload } from '@/types/user'

export async function listUsers(): Promise<PlatformUser[]> {
  const res = await apiRequest<{ data: PlatformUser[] }>(
    '/resource/User?fields=["name","full_name","email","enabled"]&limit_page_length=0'
  )
  return res.data
}

export async function createUser(payload: CreateUserPayload): Promise<PlatformUser> {
  const res = await apiRequest<{ data: PlatformUser }>('/resource/User', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function setUserEnabled(email: string, enabled: boolean): Promise<void> {
  await apiRequest(`/resource/User/${encodeURIComponent(email)}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled: enabled ? 1 : 0 }),
  })
}