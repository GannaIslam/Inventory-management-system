import { cn } from '../../utils/helpers'

export function Badge({ variant = 'default', children, className }) {
  const variants = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-500',
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
    refunded: 'bg-purple-100 text-purple-700',
    voided: 'bg-red-100 text-red-600',
    critical: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-700',
    default: 'bg-slate-100 text-slate-600',
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant] || variants.default, className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    Active: 'active',
    Inactive: 'inactive',
    Paid: 'paid',
    Pending: 'pending',
    Completed: 'completed',
    Refunded: 'refunded',
    Voided: 'voided',
  }
  return <Badge variant={map[status] || 'default'}>{status}</Badge>
}
