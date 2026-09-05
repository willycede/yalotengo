import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("products", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("category_id")
      .notNullable()
      .references("id")
      .inTable("categories")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.string("photo_url").nullable();
    table.integer("stock").notNullable().defaultTo(0);
    table.string("location").nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index("category_id");
    table.check("?? >= 0", ["stock"], "products_stock_non_negative");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("products");
}
