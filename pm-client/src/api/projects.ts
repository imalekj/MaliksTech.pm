import client from './client'
import type { PagedResult, Project, ProjectCreateInput } from './types'

export function getProjects(params: { search?: string; sortBy?: string; page?: number; pageSize?: number }) {
  return client.get<PagedResult<Project>>('/projects', { params }).then((r) => r.data)
}

export function getProject(id: number) {
  return client.get<Project>(`/projects/${id}`).then((r) => r.data)
}

export function createProject(input: ProjectCreateInput) {
  return client.post<Project>('/projects', input).then((r) => r.data)
}

export function deleteProject(id: number) {
  return client.delete(`/projects/${id}`)
}
