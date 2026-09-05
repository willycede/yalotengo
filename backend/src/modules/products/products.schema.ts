import { z } from "zod";

/**
 * Money is stored as NUMERIC(12,2). Values are rounded to cents here so a
 * client sending 12.345 is accepted as 12.35 instead of being rejected by the
 * column definition.
 */
const unitPriceValue = z
  .number()
  .min(0, "Unit price cannot be negative")
  .max(9_999_999_999.99, "Unit price is too large");

function toCents(value: unknown): unknown {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : value;
}

/**
 * These endpoints accept multipart/form-data, so every field arrives as text
 * and an untouched optional input arrives as "". Both must become `undefined`
 * rather than being coerced to 0.
 */
const createUnitPrice = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : toCents(value)),
  unitPriceValue.optional(),
);

/** On update, an empty value explicitly clears a previously recorded price. */
const updateUnitPrice = z.preprocess(
  (value) =>
    value === undefined ? undefined : value === "" || value === null ? null : toCents(value),
  unitPriceValue.nullable().optional(),
);

export const createProductSchema = z.object({
  categoryId: z.string().uuid("Invalid category id"),
  name: z.string().trim().min(1, "Name is required").max(150),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  location: z.string().trim().max(150).optional(),
  unitPrice: createUnitPrice,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  categoryId: z.string().uuid("Invalid category id").optional(),
  name: z.string().trim().min(1, "Name is required").max(150).optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").optional(),
  location: z.string().trim().max(150).nullable().optional(),
  unitPrice: updateUnitPrice,
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productIdParamSchema = z.object({
  id: z.string().uuid("Invalid product id"),
});
