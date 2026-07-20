import { pgTable, text, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { apiKeysTable } from "./api-keys";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usageEventsTable = pgTable("usage_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  apiKeyId: text("api_key_id").references(() => apiKeysTable.id),
  model: text("model").notNull(),
  provider: text("provider").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  cachedTokens: integer("cached_tokens").notNull().default(0),
  providerCostUsd: numeric("provider_cost_usd", { precision: 12, scale: 8 }).notNull().default("0"),
  billedUsd: numeric("billed_usd", { precision: 12, scale: 8 }).notNull().default("0"),
  marginUsd: numeric("margin_usd", { precision: 12, scale: 8 }).notNull().default("0"),
  latencyMs: integer("latency_ms"),
  status: text("status").notNull().default("success"),
  estimated: boolean("estimated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUsageEventSchema = createInsertSchema(usageEventsTable).omit({ createdAt: true });
export type InsertUsageEvent = z.infer<typeof insertUsageEventSchema>;
export type UsageEvent = typeof usageEventsTable.$inferSelect;
