import { CloudOff, Loader2 } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { Button } from './Button'

/** Shared loading / error / empty presentations, so every page fails the same way. */

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-content-muted">
      <Loader2 className="size-8 animate-spin text-accent" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <CloudOff className="size-10 text-content-muted" aria-hidden />
      <p className="text-danger-500">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent-soft">
        <Icon className="size-7 text-accent" />
      </div>
      <h2 className="text-lg font-bold text-content">{title}</h2>
      <p className="max-w-sm text-sm text-content-muted">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
