import type { Knex } from "knex";

/**
 * Optional unit price per product.
 *
 * Uses NUMERIC(12,2) rather than a float: money must not accumulate binary
 * rounding error. Nullable because the price is optional — a product with no
 * price recorded is different from one that costs zero.
 *
 * The CHECK is added with raw SQL: Knex's `table.check()` bindings expand
 * incorrectly inside `alterTable`, producing invalid SQL.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("products", (table) => {
    table.decimal("unit_price", 12, 2).nullable();
  });

  await knex.raw(
    `ALTER TABLE products
       ADD CONSTRAINT products_unit_price_non_negative
       CHECK (unit_price IS NULL OR unit_price >= 0)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE products DROP CONSTRAINT IF EXISTS products_unit_price_non_negative`,
  );

  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("unit_price");
  });
}
