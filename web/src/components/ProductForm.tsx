import { useState, type FormEvent } from 'react'
import { CategorySelect } from './CategorySelect'
import { PhotoPicker, type PhotoSelection } from './PhotoPicker'
import { StockStepper } from './StockStepper'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export interface ProductFormValues {
  categoryId: string
  name: string
  stock: number
  location: string
  /** Kept as text so the field can be left empty — price is optional. */
  unitPrice: string
  photo: PhotoSelection
}

/** Accepts "12", "12.5", "12,50" — empty means "no price recorded". */
export function parseUnitPrice(raw: string): number | null {
  const normalised = raw.trim().replace(',', '.')
  if (normalised.length === 0) return null
  const parsed = Number(normalised)
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null
}

interface ProductFormProps {
  initialValues: ProductFormValues
  submitLabel: string
  isSubmitting: boolean
  onSubmit: (values: ProductFormValues) => Promise<void>
}

type FieldErrors = Partial<Record<'categoryId' | 'name' | 'unitPrice', string>>

/** Shared by the create and edit pages so both stay in sync. */
export function ProductForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]): void {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()

    const nextErrors: FieldErrors = {}
    if (values.categoryId.length === 0) nextErrors.categoryId = 'Elige una categoría.'
    if (values.name.trim().length === 0) nextErrors.name = 'Escribe un nombre.'

    // Price is optional, but if something was typed it has to be a valid amount.
    const rawPrice = values.unitPrice.trim()
    if (rawPrice.length > 0) {
      const parsed = parseUnitPrice(rawPrice)
      if (parsed === null) {
        nextErrors.unitPrice = 'Escribe un número válido.'
      } else if (parsed < 0) {
        nextErrors.unitPrice = 'El precio no puede ser negativo.'
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      ...values,
      name: values.name.trim(),
      location: values.location.trim(),
      unitPrice: rawPrice,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <CategorySelect
        value={values.categoryId}
        onChange={(categoryId) => update('categoryId', categoryId)}
        error={errors.categoryId}
      />

      <Input
        label="Nombre"
        value={values.name}
        onChange={(event) => update('name', event.target.value)}
        placeholder="Ej. Luces de colores"
        maxLength={150}
        error={errors.name}
      />

      <StockStepper
        value={values.stock}
        onChange={(stock) => update('stock', stock)}
        disabled={isSubmitting}
      />

      <Input
        label="¿Dónde está guardado?"
        value={values.location}
        onChange={(event) => update('location', event.target.value)}
        placeholder="Ej. Bodega, caja azul"
        maxLength={150}
        hint="Lo más útil para no volver a buscarlo."
      />

      <Input
        label="Precio unitario (opcional)"
        value={values.unitPrice}
        onChange={(event) => update('unitPrice', event.target.value)}
        placeholder="Ej. 12.50"
        inputMode="decimal"
        icon={<span className="text-sm font-semibold">$</span>}
        error={errors.unitPrice}
        {...(errors.unitPrice ? {} : { hint: 'Déjalo vacío si no lo recuerdas.' })}
      />

      <PhotoPicker value={values.photo} onChange={(photo) => update('photo', photo)} />

      <Button type="submit" size="lg" block loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
