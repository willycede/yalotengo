import { Minus, Plus } from 'lucide-react'

interface StockStepperProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

/**
 * Stock is the field users touch most often, so it gets +/- buttons instead of
 * forcing them to open the keyboard for a single unit change.
 */
export function StockStepper({ value, onChange, disabled = false }: StockStepperProps) {
  function handleInput(raw: string): void {
    const digitsOnly = raw.replace(/[^0-9]/g, '')
    onChange(digitsOnly.length === 0 ? 0 : Number.parseInt(digitsOnly, 10))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-content-muted">Unidades en stock</span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Quitar una unidad"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          className="grid size-12 shrink-0 place-items-center rounded-control border border-line bg-surface text-content transition-colors hover:bg-surface-sunken disabled:opacity-40"
        >
          <Minus className="size-5" />
        </button>

        <input
          type="text"
          inputMode="numeric"
          aria-label="Unidades en stock"
          value={value}
          disabled={disabled}
          onChange={(event) => handleInput(event.target.value)}
          onFocus={(event) => event.target.select()}
          className="h-12 min-w-0 flex-1 rounded-control border border-line bg-surface text-center text-lg font-bold text-content tabular-nums focus:border-brand-400"
        />

        <button
          type="button"
          aria-label="Agregar una unidad"
          onClick={() => onChange(value + 1)}
          disabled={disabled}
          className="grid size-12 shrink-0 place-items-center rounded-control border border-line bg-surface text-content transition-colors hover:bg-surface-sunken disabled:opacity-40"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  )
}
