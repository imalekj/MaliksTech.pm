import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as tasksApi from '../api/tasks'
import * as commentsApi from '../api/comments'
import Badge from '../components/Badge'
import type { TaskStatus } from '../api/types'
import { useAuth } from '../context/AuthContext'

const STATUSES: { status: TaskStatus; label: string }[] = [
  { status: 'Todo', label: 'قيد الانتظار' },
  { status: 'InProgress', label: 'قيد التنفيذ' },
  { status: 'Done', label: 'مكتملة' },
]

export default function TaskDetailPage() {
  const { id } = useParams()
  const taskId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [comment, setComment] = useState('')

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getTask(taskId),
  })

  const { data: comments } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentsApi.getComments(taskId),
  })

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => tasksApi.updateTaskStatus(taskId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task', taskId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.deleteTask(taskId),
    onSuccess: () => navigate('/'),
  })

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.addComment(taskId, content),
    onSuccess: () => {
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] }),
  })

  function handleAddComment(e: FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    addCommentMutation.mutate(comment)
  }

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8 text-slate-500">جارٍ التحميل...</div>
  if (!task) return <div className="max-w-3xl mx-auto px-4 py-8 text-slate-500">المهمة غير موجودة</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline">
        ← رجوع
      </button>

      <div className="mt-3 bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-xl font-semibold text-slate-900">{task.title}</h1>
          <Badge value={task.priority} />
        </div>

        {task.description && <p className="text-slate-600 mb-4">{task.description}</p>}

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
          <span>الساعات المقدّرة: {task.estimatedHours}</span>
          <span>المسؤول: {task.assigneeName ?? 'غير معيّن'}</span>
          {task.dueDate && <span>الموعد النهائي: {new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>}
        </div>

        {task.aiInsights && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800 mb-4">
            💡 {task.aiInsights}
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500">الحالة:</label>
          <select
            value={task.status}
            onChange={(e) => statusMutation.mutate(e.target.value as TaskStatus)}
            className="text-sm border border-slate-300 rounded px-2 py-1"
          >
            {STATUSES.map((s) => (
              <option key={s.status} value={s.status}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من حذف المهمة؟')) deleteMutation.mutate()
            }}
            className="mr-auto text-sm text-red-600 hover:underline"
          >
            حذف المهمة
          </button>
        </div>

        {task.subTasks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">المهام الفرعية</h3>
            <ul className="space-y-1">
              {task.subTasks.map((st) => (
                <li key={st.id} className="text-sm">
                  <Link to={`/tasks/${st.id}`} className="text-indigo-600 hover:underline">
                    {st.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">التعليقات</h2>

        <div className="space-y-3 mb-4">
          {comments?.length === 0 && <p className="text-sm text-slate-400">لا توجد تعليقات بعد.</p>}
          {comments?.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-2 bg-slate-50 rounded-lg p-3">
              <div>
                <p className="text-sm text-slate-800">{c.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {c.authorName} · {new Date(c.createdAt).toLocaleString('ar-EG')}
                </p>
              </div>
              {(user?.id === c.authorId || user?.role === 'Admin') && (
                <button
                  onClick={() => deleteCommentMutation.mutate(c.id)}
                  className="text-xs text-red-500 hover:underline shrink-0"
                >
                  حذف
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أضف تعليقًا..."
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={addCommentMutation.isPending}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            إرسال
          </button>
        </form>
      </div>
    </div>
  )
}
