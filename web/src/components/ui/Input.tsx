import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | undefined
  hint?: string | undefined
  icon?: ReactNode
}

export function Input({ label, error, hint, icon, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-content-muted">
        {label}
      </label>

      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-content-muted">
            {icon}
          </span>
        ) : null}

        <input
          {...props}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-control border bg-surface px-3.5 text-content',
            'placeholder:text-content-muted/60 transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-60',
            icon && 'pl-10',
            error ? 'border-danger-500' : 'border-line focus:border-brand-400',
            className,
          )}
        />
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-danger-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-content-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
