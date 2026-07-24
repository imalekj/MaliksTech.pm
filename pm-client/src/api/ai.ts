import client from './client'

export function generateAndSaveProject(projectName: string, description: string) {
  return client
    .post<{ message: string; projectId: number; taskCount: number }>('/ai/generate-and-save-project', {
      projectName,
      description,
    })
    .then((r) => r.data)
}
