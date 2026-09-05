import { Package, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { categoriesApi } from '@/api/categories.api'
import { getErrorMessage } from '@/api/client'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Feedback'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useCategoriesStore } from '@/store/categoriesStore'
import { useProductsStore } from '@/store/productsStore'
import { toast } from '@/store/toastStore'
import type { CategoryWithProducts } from '@/types/api'

export function CategoryDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const updateCategory = useCategoriesStore((state) => state.update)
  const removeCategory = useCategoriesStore((state) => state.remove)
  const resetProducts = useProductsStore((state) => state.reset)
  const updateProduct = useProductsStore((state) => state.update)

  const [category, setCategory] = useState<CategoryWithProducts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // The detail view carries its products, so it is fetched on demand rather
  // than kept in the shared store.
  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await categoriesApi.getById(id)
      setCategory(result)
      setEditName(result.name)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  /**
   * This page holds its own product list (it comes embedded in the category
   * response), so the stock change is applied here and mirrored into the
   * products store to keep the Productos tab consistent.
   */
  async function handleAdjustStock(
    productId: string,
    currentStock: number,
    delta: number,
  ): Promise<void> {
    const nextStock = Math.max(0, currentStock + delta)
    if (nextStock === currentStock) return

    const updated = await updateProduct(productId, { stock: nextStock })
    setCategory((current) =>
      current
        ? {
            ...current,
            products: current.products.map((item) => (item.id === productId ? updated : item)),
          }
        : current,
    )
  }

  async function handleRename(event: FormEvent): Promise<void> {
    event.preventDefault()
    setEditError(null)

    const trimmed = editName.trim()
    if (trimmed.length === 0) {
      setEditError('Escribe un nombre para la categoría.')
      return
    }

    setIsSaving(true)
    try {
      await updateCategory(id, trimmed)
      setCategory((current) => (current ? { ...current, name: trimmed } : current))
      toast.success('Categoría actualizada')
      setIsEditOpen(false)
    } catch (saveError) {
      setEditError(getErrorMessage(saveError, 'No se pudo guardar la categoría.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(): Promise<void> {
    setIsDeleting(true)
    try {
      await removeCategory(id)
      // Deleting a category cascades to its products, so that list is stale now.
      resetProducts()
      toast.success('Categoría eliminada')
      navigate('/categorias', { replace: true })
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'No se pudo eliminar la categoría.'))
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Categoría" backTo="/categorias" />
        <LoadingState />
      </>
    )
  }

  if (error || !category) {
    return (
      <>
        <PageHeader title="Categoría" backTo="/categorias" />
        <ErrorState message={error ?? 'No encontrada'} onRetry={() => void load()} />
      </>
    )
  }

  const productCount = category.products.length

  return (
    <>
      <PageHeader
        title={category.name}
        subtitle={productCount === 1 ? '1 producto' : `${productCount} productos`}
        backTo="/categorias"
        actions={
          <>
            <button
              type="button"
              aria-label="Editar categoría"
              onClick={() => setIsEditOpen(true)}
              className="grid size-10 place-items-center rounded-full text-content-muted hover:bg-surface-sunken"
            >
              <Pencil className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Eliminar categoría"
              onClick={() => setIsDeleteOpen(true)}
              className="grid size-10 place-items-center rounded-full text-danger-500 hover:bg-danger-surface"
            >
              <Trash2 className="size-5" />
            </button>
          </>
        }
      />

      <PageBody>
        {productCount === 0 ? (
          <EmptyState
            icon={Package}
            title="Categoría vacía"
            description={`Agrega el primer producto de "${category.name}".`}
            action={
              <Button onClick={() => navigate(`/productos/nuevo?categoria=${id}`)}>
                Agregar producto
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdjustStock={(delta) => handleAdjustStock(product.id, product.stock, delta)}
              />
            ))}
          </div>
        )}
      </PageBody>

      <Modal open={isEditOpen} title="Editar categoría" onClose={() => setIsEditOpen(false)}>
        <form onSubmit={handleRename} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            maxLength={100}
            autoFocus
            error={editError ?? undefined}
          />
          <Button type="submit" size="lg" block loading={isSaving}>
            Guardar cambios
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={isDeleteOpen}
        title="Eliminar categoría"
        description="Se eliminarán también todos los productos que contiene. Esta acción no se puede deshacer."
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </>
  )
}
