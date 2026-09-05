import { api } from './client'
import { toPage, toProduct } from './mappers'
import type {
  CreateProductPayload,
  Page,
  PaginatedResponse,
  Product,
  ProductRecord,
  UpdateProductPayload,
} from '@/types/api'

/**
 * The API accepts both JSON and multipart on create/update. We only reach for
 * multipart when there is a file to send, because form-data cannot express
 * `null` — and `null` is how a field gets cleared (e.g. removing a location or
 * a price). JSON keeps those semantics exact for the common case.
 */
function toFormData(payload: CreateProductPayload | UpdateProductPayload): FormData {
  const form = new FormData()

  if (payload.categoryId !== undefined) form.append('categoryId', payload.categoryId)
  if (payload.name !== undefined) form.append('name', payload.name)
  if (payload.stock !== undefined) form.append('stock', String(payload.stock))
  // An empty string clears the value server-side.
  if (payload.location !== undefined) form.append('location', payload.location ?? '')
  if (payload.unitPrice !== undefined) form.append('unitPrice', payload.unitPrice?.toString() ?? '')
  if (payload.photo) form.append('photo', payload.photo)

  return form
}

/** Strips the `photo` File so it never ends up in a JSON body. */
function toJsonBody<T extends CreateProductPayload | UpdateProductPayload>(
  payload: T,
): Omit<T, 'photo'> {
  const { photo: _photo, ...rest } = payload
  return rest
}

export const productsApi = {
  async list(page = 1, limit = 24): Promise<Page<Product>> {
    const { data } = await api.get<PaginatedResponse<ProductRecord>>('/products', {
      params: { page, limit },
    })
    return toPage(data, toProduct)
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<ProductRecord>(`/products/${id}`)
    return toProduct(data)
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const { data } = payload.photo
      ? // Content-Type is left unset so the browser adds the multipart boundary.
        await api.post<ProductRecord>('/products', toFormData(payload), {
          headers: { 'Content-Type': undefined },
        })
      : await api.post<ProductRecord>('/products', toJsonBody(payload))

    return toProduct(data)
  },

  async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { data } = payload.photo
      ? await api.put<ProductRecord>(`/products/${id}`, toFormData(payload), {
          headers: { 'Content-Type': undefined },
        })
      : await api.put<ProductRecord>(`/products/${id}`, toJsonBody(payload))

    return toProduct(data)
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },
}
