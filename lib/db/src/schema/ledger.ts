import { pgTable, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ledgerTypeEnum = pgEnum("ledger_type", ["topup", "debit", "refund", "adjustment"]);

export const ledgerEntriesTable = pgTable("ledger_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  type: ledgerTypeEnum("type").notNull(),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 6 }).notNull(),
  description: text("description"),
  refId: text("ref_id"),
  balanceAfter: numeric("balance_after", { precision: 12, scale: 6 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLedgerEntrySchema = createInsertSchema(ledgerEntriesTable).omit({ createdAt: true });
export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
export type LedgerEntry = typeof ledgerEntriesTable.$inferSelect;
