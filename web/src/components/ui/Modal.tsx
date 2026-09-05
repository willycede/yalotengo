import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Mobile-first dialog: a bottom sheet on phones (reachable with a thumb) that
 * becomes a centred dialog from `sm` up. One component, two shapes, so dialogs
 * never diverge between breakpoints.
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  // Escape to close, and lock background scroll while open.
  useEffect(() => {
    if (!open) return

    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-md rounded-t-sheet bg-surface shadow-overlay sm:rounded-sheet">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-bold text-content">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid size-9 place-items-center rounded-full text-content-muted hover:bg-surface-sunken"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 pt-5 pb-safe">
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
