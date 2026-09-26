import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 config: replaces the datasource URL resolution that used to live
// implicitly in schema.prisma's `env("DATABASE_URL")` lookup at CLI-time.
//
// This uses `process.env.DATABASE_URL` (not Prisma's `env()` helper) with a
// fallback matching `.env.example`, because `env()` throws eagerly when the
// var is unset, which would break `prisma generate` (run via postinstall) on
// a fresh clone before `.env` exists. `prisma generate` never connects to
// this URL; only `db push`/`migrate` do, and those read the real `.env`.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/next_boilerplate",
  },
});
