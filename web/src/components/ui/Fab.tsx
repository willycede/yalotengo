import { Plus } from 'lucide-react'

interface FabProps {
  label: string
  onClick: () => void
}

/**
 * Floating primary action. Sits above the mobile bottom bar; on desktop it
 * drops to the normal bottom-right corner since there is no bottom nav.
 */
export function Fab({ label, onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed right-4 bottom-[calc(var(--spacing-nav)+1rem+env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-full bg-brand-500 text-white shadow-raised transition-colors hover:bg-brand-600 active:bg-brand-700 md:bottom-6"
    >
      <Plus className="size-7" aria-hidden />
    </button>
  )
}
