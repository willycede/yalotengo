import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage } from '@/api/client'
import { productsApi } from '@/api/products.api'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { ProductForm, parseUnitPrice, type ProductFormValues } from '@/components/ProductForm'
import { ErrorState, LoadingState } from '@/components/ui/Feedback'
import { useProductsStore } from '@/store/productsStore'
import { toast } from '@/store/toastStore'
import type { Product, UpdateProductPayload } from '@/types/api'

export function ProductEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const updateProduct = useProductsStore((state) => state.update)

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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
  }, [load])

  async function handleSubmit(values: ProductFormValues): Promise<void> {
    setIsSaving(true)
    try {
      // `null` clears the column, so emptying the location or the price works.
      const payload: UpdateProductPayload = {
        categoryId: values.categoryId,
        name: values.name,
        stock: values.stock,
        location: values.location.length > 0 ? values.location : null,
        unitPrice: parseUnitPrice(values.unitPrice),
      }

      // Only send a photo when a new one was picked; otherwise the existing one stays.
      if (values.photo.file) payload.photo = values.photo.file

      await updateProduct(id, payload)
      toast.success('Producto actualizado')
      navigate(`/productos/${id}`, { replace: true })
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, 'No se pudo guardar el producto.'))
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Editar producto" backTo={-1} />
        <LoadingState />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <PageHeader title="Editar producto" backTo={-1} />
        <ErrorState message={error ?? 'No encontrado'} onRetry={() => void load()} />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Editar producto" backTo={-1} />
      <PageBody>
        <ProductForm
          initialValues={{
            categoryId: product.categoryId,
            name: product.name,
            stock: product.stock,
            location: product.location ?? '',
            unitPrice: product.unitPrice === null ? '' : product.unitPrice.toFixed(2),
            photo: { url: product.photoUrl, file: null },
          }}
          submitLabel="Guardar cambios"
          isSubmitting={isSaving}
          onSubmit={handleSubmit}
        />
      </PageBody>
    </>
  )
}
