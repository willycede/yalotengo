import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '@/api/client'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { ProductForm, parseUnitPrice, type ProductFormValues } from '@/components/ProductForm'
import { useProductsStore } from '@/store/productsStore'
import { toast } from '@/store/toastStore'
import type { CreateProductPayload } from '@/types/api'

export function ProductNewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Opened from a category page the category comes preselected.
  const presetCategoryId = searchParams.get('categoria') ?? ''

  const createProduct = useProductsStore((state) => state.create)
  // Covers the photo upload too, so the button stays busy for the whole request.
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(values: ProductFormValues): Promise<void> {
    setIsSaving(true)
    try {
      const payload: CreateProductPayload = {
        categoryId: values.categoryId,
        name: values.name,
        stock: values.stock,
      }
      // Optional fields are omitted rather than sent empty.
      if (values.location.length > 0) payload.location = values.location

      const unitPrice = parseUnitPrice(values.unitPrice)
      if (unitPrice !== null) payload.unitPrice = unitPrice

      if (values.photo.file) payload.photo = values.photo.file

      const product = await createProduct(payload)
      toast.success('Producto agregado')
      navigate(`/productos/${product.id}`, { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo crear el producto.'))
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Nuevo producto" backTo={-1} />
      <PageBody>
        <ProductForm
          initialValues={{
            categoryId: presetCategoryId,
            name: '',
            stock: 1,
            location: '',
            unitPrice: '',
            photo: { url: null, file: null },
          }}
          submitLabel="Guardar producto"
          isSubmitting={isSaving}
          onSubmit={handleSubmit}
        />
      </PageBody>
    </>
  )
}
