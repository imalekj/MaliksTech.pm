const COLORS: Record<string, string> = {
  // Task status
  Todo: 'bg-slate-100 text-slate-600 ring-slate-200',
  InProgress: 'bg-amber-50 text-amber-700 ring-amber-200',
  Done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  // Priority
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
  Medium: 'bg-blue-50 text-blue-700 ring-blue-200',
  High: 'bg-orange-50 text-orange-700 ring-orange-200',
  Critical: 'bg-red-50 text-red-700 ring-red-200',
  // Risk level
  Safe: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  AtRisk: 'bg-amber-50 text-amber-700 ring-amber-200',
  OffTrack: 'bg-red-50 text-red-700 ring-red-200',
}

const DOT: Record<string, string> = {
  Todo: 'bg-slate-400',
  InProgress: 'bg-amber-500',
  Done: 'bg-emerald-500',
  Low: 'bg-slate-400',
  Medium: 'bg-blue-500',
  High: 'bg-orange-500',
  Critical: 'bg-red-500',
  Safe: 'bg-emerald-500',
  AtRisk: 'bg-amber-500',
  OffTrack: 'bg-red-500',
}

const LABELS: Record<string, string> = {
  Todo: 'قيد الانتظار',
  InProgress: 'قيد التنفيذ',
  Done: 'مكتملة',
  Low: 'منخفضة',
  Medium: 'متوسطة',
  High: 'عالية',
  Critical: 'حرجة',
  Safe: 'ضمن الجدول',
  AtRisk: 'معرّض للخطر',
  OffTrack: 'متأخر',
}

export default function Badge({ value, withDot = false }: { value: string; withDot?: boolean }) {
  const color = COLORS[value] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
  const dot = DOT[value] ?? 'bg-slate-400'
  const label = LABELS[value] ?? value
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${color}`}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {label}
    </span>
  )
}
