import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  /** Stretches to the full width of its container — the default on mobile forms. */
  block?: boolean
  icon?: ReactNode
}

/**
 * Every variant shares height, radius, weight and motion. Only colour changes,
 * which is what keeps buttons feeling like one family across the whole site.
 */
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-card',
  secondary: 'bg-surface text-content border border-line hover:bg-surface-sunken',
  ghost: 'bg-transparent text-content-muted hover:bg-surface-sunken hover:text-content',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-card',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-13 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control font-semibold select-none',
        // A subtle press-in is the cheapest way to make taps feel responsive.
        'transition-[background-color,transform,opacity] duration-150 active:scale-[0.97]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}
