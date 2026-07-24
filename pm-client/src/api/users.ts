import client from './client'
import type { User } from './types'

export function getUsers() {
  return client.get<User[]>('/users').then((r) => r.data)
}
