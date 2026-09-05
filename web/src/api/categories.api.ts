import { api } from './client'
import { toCategory, toCategoryWithProducts, toPage } from './mappers'
import type {
  Category,
  CategoryRecord,
  CategoryWithProducts,
  CategoryWithProductsRecord,
  Page,
  PaginatedResponse,
} from '@/types/api'

export const categoriesApi = {
  async list(page = 1, limit = 100): Promise<Page<Category>> {
    const { data } = await api.get<PaginatedResponse<CategoryRecord>>('/categories', {
      params: { page, limit },
    })
    return toPage(data, toCategory)
  },

  async getById(id: string): Promise<CategoryWithProducts> {
    const { data } = await api.get<CategoryWithProductsRecord>(`/categories/${id}`)
    return toCategoryWithProducts(data)
  },

  async create(name: string): Promise<Category> {
    const { data } = await api.post<CategoryRecord>('/categories', { name })
    return toCategory(data)
  },

  async update(id: string, name: string): Promise<Category> {
    const { data } = await api.put<CategoryRecord>(`/categories/${id}`, { name })
    return toCategory(data)
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
