import client from './client'
import type { AuthResponse } from './types'

export function login(email: string, password: string) {
  return client.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data)
}

export function register(fullName: string, email: string, password: string) {
  return client
    .post<AuthResponse>('/auth/register', { fullName, email, password })
    .then((r) => r.data)
}
