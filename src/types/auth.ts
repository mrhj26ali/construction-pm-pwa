export interface User {
  email: string
  fullName: string
  roles: string[]
}

export interface LoginPayload {
  usr: string
  pwd: string
}