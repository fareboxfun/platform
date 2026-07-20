/**
 * POST /api/webhooks/helius
 *
 * Receives Enhanced Transaction webhooks from Helius when USDC arrives
 * at the platform deposit address. Matches sender → user by wallet_address,
 * creates a payment record, and credits the user's ledger.
 *
 * USDC mint (mainnet): EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
 */

import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, paymentsTable, ledgerEntriesTable } from "@workspace/db";
import { generateId } from "../lib/id";
import { logger } from "../lib/logger";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const DEPOSIT_ADDRESS = process.env.DEPOSIT_WALLET_ADDRESS ?? "";
const WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET ?? "";

const router: IRouter = Router();

router.post("/webhooks/helius", async (req, res): Promise<void> => {
  // 1. Verify auth header (Helius sends our secret as the Authorization header)
  const authHeader = req.headers.authorization ?? req.headers["helius-auth"] ?? "";
  if (WEBHOOK_SECRET && authHeader !== WEBHOOK_SECRET) {
    logger.warn({ authHeader: authHeader?.slice(0, 8) }, "Helius webhook auth mismatch");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const events = Array.isArray(req.body) ? req.body : [req.body];
  logger.info({ count: events.length }, "Helius webhook received");

  for (const event of events) {
    try {
      await processEvent(event);
    } catch (err) {
      logger.error({ err, signature: event?.signature }, "Failed to process Helius event");
    }
  }

  res.json({ ok: true });
});

async function processEvent(event: Record<string, unknown>): Promise<void> {
  const signature = event.signature as string | undefined;
  if (!signature) return;

  // Guard: skip if transaction errored
  if (event.transactionError) {
    logger.info({ signature }, "Skipping errored transaction");
    return;
  }

  // Find a USDC token transfer to our deposit address
  const tokenTransfers = (event.tokenTransfers as any[]) ?? [];
  const usdcTransfer = tokenTransfers.find(
    (t) =>
      t.mint === USDC_MINT &&
      t.toUserAccount?.toLowerCase() === DEPOSIT_ADDRESS.toLowerCase() &&
      t.tokenAmount > 0
  );

  if (!usdcTransfer) {
    logger.debug({ signature }, "No relevant USDC transfer found");
    return;
  }

  const amountUsdc: number = usdcTransfer.tokenAmount;
  const senderAddress: string = usdcTransfer.fromUserAccount ?? event.feePayer;

  if (!senderAddress || amountUsdc <= 0) return;

  logger.info({ signature, senderAddress, amountUsdc }, "USDC deposit detected");

  // Deduplicate: skip if we already processed this tx
  const existing = await db
    .select({ id: paymentsTable.id })
    .from(paymentsTable)
    .where(eq(paymentsTable.txSignature, signature))
    .limit(1);

  if (existing.length > 0) {
    logger.info({ signature }, "Transaction already processed, skipping");
    return;
  }

  // Match sender wallet address → user
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.walletAddress, senderAddress));

  if (!user) {
    logger.warn({ senderAddress, signature }, "No user found for sender wallet — deposit uncredited");
    return;
  }

  const amountUsd = amountUsdc; // 1:1 USDC:USD

  // Insert payment record (pending → confirmed atomically)
  const paymentId = generateId("pay");

  await db.transaction(async (tx) => {
    // Create confirmed payment
    await tx.insert(paymentsTable).values({
      id: paymentId,
      userId: user.id,
      method: "usdc_topup",
      amountUsdc: String(amountUsdc),
      amountUsd: String(amountUsd),
      chain: "solana",
      txSignature: signature,
      depositAddress: DEPOSIT_ADDRESS,
      memo: null,
      status: "confirmed",
    });

    // Get current balance
    const [last] = await tx
      .select({ balanceAfter: ledgerEntriesTable.balanceAfter })
      .from(ledgerEntriesTable)
      .where(eq(ledgerEntriesTable.userId, user.id))
      .orderBy(desc(ledgerEntriesTable.createdAt))
      .limit(1)
      .for("update");

    const currentBalance = last ? parseFloat(last.balanceAfter) : 0;
    const newBalance = parseFloat((currentBalance + amountUsd).toFixed(6));

    // Credit ledger
    await tx.insert(ledgerEntriesTable).values({
      id: generateId("led"),
      userId: user.id,
      type: "topup",
      amountUsd: String(amountUsd),
      description: `USDC deposit · ${amountUsdc} USDC`,
      refId: paymentId,
      balanceAfter: String(newBalance),
    });
  });

  logger.info({ userId: user.id, amountUsdc, signature }, "USDC deposit credited successfully");
}

export default router;
