import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'

const Select = forwardRef(({ label, error, children, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-600">{label}</label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-slate-800',
          'focus:outline-none focus:ring-2 focus:ring-[#164E63] focus:border-transparent transition-all duration-200 appearance-none cursor-pointer',
          error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200',
          className
        )}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
