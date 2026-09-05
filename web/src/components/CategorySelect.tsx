import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useCategoriesStore } from '@/store/categoriesStore'

interface CategorySelectProps {
  value: string
  onChange: (categoryId: string) => void
  error?: string | undefined
}

/**
 * Chips instead of a native select: households rarely have more than a handful
 * of categories, and one tap beats opening a picker on mobile.
 */
export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const { items, isLoading, hasLoaded, fetch } = useCategoriesStore()

  useEffect(() => {
    void fetch()
  }, [fetch])

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-content-muted">Categoría</span>

      {isLoading && !hasLoaded ? (
        <p className="text-sm text-content-muted">Cargando categorías…</p>
      ) : items.length === 0 ? (
        <Link to="/categorias" className="text-sm font-semibold text-accent underline">
          No tienes categorías. Crea una primero.
        </Link>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((category) => {
            const isSelected = category.id === value
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange(category.id)}
                className={cn(
                  'h-10 rounded-full border px-4 text-sm font-semibold transition-colors',
                  isSelected
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-line bg-surface text-content hover:bg-surface-sunken',
                )}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      )}

      {error ? <p className="text-sm text-danger-500">{error}</p> : null}
    </div>
  )
}
