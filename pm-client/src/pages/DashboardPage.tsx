import { useState, type FormEvent, type ReactNode } from 'react'
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المشاريع</h1>
          <p className="text-sm text-slate-400 mt-0.5">إدارة ومتابعة جميع مشاريعك في مكان واحد</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAiGenerate(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-semibold shadow-md shadow-purple-200 hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <span>✨</span> توليد بالذكاء الاصطناعي
          </button>
          <button
            onClick={() => setShowNewProject(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all"
          >
            + مشروع جديد
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-sm mb-6">
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          placeholder="بحث عن مشروع..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full rounded-xl border border-slate-200 pr-9 pl-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500 font-medium">لا توجد مشاريع بعد</p>
          <p className="text-sm text-slate-400 mt-1">أنشئ مشروعك الأول أو دع الذكاء الاصطناعي يبدأ لك واحدًا</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="group relative overflow-hidden block bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-2 gap-2">
              <h2 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {p.title}
              </h2>
              <Badge value={p.riskLevel} withDot />
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[2.5rem]">{p.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span>👤 {p.ownerName}</span>
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            السابق
          </button>
          <span className="text-sm text-slate-500 font-medium">
            {page} / {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
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
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors'

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
          className={inputClass}
        />
        <textarea
          required
          minLength={10}
          placeholder="وصف المشروع (10 أحرف على الأقل)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass}
        />
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">تاريخ الانتهاء المستهدف</label>
          <input
            required
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl py-2.5 text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:opacity-95 disabled:opacity-60 transition-all"
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
    <Modal title="✨ توليد مشروع بالذكاء الاصطناعي" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="اسم المشروع"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className={inputClass}
        />
        <textarea
          required
          placeholder="صف فكرة المشروع، وسيقوم الذكاء الاصطناعي بتقسيمه إلى مهام تلقائيًا"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={inputClass}
        />
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl py-2.5 text-sm font-semibold shadow-md shadow-purple-200 hover:shadow-lg hover:opacity-95 disabled:opacity-60 transition-all"
        >
          {mutation.isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              جارٍ التوليد...
            </>
          ) : (
            'توليد المشروع والمهام'
          )}
        </button>
      </form>
    </Modal>
  )
}
