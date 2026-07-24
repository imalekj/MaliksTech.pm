import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import * as projectsApi from '../api/projects'
import * as aiApi from '../api/ai'
import Badge from '../components/Badge'
import { isAxiosError } from 'axios'

export default function DashboardPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showAiGenerate, setShowAiGenerate] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search, page],
    queryFn: () => projectsApi.getProjects({ search: search || undefined, page, pageSize: 9 }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">المشاريع</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAiGenerate(true)}
            className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
          >
            توليد مشروع بالذكاء الاصطناعي
          </button>
          <button
            onClick={() => setShowNewProject(true)}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            مشروع جديد
          </button>
        </div>
      </div>

      <input
        placeholder="بحث عن مشروع..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="w-full max-w-sm mb-6 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {isLoading && <p className="text-slate-500">جارٍ التحميل...</p>}

      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-500">لا توجد مشاريع بعد. أنشئ مشروعك الأول.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold text-slate-900 line-clamp-1">{p.title}</h2>
              <Badge value={p.riskLevel} />
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-3 min-h-[2.5rem]">{p.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>المالك: {p.ownerName}</span>
              <span>{new Date(p.targetEndDate).toLocaleDateString('ar-EG')}</span>
            </div>
          </Link>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm disabled:opacity-40"
          >
            السابق
          </button>
          <span className="text-sm text-slate-500">
            {page} / {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}

      {showNewProject && (
        <NewProjectModal onClose={() => setShowNewProject(false)} onCreated={invalidate} />
      )}
      {showAiGenerate && (
        <AiGenerateModal onClose={() => setShowAiGenerate(false)} onCreated={invalidate} />
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetEndDate, setTargetEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      projectsApi.createProject({
        title,
        description,
        startDate: new Date().toISOString(),
        targetEndDate: new Date(targetEndDate).toISOString(),
      }),
    onSuccess: () => {
      onCreated()
      onClose()
    },
    onError: (err) => {
      const message = isAxiosError(err) ? err.response?.data : null
      setError(typeof message === 'string' ? message : 'تعذر إنشاء المشروع')
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal title="مشروع جديد" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="عنوان المشروع"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          required
          minLength={10}
          placeholder="وصف المشروع (10 أحرف على الأقل)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div>
          <label className="block text-xs text-slate-500 mb-1">تاريخ الانتهاء المستهدف</label>
          <input
            required
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {mutation.isPending ? '...' : 'إنشاء المشروع'}
        </button>
      </form>
    </Modal>
  )
}

function AiGenerateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => aiApi.generateAndSaveProject(projectName, description),
    onSuccess: () => {
      onCreated()
      onClose()
    },
    onError: (err) => {
      const message = isAxiosError(err) ? err.response?.data : null
      setError(typeof message === 'string' ? message : 'تعذر توليد المشروع، حاول مرة أخرى')
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal title="توليد مشروع بالذكاء الاصطناعي" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="اسم المشروع"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          required
          placeholder="صف فكرة المشروع، وسيقوم الذكاء الاصطناعي بتقسيمه إلى مهام تلقائيًا"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-purple-600 text-white rounded-md py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
        >
          {mutation.isPending ? 'جارٍ التوليد...' : 'توليد المشروع والمهام'}
        </button>
      </form>
    </Modal>
  )
}
