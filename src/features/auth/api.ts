import { apiRequest } from '@/lib/apiClient'
import type { User, LoginPayload } from '@/types/auth'

export async function loginRequest(payload: LoginPayload): Promise<void> {
  await apiRequest('/method/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ usr: payload.usr, pwd: payload.pwd }),
  })
}

export async function getLoggedUser(): Promise<User> {
  const res = await apiRequest<{ message: string }>('/method/frappe.auth.get_logged_user')
  return { email: res.message, fullName: res.message, roles: [] }
}

export async function logoutRequest(): Promise<void> {
  await apiRequest('/method/logout', { method: 'POST' })
}