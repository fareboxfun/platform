import { eq, desc } from "drizzle-orm";
import { db, ledgerEntriesTable } from "@workspace/db";
import { generateId } from "./id";

/** Get current balance for a user (latest balance_after or 0) */
export async function getCurrentBalance(userId: string): Promise<number> {
  const [last] = await db
    .select({ balanceAfter: ledgerEntriesTable.balanceAfter })
    .from(ledgerEntriesTable)
    .where(eq(ledgerEntriesTable.userId, userId))
    .orderBy(desc(ledgerEntriesTable.createdAt))
    .limit(1);

  return last ? parseFloat(last.balanceAfter) : 0;
}

/** Debit a user's balance. Returns new balance or throws if insufficient. */
export async function debitBalance(opts: {
  userId: string;
  amountUsd: number;
  description: string;
  refId?: string;
}): Promise<number> {
  const { userId, amountUsd, description, refId } = opts;

  // Read-compute-write in a transaction to be safe
  return await db.transaction(async (tx) => {
    const [last] = await tx
      .select({ balanceAfter: ledgerEntriesTable.balanceAfter })
      .from(ledgerEntriesTable)
      .where(eq(ledgerEntriesTable.userId, userId))
      .orderBy(desc(ledgerEntriesTable.createdAt))
      .limit(1)
      .for("update");

    const current = last ? parseFloat(last.balanceAfter) : 0;
    const newBalance = parseFloat((current - amountUsd).toFixed(8));

    if (newBalance < 0) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    await tx.insert(ledgerEntriesTable).values({
      id: generateId("led"),
      userId,
      type: "debit",
      amountUsd: (-amountUsd).toFixed(8),
      description,
      refId: refId ?? null,
      balanceAfter: newBalance.toFixed(8),
    });

    return newBalance;
  });
}
