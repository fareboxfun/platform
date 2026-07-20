import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const statusChecksTable = pgTable("status_checks", {
  id:        uuid("id").primaryKey().defaultRandom(),
  serviceId: text("service_id").notNull(),
  status:    text("status").notNull(),   // 'operational' | 'degraded' | 'down'
  latencyMs: integer("latency_ms"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StatusCheck = typeof statusChecksTable.$inferSelect;
