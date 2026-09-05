import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string | undefined
  /** Shows a back arrow — used on detail and form screens. */
  backTo?: string | number
  actions?: ReactNode
}

/**
 * Sticky header shared by every page, so titles, back navigation and actions
 * always sit in the same place.
 */
export function PageHeader({ title, subtitle, backTo, actions }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-sm pt-safe">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
        {backTo !== undefined ? (
          <button
            type="button"
            aria-label="Volver"
            onClick={() => (typeof backTo === 'number' ? navigate(backTo) : navigate(backTo))}
            className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-content-muted hover:bg-surface-sunken"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-content">{title}</h1>
          {subtitle ? <p className="truncate text-sm text-content-muted">{subtitle}</p> : null}
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>
    </header>
  )
}

/** Consistent content width and padding for every page body. */
export function PageBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-5">{children}</div>
}
