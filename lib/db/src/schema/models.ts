import { pgTable, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const modelsTable = pgTable("models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  description: text("description"),
  contextWindow: integer("context_window"),
  inputPerMtokUsd: numeric("input_per_mtok_usd", { precision: 10, scale: 6 }).notNull(),
  outputPerMtokUsd: numeric("output_per_mtok_usd", { precision: 10, scale: 6 }).notNull(),
  markupPct: numeric("markup_pct", { precision: 5, scale: 2 }).notNull().default("15"),
  supportsStreaming: boolean("supports_streaming").notNull().default(true),
  supportsTools: boolean("supports_tools").notNull().default(false),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull().defaultNow(),
});

export type Model = typeof modelsTable.$inferSelect;
