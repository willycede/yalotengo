/**
 * Runtime configuration. Vite inlines `VITE_*` variables at build time, so
 * these values are public — never put secrets here.
 *
 * Photo uploads are handled by the API (multipart `photo` field), so the
 * browser needs no storage credentials of its own.
 */

function read(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

export const env = {
  apiUrl: read(import.meta.env.VITE_API_URL, 'http://localhost:3000'),
} as const
