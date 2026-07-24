export type UserRole = 'Member' | 'Manager' | 'Admin'

export interface User {
  id: number
  fullName: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export type RiskLevel = 'Safe' | 'AtRisk' | 'OffTrack'

export interface Project {
  id: number
  title: string
  description: string | null
  startDate: string
  targetEndDate: string
  riskLevel: RiskLevel
  ownerName: string
}

export interface ProjectCreateInput {
  title: string
  description: string
  startDate: string
  targetEndDate: string
}

export type TaskStatus = 'Todo' | 'InProgress' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface ProjectTask {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  estimatedHours: number
  actualHours: number
  aiInsights: string | null
  dueDate: string | null
  assigneeName: string | null
  subTasks: ProjectTask[]
}

export interface TaskCreateInput {
  title: string
  description?: string
  priority: TaskPriority
  estimatedHours: number
  dueDate?: string | null
  projectId: number
  assigneeId?: number | null
  parentTaskId?: number | null
}

export interface Comment {
  id: number
  content: string
  createdAt: string
  authorId: number
  authorName: string
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface AiGeneratedTask {
  title: string
  description: string
  estimatedHours: number
  priority: string
  aiInsights: string
}
