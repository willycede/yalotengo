require("dotenv/config");

/**
 * Production Knex config.
 *
 * `knexfile.ts` needs ts-node, which is a devDependency and gets pruned on a
 * production install — running migrations with it on the server would fail.
 * This plain-CommonJS config points at the migrations already compiled into
 * dist/ by `npm run build`, so no TypeScript toolchain is needed at runtime.
 */
module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: "./dist/db/migrations",
    extension: "js",
  },
  seeds: {
    directory: "./dist/db/seeds",
    extension: "js",
  },
};
