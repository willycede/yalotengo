/**
 * API contract types.
 *
 * The backend accepts camelCase payloads but returns raw database rows in
 * snake_case. The `*Record` types mirror the wire format; the domain types
 * below are the camelCase shape the UI works with (see `src/api/mappers.ts`).
 */

/* ------------------------------- Wire format ------------------------------ */

export interface CategoryRecord {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface ProductRecord {
  id: string
  category_id: string
  name: string
  photo_url: string | null
  stock: number
  location: string | null
  /** NUMERIC(12,2): the pg driver serialises it as a string to keep precision. */
  unit_price: string | null
  created_at: string
  updated_at: string
}

export interface CategoryWithProductsRecord extends CategoryRecord {
  products: ProductRecord[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/* ------------------------------ Domain models ----------------------------- */

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResult {
  token: string
  user: User
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface CategoryWithProducts extends Category {
  products: Product[]
}

export interface Product {
  id: string
  categoryId: string
  name: string
  photoUrl: string | null
  stock: number
  location: string | null
  /** Optional unit price, already parsed from the API's string representation. */
  unitPrice: number | null
  createdAt: string
  updatedAt: string
}

export interface Page<T> {
  items: T[]
  page: number
  totalPages: number
  total: number
}

/* ------------------------------- Payloads --------------------------------- */

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

/**
 * The API uploads photos itself: create/update accept multipart/form-data with
 * the image in a `photo` field, so the client sends a `File`, not a URL.
 */
export interface CreateProductPayload {
  categoryId: string
  name: string
  stock: number
  location?: string
  unitPrice?: number
  photo?: File | null
}

export interface UpdateProductPayload {
  categoryId?: string
  name?: string
  stock?: number
  location?: string | null
  /** `null` clears a previously recorded price. */
  unitPrice?: number | null
  photo?: File | null
}
