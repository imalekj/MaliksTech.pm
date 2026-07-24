import client from './client'
import type { PagedResult, ProjectTask, TaskCreateInput, TaskStatus } from './types'

export function getTasks(params: { projectId?: number; status?: TaskStatus; sortBy?: string; page?: number; pageSize?: number }) {
  return client.get<PagedResult<ProjectTask>>('/tasks', { params }).then((r) => r.data)
}

export function getTask(id: number) {
  return client.get<ProjectTask>(`/tasks/${id}`).then((r) => r.data)
}

export function createTask(input: TaskCreateInput) {
  return client.post<ProjectTask>('/tasks', input).then((r) => r.data)
}

export function updateTaskStatus(id: number, status: TaskStatus) {
  return client.patch(`/tasks/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function deleteTask(id: number) {
  return client.delete(`/tasks/${id}`)
}
