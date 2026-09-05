import { create } from 'zustand'
import { categoriesApi } from '@/api/categories.api'
import { getErrorMessage } from '@/api/client'
import { registerStoreReset } from './authStore'
import type { Category } from '@/types/api'

interface CategoriesState {
  items: Category[]
  isLoading: boolean
  /** Distinguishes "never fetched" from "fetched and empty". */
  hasLoaded: boolean
  error: string | null

  fetch: (force?: boolean) => Promise<void>
  create: (name: string) => Promise<Category>
  update: (id: string, name: string) => Promise<void>
  remove: (id: string) => Promise<void>
  reset: () => void
}

const initialState = {
  items: [] as Category[],
  isLoading: false,
  hasLoaded: false,
  error: null as string | null,
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  ...initialState,

  /**
   * Categories are few and change rarely, so they are cached in the store and
   * only refetched when a caller explicitly forces it or after a mutation.
   */
  async fetch(force = false) {
    if (get().isLoading) return
    if (get().hasLoaded && !force) return

    set({ isLoading: true, error: null })
    try {
      const page = await categoriesApi.list()
      set({ items: page.items, isLoading: false, hasLoaded: true })
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false, hasLoaded: true })
    }
  },

  async create(name) {
    const category = await categoriesApi.create(name)
    set((state) => ({ items: [category, ...state.items] }))
    return category
  },

  async update(id, name) {
    const updated = await categoriesApi.update(id, name)
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? updated : item)),
    }))
  },

  async remove(id) {
    await categoriesApi.remove(id)
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
  },

  reset() {
    set(initialState)
  },
}))

registerStoreReset(() => useCategoriesStore.getState().reset())
