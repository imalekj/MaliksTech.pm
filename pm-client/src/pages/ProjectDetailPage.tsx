import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as projectsApi from '../api/projects'
import * as tasksApi from '../api/tasks'
import Badge from '../components/Badge'
import type { ProjectTask, TaskPriority, TaskStatus } from '../api/types'
import { isAxiosError } from 'axios'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'Todo', label: 'قيد الانتظار' },
  { status: 'InProgress', label: 'قيد التنفيذ' },
  { status: 'Done', label: 'مكتملة' },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const projectId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showNewTask, setShowNewTask] = useState(false)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId),
  })

  const { data: tasksResult, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksApi.getTasks({ projectId, pageSize: 100 }),
  })

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.deleteProject(projectId),
    onSuccess: () => navigate('/'),
  })

  function invalidateTasks() {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
  }

  const tasks = tasksResult?.items ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-indigo-600 hover:underline">
        ← عودة إلى المشاريع
      </Link>

      {project && (
        <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
              <Badge value={project.riskLevel} />
            </div>
            <p className="text-slate-500 mt-1 max-w-2xl">{project.description}</p>
            <p className="text-xs text-slate-400 mt-2">
              المالك: {project.ownerName} · موعد الانتهاء:{' '}
              {new Date(project.targetEndDate).toLocaleDateString('ar-EG')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewTask(true)}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              مهمة جديدة
            </button>
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف المشروع؟')) deleteProjectMutation.mutate()
              }}
              className="px-4 py-2 rounded-md border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50"
            >
              حذف المشروع
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-slate-500">جارٍ التحميل...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="bg-slate-100/70 rounded-xl p-3">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">
              {col.label} ({tasks.filter((t) => t.status === col.status).length})
            </h3>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === col.status)
                .map((task) => (
                  <TaskCard key={task.id} task={task} onChanged={invalidateTasks} />
                ))}
            </div>
          </div>
        ))}
      </div>

      {showNewTask && (
        <NewTaskModal
          projectId={projectId}
          onClose={() => setShowNewTask(false)}
          onCreated={invalidateTasks}
        />
      )}
    </div>
  )
}

function TaskCard({ task, onChanged }: { task: ProjectTask; onChanged: () => void }) {
  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => tasksApi.updateTaskStatus(task.id, status),
    onSuccess: onChanged,
  })

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-slate-900">{task.title}</h4>
        <Badge value={task.priority} />
      </div>
      {task.description && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{task.description}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{task.assigneeName ?? 'غير معيّنة'}</span>
        <select
          value={task.status}
          onClick={(e) => e.preventDefault()}
          onChange={(e) => {
            e.preventDefault()
            statusMutation.mutate(e.target.value as TaskStatus)
          }}
          className="text-xs border border-slate-200 rounded px-1.5 py-0.5"
        >
          {COLUMNS.map((c) => (
            <option key={c.status} value={c.status}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </Link>
  )
}

function NewTaskModal({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: number
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [estimatedHours, setEstimatedHours] = useState(4)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      tasksApi.createTask({ title, description, priority, estimatedHours, projectId }),
    onSuccess: () => {
      onCreated()
      onClose()
    },
    onError: (err) => {
      const message = isAxiosError(err) ? err.response?.data?.Message ?? err.response?.data : null
      setError(typeof message === 'string' ? message : 'تعذر إنشاء المهمة')
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">مهمة جديدة</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="عنوان المهمة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="الوصف"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">الأولوية</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="Low">منخفضة</option>
                <option value="Medium">متوسطة</option>
                <option value="High">عالية</option>
                <option value="Critical">حرجة</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">الساعات المقدّرة</label>
              <input
                type="number"
                min={1}
                max={100}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {mutation.isPending ? '...' : 'إنشاء المهمة'}
          </button>
        </form>
      </div>
    </div>
  )
}
