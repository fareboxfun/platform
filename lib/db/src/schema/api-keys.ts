import { pgTable, text, timestamp, numeric, integer, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const keyStatusEnum = pgEnum("key_status", ["active", "revoked"]);

export const apiKeysTable = pgTable("api_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  keyHash: text("key_hash").notNull().unique(),
  prefix: text("prefix").notNull(),
  label: text("label").notNull(),
  status: keyStatusEnum("status").notNull().default("active"),
  dailyCapUsd: numeric("daily_cap_usd", { precision: 12, scale: 6 }),
  monthlyCapUsd: numeric("monthly_cap_usd", { precision: 12, scale: 6 }),
  rateLimitRpm: integer("rate_limit_rpm"),
  allowedModels: text("allowed_models").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

export const insertApiKeySchema = createInsertSchema(apiKeysTable).omit({ createdAt: true });
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeysTable.$inferSelect;
