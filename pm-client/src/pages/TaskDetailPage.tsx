import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as tasksApi from '../api/tasks'
import * as commentsApi from '../api/comments'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
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

  if (isLoading)
    return <div className="max-w-3xl mx-auto px-4 py-8 text-slate-400 text-sm">جارٍ التحميل...</div>
  if (!task)
    return <div className="max-w-3xl mx-auto px-4 py-8 text-slate-400 text-sm">المهمة غير موجودة</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        ← رجوع
      </button>

      <div className="mt-3 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-xl font-bold text-slate-900">{task.title}</h1>
          <Badge value={task.priority} />
        </div>

        {task.description && <p className="text-slate-500 mb-5 leading-relaxed">{task.description}</p>}

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-5">
          <span className="inline-flex items-center gap-1.5">⏱ {task.estimatedHours} ساعة</span>
          {task.assigneeName ? (
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={task.assigneeName} />
              {task.assigneeName}
            </span>
          ) : (
            <span className="text-slate-300">غير معيّن</span>
          )}
          {task.dueDate && (
            <span className="inline-flex items-center gap-1.5">
              📅 {new Date(task.dueDate).toLocaleDateString('ar-EG')}
            </span>
          )}
        </div>

        {task.aiInsights && (
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-800 mb-5">
            <span className="font-semibold">✨ رؤية ذكية:</span> {task.aiInsights}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <label className="text-sm text-slate-500">الحالة</label>
          <select
            value={task.status}
            onChange={(e) => statusMutation.mutate(e.target.value as TaskStatus)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white hover:border-slate-300 transition-colors"
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
            className="mr-auto text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
          >
            حذف المهمة
          </button>
        </div>

        {task.subTasks.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">المهام الفرعية</h3>
            <ul className="space-y-1.5">
              {task.subTasks.map((st) => (
                <li key={st.id}>
                  <Link
                    to={`/tasks/${st.id}`}
                    className="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                    {st.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">التعليقات</h2>

        <div className="space-y-3 mb-4">
          {comments?.length === 0 && <p className="text-sm text-slate-400">لا توجد تعليقات بعد.</p>}
          {comments?.map((c) => (
            <div key={c.id} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3.5">
              <Avatar name={c.authorName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-800">{c.authorName}</span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(c.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{c.content}</p>
              </div>
              {(user?.id === c.authorId || user?.role === 'Admin') && (
                <button
                  onClick={() => deleteCommentMutation.mutate(c.id)}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0 transition-colors"
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
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={addCommentMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:opacity-95 disabled:opacity-60 transition-all"
          >
            إرسال
          </button>
        </form>
      </div>
    </div>
  )
}
