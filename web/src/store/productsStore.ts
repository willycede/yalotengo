import { create } from 'zustand'
import { getErrorMessage } from '@/api/client'
import { productsApi } from '@/api/products.api'
import { registerStoreReset } from './authStore'
import type { CreateProductPayload, Product, UpdateProductPayload } from '@/types/api'

interface ProductsState {
  items: Product[]
  page: number
  totalPages: number
  total: number
  isLoading: boolean
  isLoadingMore: boolean
  hasLoaded: boolean
  error: string | null

  fetchFirstPage: (force?: boolean) => Promise<void>
  fetchNextPage: () => Promise<void>
  create: (payload: CreateProductPayload) => Promise<Product>
  update: (id: string, payload: UpdateProductPayload) => Promise<Product>
  adjustStock: (id: string, delta: number) => Promise<void>
  remove: (id: string) => Promise<void>
  reset: () => void
}

const initialState = {
  items: [] as Product[],
  page: 0,
  totalPages: 0,
  total: 0,
  isLoading: false,
  isLoadingMore: false,
  hasLoaded: false,
  error: null as string | null,
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  ...initialState,

  async fetchFirstPage(force = false) {
    if (get().isLoading) return
    if (get().hasLoaded && !force) return

    set({ isLoading: true, error: null })
    try {
      const result = await productsApi.list(1)
      set({
        items: result.items,
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        isLoading: false,
        hasLoaded: true,
      })
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false, hasLoaded: true })
    }
  },

  /** Products is the list that can grow without bound, so it paginates. */
  async fetchNextPage() {
    const { page, totalPages, isLoadingMore, isLoading } = get()
    if (isLoading || isLoadingMore || page >= totalPages) return

    set({ isLoadingMore: true })
    try {
      const result = await productsApi.list(page + 1)
      set((state) => ({
        // Guards against duplicates if a mutation reordered the list mid-scroll.
        items: [
          ...state.items,
          ...result.items.filter((item) => !state.items.some((existing) => existing.id === item.id)),
        ],
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        isLoadingMore: false,
      }))
    } catch (error) {
      set({ error: getErrorMessage(error), isLoadingMore: false })
    }
  },

  async create(payload) {
    const product = await productsApi.create(payload)
    set((state) => ({ items: [product, ...state.items], total: state.total + 1 }))
    return product
  },

  async update(id, payload) {
    const updated = await productsApi.update(id, payload)
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? updated : item)),
    }))
    return updated
  },

  /**
   * Optimistic stock change: the UI moves immediately and rolls back if the
   * request fails. This is the app's most frequent action, so it must feel
   * instant — waiting on a round trip for every tap would be painful.
   */
  async adjustStock(id, delta) {
    const current = get().items.find((item) => item.id === id)
    if (!current) return

    const nextStock = Math.max(0, current.stock + delta)
    if (nextStock === current.stock) return

    const previousStock = current.stock
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, stock: nextStock } : item)),
    }))

    try {
      const updated = await productsApi.update(id, { stock: nextStock })
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
      }))
    } catch (error) {
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, stock: previousStock } : item,
        ),
      }))
      throw error
    }
  },

  async remove(id) {
    await productsApi.remove(id)
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      total: Math.max(0, state.total - 1),
    }))
  },

  reset() {
    set(initialState)
  },
}))

registerStoreReset(() => useProductsStore.getState().reset())
