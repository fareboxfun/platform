import { Router, type IRouter, type Request } from "express";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { db, usageEventsTable, apiKeysTable, ledgerEntriesTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();
router.use(requireAuth);

type AuthReq = Request & { userId: string };

// GET /dashboard/summary
router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayStats] = await db
    .select({
      requestCount: sql<number>`count(*)::int`,
      totalBilledUsd: sql<number>`coalesce(sum(${usageEventsTable.billedUsd}::numeric), 0)::float`,
    })
    .from(usageEventsTable)
    .where(and(eq(usageEventsTable.userId, userId), gte(usageEventsTable.createdAt, todayStart)));

  const [monthStats] = await db
    .select({
      requestCount: sql<number>`count(*)::int`,
      totalBilledUsd: sql<number>`coalesce(sum(${usageEventsTable.billedUsd}::numeric), 0)::float`,
    })
    .from(usageEventsTable)
    .where(and(eq(usageEventsTable.userId, userId), gte(usageEventsTable.createdAt, monthStart)));

  const [topModelRow] = await db
    .select({
      model: usageEventsTable.model,
      cnt: sql<number>`count(*)::int`,
    })
    .from(usageEventsTable)
    .where(and(eq(usageEventsTable.userId, userId), gte(usageEventsTable.createdAt, todayStart)))
    .groupBy(usageEventsTable.model)
    .orderBy(sql`count(*) desc`)
    .limit(1);

  const [activeKeyRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(apiKeysTable)
    .where(and(eq(apiKeysTable.userId, userId), eq(apiKeysTable.status, "active")));

  // Get current balance from most recent ledger entry
  const [latestLedger] = await db
    .select({ balanceAfter: ledgerEntriesTable.balanceAfter })
    .from(ledgerEntriesTable)
    .where(eq(ledgerEntriesTable.userId, userId))
    .orderBy(sql`${ledgerEntriesTable.createdAt} desc`)
    .limit(1);

  const balanceUsd = latestLedger ? parseFloat(latestLedger.balanceAfter) : 0;
  const totalRequestsToday = todayStats?.requestCount ?? 0;
  const totalSpentToday = todayStats?.totalBilledUsd ?? 0;
  const totalRequestsMonth = monthStats?.requestCount ?? 0;
  const totalSpentMonth = monthStats?.totalBilledUsd ?? 0;
  const activeKeyCount = activeKeyRow?.count ?? 0;
  const avgCostPerRequest = totalRequestsMonth > 0 ? totalSpentMonth / totalRequestsMonth : 0;

  res.json(
    GetDashboardSummaryResponse.parse({
      balanceUsd,
      totalRequestsToday,
      totalSpentToday,
      totalRequestsMonth,
      totalSpentMonth,
      activeKeyCount,
      topModelToday: topModelRow?.model ?? null,
      avgCostPerRequest,
    })
  );
});

export default router;
