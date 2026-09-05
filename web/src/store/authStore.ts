import { create } from 'zustand'
import { authApi } from '@/api/auth.api'
import { setUnauthorizedHandler, tokenStorage } from '@/api/client'
import type { LoginPayload, RegisterPayload, User } from '@/types/api'

interface AuthState {
  user: User | null
  /** True until the stored session has been checked, so we don't flash the login screen. */
  isRestoring: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  restore: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isRestoring: true,

  async login(payload) {
    const result = await authApi.login(payload)
    tokenStorage.set(result.token)
    set({ user: result.user })
  },

  async register(payload) {
    const result = await authApi.register(payload)
    tokenStorage.set(result.token)
    set({ user: result.user })
  },

  logout() {
    tokenStorage.clear()
    set({ user: null })
    // Wipe cached data so the next account never sees the previous one's.
    resetDataStores()
  },

  /**
   * Runs once on boot. A stored token is only trusted after /auth/me confirms
   * it is still valid, so an expired token never renders a broken session.
   */
  async restore() {
    if (!tokenStorage.get()) {
      set({ isRestoring: false })
      return
    }

    try {
      const user = await authApi.me()
      set({ user, isRestoring: false })
    } catch {
      tokenStorage.clear()
      set({ user: null, isRestoring: false })
    }
  },
}))

/**
 * Registered by the data stores at module load. Keeping it as a callback list
 * avoids an import cycle between authStore and the stores it needs to clear.
 */
const resetCallbacks = new Set<() => void>()

export function registerStoreReset(reset: () => void): void {
  resetCallbacks.add(reset)
}

function resetDataStores(): void {
  for (const reset of resetCallbacks) {
    reset()
  }
}

// An expired or revoked token surfaces as a 401 from any endpoint; when that
// happens the session is dropped and the router sends the user to /login.
setUnauthorizedHandler(() => {
  if (useAuthStore.getState().user !== null) {
    useAuthStore.getState().logout()
  }
})
