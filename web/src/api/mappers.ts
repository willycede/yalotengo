import type {
  Category,
  CategoryRecord,
  CategoryWithProducts,
  CategoryWithProductsRecord,
  Page,
  PaginatedResponse,
  Product,
  ProductRecord,
} from '@/types/api'

/**
 * The API returns database rows in snake_case. Normalising here keeps that
 * detail out of the components and gives us a single place to adapt if the
 * backend later switches to camelCase responses.
 */

export function toCategory(record: CategoryRecord): Category {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.created_at,
  }
}

/** NUMERIC columns arrive as strings; anything unparseable is treated as "no price". */
function toNumberOrNull(value: string | null): number | null {
  if (value === null) {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function toProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    categoryId: record.category_id,
    name: record.name,
    photoUrl: record.photo_url,
    stock: record.stock,
    location: record.location,
    unitPrice: toNumberOrNull(record.unit_price ?? null),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

export function toCategoryWithProducts(
  record: CategoryWithProductsRecord,
): CategoryWithProducts {
  return {
    ...toCategory(record),
    products: record.products.map(toProduct),
  }
}

export function toPage<TRecord, TModel>(
  response: PaginatedResponse<TRecord>,
  map: (record: TRecord) => TModel,
): Page<TModel> {
  return {
    items: response.data.map(map),
    page: response.pagination.page,
    totalPages: response.pagination.totalPages,
    total: response.pagination.total,
  }
}
