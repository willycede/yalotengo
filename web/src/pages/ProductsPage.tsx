import { Package, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/Feedback'
import { Fab } from '@/components/ui/Fab'
import { cn } from '@/lib/cn'
import { useCategoriesStore } from '@/store/categoriesStore'
import { useProductsStore } from '@/store/productsStore'

const ALL = 'all'

export function ProductsPage() {
  const navigate = useNavigate()
  const {
    items,
    total,
    page,
    totalPages,
    isLoading,
    isLoadingMore,
    hasLoaded,
    error,
    fetchFirstPage,
    fetchNextPage,
    adjustStock,
  } = useProductsStore()

  const categories = useCategoriesStore((state) => state.items)
  const fetchCategories = useCategoriesStore((state) => state.fetch)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>(ALL)

  useEffect(() => {
    void fetchFirstPage()
    void fetchCategories()
  }, [fetchFirstPage, fetchCategories])

  // Filtering by category happens here rather than by navigating into the
  // category screen — one tap instead of three.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()

    return items.filter((product) => {
      if (categoryId !== ALL && product.categoryId !== categoryId) return false
      if (term.length === 0) return true
      return (
        product.name.toLowerCase().includes(term) ||
        (product.location?.toLowerCase().includes(term) ?? false)
      )
    })
  }, [items, search, categoryId])

  const isFiltering = search.trim().length > 0 || categoryId !== ALL
  const canLoadMore = page < totalPages && !isFiltering

  return (
    <>
      <PageHeader title="Productos" subtitle={total > 0 ? `${total} en total` : undefined} />

      <PageBody>
        {/* Search stays at the top and filters as you type — no submit needed. */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-content-muted"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o ubicación"
            aria-label="Buscar productos"
            className="h-12 w-full rounded-control border border-line bg-surface pr-10 pl-10 text-content placeholder:text-content-muted/60 focus:border-brand-400"
          />
          {search.length > 0 ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-2 my-auto grid size-8 place-items-center rounded-full text-content-muted hover:bg-surface-sunken"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {categories.length > 0 ? (
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip
              label="Todas"
              active={categoryId === ALL}
              onClick={() => setCategoryId(ALL)}
            />
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                label={category.name}
                active={categoryId === category.id}
                onClick={() => setCategoryId(category.id)}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-4">
          {isLoading && !hasLoaded ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => void fetchFirstPage(true)} />
          ) : visible.length === 0 ? (
            isFiltering ? (
              <EmptyState
                icon={Search}
                title="Sin resultados"
                description="Prueba con otro término o quita el filtro de categoría."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch('')
                      setCategoryId(ALL)
                    }}
                  >
                    Limpiar filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Package}
                title="Aún no tienes productos"
                description="Agrega tu primer producto para saber qué tienes y dónde está guardado."
                action={
                  <Button onClick={() => navigate('/productos/nuevo')}>Agregar producto</Button>
                }
              />
            )
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {visible.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdjustStock={(delta) => adjustStock(product.id, delta)}
                  />
                ))}
              </div>

              {canLoadMore ? (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="secondary"
                    loading={isLoadingMore}
                    onClick={() => void fetchNextPage()}
                  >
                    Cargar más
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </PageBody>

      <Fab label="Agregar producto" onClick={() => navigate('/productos/nuevo')} />
    </>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap',
        'transition-[background-color,transform] active:scale-95',
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-line bg-surface text-content-muted hover:bg-surface-sunken',
      )}
    >
      {label}
    </button>
  )
}
