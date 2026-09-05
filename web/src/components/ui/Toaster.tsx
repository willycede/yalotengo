import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useToastStore } from '@/store/toastStore'

/**
 * Toasts sit above the mobile bottom bar so they never cover the navigation,
 * and move to the top-right on desktop where there is room.
 */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed z-50 flex flex-col gap-2',
        'inset-x-4 bottom-[calc(var(--spacing-nav)+1rem)]',
        'md:inset-x-auto md:top-4 md:right-4 md:bottom-auto md:w-80',
      )}
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismiss(toast.id)}
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-control px-4 py-3 text-left',
            'shadow-overlay transition-colors',
            toast.tone === 'success' ? 'bg-ink-900 text-white' : 'bg-danger-500 text-white',
          )}
        >
          {toast.tone === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          ) : (
            <XCircle className="size-5 shrink-0" aria-hidden />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </button>
      ))}
    </div>
  )
}
