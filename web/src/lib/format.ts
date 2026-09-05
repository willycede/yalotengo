const CURRENCY = (import.meta.env.VITE_CURRENCY ?? 'USD').trim() || 'USD'
const LOCALE = (import.meta.env.VITE_LOCALE ?? 'es-EC').trim() || 'es-EC'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
})

/** Formats a unit price for display. Returns null when there is no price recorded. */
export function formatCurrency(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) {
    return null
  }
  return currencyFormatter.format(value)
}
