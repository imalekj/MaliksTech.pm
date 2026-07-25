import { avatarColor, getInitials } from '../lib/utils'

export default function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const dimensions = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${dimensions} ${avatarColor(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0 ring-2 ring-white`}
    >
      {getInitials(name)}
    </div>
  )
}
