import { MapPin, Minus, Package, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/api/client'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { toast } from '@/store/toastStore'
import type { Product } from '@/types/api'

interface ProductCardProps {
  product: Product
  /**
   * When provided, the card shows inline +/- controls so the most frequent
   * action — "I used one" — costs a single tap instead of open, tap, go back.
   * The caller owns persistence, which keeps this component free of store
   * knowledge and lets pages that hold their own data use it too.
   */
  onAdjustStock?: (delta: number) => Promise<void>
}

export function ProductCard({ product, onAdjustStock }: ProductCardProps) {
  const [isBusy, setIsBusy] = useState(false)
  const price = formatCurrency(product.unitPrice)

  async function handleAdjust(delta: number): Promise<void> {
    if (!onAdjustStock) return
    setIsBusy(true)
    try {
      await onAdjustStock(delta)
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo actualizar el stock.'))
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="relative flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-card transition-shadow hover:shadow-raised">
      {/* Covers the card so tapping anywhere except the stepper opens the detail. */}
      <Link
        to={`/productos/${product.id}`}
        className="absolute inset-0 rounded-card"
        aria-label={`Ver ${product.name}`}
      />

      {product.photoUrl ? (
        <img
          src={product.photoUrl}
          alt=""
          loading="lazy"
          className="pointer-events-none size-16 shrink-0 rounded-control object-cover"
        />
      ) : (
        <div className="pointer-events-none grid size-16 shrink-0 place-items-center rounded-control bg-surface-sunken">
          <Package className="size-6 text-content-muted" aria-hidden />
        </div>
      )}

      <div className="pointer-events-none min-w-0 flex-1">
        <p className="truncate font-semibold text-content">{product.name}</p>

        {product.location ? (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-content-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{product.location}</span>
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-content-muted/70 italic">Sin ubicación</p>
        )}

        {price ? <p className="mt-0.5 text-sm font-semibold text-accent">{price}</p> : null}
      </div>

      {onAdjustStock ? (
        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <StepperButton
            label={`Quitar una unidad de ${product.name}`}
            onClick={() => void handleAdjust(-1)}
            disabled={isBusy || product.stock === 0}
          >
            <Minus className="size-4" />
          </StepperButton>

          <span
            className={cn(
              'min-w-7 text-center text-base font-bold tabular-nums',
              product.stock === 0 ? 'text-danger-500' : 'text-content',
            )}
          >
            {product.stock}
          </span>

          <StepperButton
            label={`Agregar una unidad de ${product.name}`}
            onClick={() => void handleAdjust(1)}
            disabled={isBusy}
          >
            <Plus className="size-4" />
          </StepperButton>
        </div>
      ) : (
        <span
          className={cn(
            'pointer-events-none shrink-0 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums',
            product.stock === 0 ? 'bg-danger-surface text-danger-500' : 'bg-accent-soft text-accent',
          )}
        >
          {product.stock}
        </span>
      )}
    </div>
  )
}

function StepperButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-line bg-surface text-content transition-[background-color,transform] hover:bg-surface-sunken active:scale-90 disabled:opacity-35"
    >
      {children}
    </button>
  )
}

/** Matches the card's silhouette so the list doesn't jump when data arrives. */
export function ProductCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-3">
      <div className="skeleton size-16 shrink-0 rounded-control" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
      <div className="skeleton size-8 shrink-0 rounded-full" />
    </div>
  )
}
