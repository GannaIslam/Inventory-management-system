import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-600">{label}</label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-slate-800 placeholder-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-[#164E63] focus:border-transparent transition-all duration-200',
          error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
