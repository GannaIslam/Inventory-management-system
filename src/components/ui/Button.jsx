import { cn } from '../../utils/helpers'
import { Loader2 } from 'lucide-react'

export default function Button({ variant = 'primary', size = 'md', loading, disabled, children, className, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-[#164E63] hover:bg-[#0E6680] text-white focus:ring-[#164E63]',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-slate-300',
    cyan: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-200 focus:ring-cyan-300',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus:ring-red-300',
    'danger-solid': 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}
