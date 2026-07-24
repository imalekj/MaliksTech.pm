import client from './client'
import type { Comment } from './types'

export function getComments(taskId: number) {
  return client.get<Comment[]>(`/tasks/${taskId}/comments`).then((r) => r.data)
}

export function addComment(taskId: number, content: string) {
  return client.post<Comment>(`/tasks/${taskId}/comments`, { content }).then((r) => r.data)
}

export function deleteComment(id: number) {
  return client.delete(`/comments/${id}`)
}
