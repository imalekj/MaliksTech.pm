const COLORS: Record<string, string> = {
  // Task status
  Todo: 'bg-slate-100 text-slate-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Done: 'bg-emerald-100 text-emerald-700',
  // Priority
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
  // Risk level
  Safe: 'bg-emerald-100 text-emerald-700',
  AtRisk: 'bg-amber-100 text-amber-700',
  OffTrack: 'bg-red-100 text-red-700',
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

export default function Badge({ value }: { value: string }) {
  const color = COLORS[value] ?? 'bg-slate-100 text-slate-700'
  const label = LABELS[value] ?? value
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
}
