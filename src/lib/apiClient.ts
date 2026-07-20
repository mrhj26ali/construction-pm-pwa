const BASE_URL = '/api'

export class ApiError extends Error {
  public status: number
  public serverMessage?: string

  constructor(status: number, message: string, serverMessage?: string) {
    super(message)
    this.status = status
    this.serverMessage = serverMessage
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    let serverMessage: string | undefined
    try {
      const body = await res.json()
      serverMessage = body.message ?? body._server_messages
    } catch {
      // response body wasn't JSON — leave serverMessage undefined, fall back gracefully
    }
    throw new ApiError(res.status, `Request failed: ${res.status}`, serverMessage)
  }

  return res.json()
}