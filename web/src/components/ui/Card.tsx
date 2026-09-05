import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps {
  children: ReactNode
  className?: string
  /** Adds hover feedback for cards that act as links. */
  interactive?: boolean
}

/** The one container shape used across the site — same radius, border and shadow. */
export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface shadow-card',
        interactive && 'transition-shadow hover:shadow-raised',
        className,
      )}
    >
      {children}
    </div>
  )
}
