/**
 * Joins class names, keeping only non-empty strings.
 *
 * Accepts `unknown` so that `someNode && 'class'` guards compile — a ReactNode
 * can be `0` or `''`, which a narrower signature would reject.
 */
export function cn(...classes: unknown[]): string {
  return classes.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ')
}
