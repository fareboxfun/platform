import { Router, type IRouter, type Request } from "express";
import { eq, count, desc } from "drizzle-orm";
import { db, ledgerEntriesTable } from "@workspace/db";
import {
  GetBalanceResponse,
  GetLedgerQueryParams,
  GetLedgerResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();
router.use(requireAuth);

type AuthReq = Request & { userId: string };

// GET /balance
router.get("/balance", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;

  const entries = await db
    .select()
    .from(ledgerEntriesTable)
    .where(eq(ledgerEntriesTable.userId, userId));

  let balanceUsd = 0;
  let totalTopupUsd = 0;
  let totalSpentUsd = 0;
  let lastUpdated: Date | null = null;

  for (const e of entries) {
    const amt = parseFloat(e.amountUsd);
    if (e.type === "topup" || e.type === "refund" || e.type === "adjustment") {
      if (amt > 0) totalTopupUsd += amt;
    }
    if (e.type === "debit") {
      totalSpentUsd += Math.abs(amt);
    }
    if (!lastUpdated || e.createdAt > lastUpdated) lastUpdated = e.createdAt;
  }

  // Balance from most recent entry
  if (entries.length > 0) {
    const sorted = [...entries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    balanceUsd = parseFloat(sorted[0].balanceAfter);
  }

  res.json(
    GetBalanceResponse.parse({
      balanceUsd,
      totalTopupUsd,
      totalSpentUsd,
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : new Date().toISOString(),
    })
  );
});

// GET /balance/ledger
router.get("/balance/ledger", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const query = GetLedgerQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  const entries = await db
    .select()
    .from(ledgerEntriesTable)
    .where(eq(ledgerEntriesTable.userId, userId))
    .orderBy(desc(ledgerEntriesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const total = (
    await db
      .select({ count: count(ledgerEntriesTable.id) })
      .from(ledgerEntriesTable)
      .where(eq(ledgerEntriesTable.userId, userId))
  )[0];

  res.json(
    GetLedgerResponse.parse({
      entries: entries.map((e) => ({
        id: e.id,
        type: e.type,
        amountUsd: parseFloat(e.amountUsd),
        description: e.description,
        refId: e.refId,
        balanceAfter: parseFloat(e.balanceAfter),
        createdAt: e.createdAt.toISOString(),
      })),
      total: entries.length,
    })
  );
});

export default router;
