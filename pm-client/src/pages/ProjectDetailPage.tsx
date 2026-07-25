import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as projectsApi from '../api/projects'
import * as tasksApi from '../api/tasks'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import type { ProjectTask, TaskPriority, TaskStatus } from '../api/types'
import { isAxiosError } from 'axios'

const COLUMNS: { status: TaskStatus; label: string; accent: string; dot: string }[] = [
  { status: 'Todo', label: 'قيد الانتظار', accent: 'border-t-slate-300', dot: 'bg-slate-400' },
  { status: 'InProgress', label: 'قيد التنفيذ', accent: 'border-t-amber-400', dot: 'bg-amber-500' },
  { status: 'Done', label: 'مكتملة', accent: 'border-t-emerald-400', dot: 'bg-emerald-500' },
]

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors'

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
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        ← عودة إلى المشاريع
      </Link>

      {project && (
        <div className="mt-3 mb-8 flex flex-wrap items-start justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
              <Badge value={project.riskLevel} withDot />
            </div>
            <p className="text-slate-500 max-w-2xl">{project.description}</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
              <Avatar name={project.ownerName} />
              <span>{project.ownerName}</span>
              <span className="text-slate-300">•</span>
              <span>موعد الانتهاء {new Date(project.targetEndDate).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowNewTask(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:opacity-95 transition-all"
            >
              + مهمة جديدة
            </button>
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف المشروع؟')) deleteProjectMutation.mutate()
              }}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              حذف
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-slate-400 text-sm">جارٍ التحميل...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className={`bg-slate-50 border-t-4 ${col.accent} rounded-2xl p-3`}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`w-2 h-2 rounded-full ${col.dot}`} />
              <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
              <span className="text-xs text-slate-400 bg-white rounded-full px-1.5 py-0.5 border border-slate-200">
                {tasks.filter((t) => t.status === col.status).length}
              </span>
            </div>
            <div className="space-y-3 min-h-[4rem]">
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
      className="block bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-slate-900 leading-snug">{task.title}</h4>
        <Badge value={task.priority} />
      </div>
      {task.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        {task.assigneeName ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assigneeName} />
            <span className="text-xs text-slate-500">{task.assigneeName}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-300">غير معيّنة</span>
        )}
        <select
          value={task.status}
          onClick={(e) => e.preventDefault()}
          onChange={(e) => {
            e.preventDefault()
            statusMutation.mutate(e.target.value as TaskStatus)
          }}
          className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 bg-white hover:border-slate-300 transition-colors"
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
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-scale-in"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">مهمة جديدة</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="عنوان المهمة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="الوصف"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">الأولوية</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={inputClass}
              >
                <option value="Low">منخفضة</option>
                <option value="Medium">متوسطة</option>
                <option value="High">عالية</option>
                <option value="Critical">حرجة</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">الساعات المقدّرة</label>
              <input
                type="number"
                min={1}
                max={100}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl py-2.5 text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:opacity-95 disabled:opacity-60 transition-all"
          >
            {mutation.isPending ? '...' : 'إنشاء المهمة'}
          </button>
        </form>
      </div>
    </div>
  )
}
