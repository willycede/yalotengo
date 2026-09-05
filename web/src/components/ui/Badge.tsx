import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'brand' | 'danger' | 'neutral'

const TONES: Record<Tone, string> = {
  brand: 'bg-accent-soft text-accent',
  danger: 'bg-danger-surface text-danger-500',
  neutral: 'bg-surface-sunken text-content-muted',
}

export function Badge({ children, tone = 'brand' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-8 items-center justify-center rounded-full px-2 py-0.5',
        'text-sm font-bold tabular-nums',
        TONES[tone],
      )}
    >
      {children}
    </span>
  )
}
