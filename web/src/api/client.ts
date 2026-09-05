import axios, { AxiosError, type AxiosInstance } from 'axios'
import { env } from '@/lib/env'

/** Shape of every error body returned by the backend error middleware. */
interface ApiErrorBody {
  error?: string
}

/**
 * The JWT lives in localStorage because the backend returns it in the response
 * body rather than an httpOnly cookie. That makes it readable by any script on
 * the page, so the trade-off is accepted knowingly: if the API later sets an
 * httpOnly cookie, only this module needs to change.
 */
const TOKEN_KEY = 'yalotengo.token'

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
}

export const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Read per request rather than setting a default header on login, so logout
// takes effect immediately and no stale token can linger.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

/** Lets the auth store drop the session when the API rejects our token. */
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

/** Turns any thrown value into a message safe to show to the user. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Algo salió mal. Inténtalo de nuevo.',
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const serverMessage = error.response?.data?.error
    if (serverMessage) {
      return serverMessage
    }
    if (error.code === 'ECONNABORTED') {
      return 'La conexión tardó demasiado. Revisa tu internet.'
    }
    if (!error.response) {
      return 'No se pudo conectar con el servidor.'
    }
  }
  return fallback
}
