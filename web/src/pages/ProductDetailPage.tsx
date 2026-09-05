import { Folder, ImageOff, MapPin, Pencil, Tag, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage } from '@/api/client'
import { productsApi } from '@/api/products.api'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { StockStepper } from '@/components/StockStepper'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState, LoadingState } from '@/components/ui/Feedback'
import { formatCurrency } from '@/lib/format'
import { useCategoriesStore } from '@/store/categoriesStore'
import { useProductsStore } from '@/store/productsStore'
import { toast } from '@/store/toastStore'
import type { Product } from '@/types/api'

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const updateProduct = useProductsStore((state) => state.update)
  const removeProduct = useProductsStore((state) => state.remove)
  const categories = useCategoriesStore((state) => state.items)
  const fetchCategories = useCategoriesStore((state) => state.fetch)

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSavingStock, setIsSavingStock] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setProduct(await productsApi.getById(id))
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
    void fetchCategories()
  }, [load, fetchCategories])

  /** Adjusting stock from the detail page is the most common daily action. */
  async function handleStockChange(nextStock: number): Promise<void> {
    if (!product || nextStock === product.stock) return

    // Optimistic: the stepper reacts instantly, and we roll back on failure.
    const previous = product
    setProduct({ ...product, stock: nextStock })
    setIsSavingStock(true)
    try {
      const updated = await updateProduct(id, { stock: nextStock })
      setProduct(updated)
    } catch (updateError) {
      setProduct(previous)
      toast.error(getErrorMessage(updateError, 'No se pudo actualizar el stock.'))
    } finally {
      setIsSavingStock(false)
    }
  }

  async function handleDelete(): Promise<void> {
    setIsDeleting(true)
    try {
      await removeProduct(id)
      toast.success('Producto eliminado')
      navigate('/productos', { replace: true })
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'No se pudo eliminar el producto.'))
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Producto" backTo={-1} />
        <LoadingState />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <PageHeader title="Producto" backTo={-1} />
        <ErrorState message={error ?? 'No encontrado'} onRetry={() => void load()} />
      </>
    )
  }

  const categoryName = categories.find((category) => category.id === product.categoryId)?.name
  const unitPrice = formatCurrency(product.unitPrice)
  // Only meaningful once a price exists; shows what this stock is worth.
  const totalValue =
    product.unitPrice !== null ? formatCurrency(product.unitPrice * product.stock) : null

  return (
    <>
      <PageHeader
        title={product.name}
        backTo={-1}
        actions={
          <>
            <button
              type="button"
              aria-label="Editar producto"
              onClick={() => navigate(`/productos/${id}/editar`)}
              className="grid size-10 place-items-center rounded-full text-content-muted hover:bg-surface-sunken"
            >
              <Pencil className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Eliminar producto"
              onClick={() => setIsDeleteOpen(true)}
              className="grid size-10 place-items-center rounded-full text-danger-500 hover:bg-danger-surface"
            >
              <Trash2 className="size-5" />
            </button>
          </>
        }
      />

      <PageBody>
        <div className="flex flex-col gap-4">
          {product.photoUrl ? (
            <img
              src={product.photoUrl}
              alt={product.name}
              className="aspect-[4/3] w-full rounded-card object-cover"
            />
          ) : (
            <div className="grid aspect-[4/3] w-full place-items-center gap-2 rounded-card border border-line bg-surface">
              <div className="flex flex-col items-center gap-2 text-content-muted">
                <ImageOff className="size-9 text-content-muted" aria-hidden />
                <span className="text-sm">Sin foto</span>
              </div>
            </div>
          )}

          <Card className="p-4">
            <StockStepper
              value={product.stock}
              onChange={(stock) => void handleStockChange(stock)}
              disabled={isSavingStock}
            />
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            <InfoRow
              icon={<MapPin className="size-4 text-accent" />}
              label="Ubicación"
              value={product.location ?? 'Sin ubicación'}
            />
            <div className="h-px bg-line" />
            <InfoRow
              icon={<Folder className="size-4 text-accent" />}
              label="Categoría"
              value={categoryName ?? '—'}
            />
            <div className="h-px bg-line" />
            <InfoRow
              icon={<Tag className="size-4 text-accent" />}
              label="Precio unitario"
              value={unitPrice ?? 'Sin precio'}
              {...(totalValue ? { detail: `${product.stock} × ${unitPrice} = ${totalValue}` } : {})}
            />
          </Card>
        </div>
      </PageBody>

      <ConfirmDialog
        open={isDeleteOpen}
        title="Eliminar producto"
        description="Esta acción no se puede deshacer."
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </>
  )
}

function InfoRow({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-control bg-accent-soft">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-content-muted">{label}</p>
        <p className="truncate text-content">{value}</p>
        {detail ? <p className="truncate text-xs text-content-muted">{detail}</p> : null}
      </div>
    </div>
  )
}
