import { pgTable, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentMethodEnum = pgEnum("payment_method", ["usdc_topup", "x402"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "confirmed", "failed"]);

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  method: paymentMethodEnum("method").notNull(),
  amountUsdc: numeric("amount_usdc", { precision: 12, scale: 6 }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 6 }).notNull(),
  chain: text("chain"),
  txSignature: text("tx_signature"),
  depositAddress: text("deposit_address"),
  memo: text("memo"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
