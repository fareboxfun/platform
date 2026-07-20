import { Router, type IRouter, type Request } from "express";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { db, usageEventsTable } from "@workspace/db";
import {
  GetUsageQueryParams,
  GetUsageResponse,
  GetUsageByModelQueryParams,
  GetUsageByModelResponse,
  GetUsageDailyQueryParams,
  GetUsageDailyResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();
router.use(requireAuth);

type AuthReq = Request & { userId: string };

// GET /usage
router.get("/usage", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const query = GetUsageQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  let conditions = [eq(usageEventsTable.userId, userId)];
  if (query.success && query.data.model) {
    conditions.push(eq(usageEventsTable.model, query.data.model));
  }
  if (query.success && query.data.from) {
    conditions.push(gte(usageEventsTable.createdAt, new Date(query.data.from)));
  }
  if (query.success && query.data.to) {
    conditions.push(lte(usageEventsTable.createdAt, new Date(query.data.to)));
  }

  const events = await db
    .select()
    .from(usageEventsTable)
    .where(and(...conditions))
    .orderBy(desc(usageEventsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usageEventsTable)
    .where(and(...conditions));

  res.json(
    GetUsageResponse.parse({
      events: events.map((e) => ({
        id: e.id,
        model: e.model,
        provider: e.provider,
        apiKeyId: e.apiKeyId,
        inputTokens: e.inputTokens,
        outputTokens: e.outputTokens,
        cachedTokens: e.cachedTokens,
        providerCostUsd: parseFloat(e.providerCostUsd),
        billedUsd: parseFloat(e.billedUsd),
        marginUsd: parseFloat(e.marginUsd),
        latencyMs: e.latencyMs,
        status: e.status,
        createdAt: e.createdAt.toISOString(),
      })),
      total: countRow?.count ?? 0,
    })
  );
});

// GET /usage/by-model
router.get("/usage/by-model", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const query = GetUsageByModelQueryParams.safeParse(req.query);
  const days = query.success ? (query.data.days ?? 30) : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      model: usageEventsTable.model,
      provider: usageEventsTable.provider,
      requestCount: sql<number>`count(*)::int`,
      totalInputTokens: sql<number>`sum(${usageEventsTable.inputTokens})::int`,
      totalOutputTokens: sql<number>`sum(${usageEventsTable.outputTokens})::int`,
      totalBilledUsd: sql<number>`sum(${usageEventsTable.billedUsd}::numeric)::float`,
    })
    .from(usageEventsTable)
    .where(and(eq(usageEventsTable.userId, userId), gte(usageEventsTable.createdAt, since)))
    .groupBy(usageEventsTable.model, usageEventsTable.provider)
    .orderBy(sql`sum(${usageEventsTable.billedUsd}::numeric) desc`);

  res.json(
    GetUsageByModelResponse.parse(
      rows.map((r) => ({
        model: r.model,
        provider: r.provider,
        requestCount: r.requestCount ?? 0,
        totalInputTokens: r.totalInputTokens ?? 0,
        totalOutputTokens: r.totalOutputTokens ?? 0,
        totalBilledUsd: r.totalBilledUsd ?? 0,
      }))
    )
  );
});

// GET /usage/daily
router.get("/usage/daily", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const query = GetUsageDailyQueryParams.safeParse(req.query);
  const days = query.success ? (query.data.days ?? 30) : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${usageEventsTable.createdAt})::date::text`,
      requestCount: sql<number>`count(*)::int`,
      totalBilledUsd: sql<number>`sum(${usageEventsTable.billedUsd}::numeric)::float`,
      totalTokens: sql<number>`sum(${usageEventsTable.inputTokens} + ${usageEventsTable.outputTokens})::int`,
    })
    .from(usageEventsTable)
    .where(and(eq(usageEventsTable.userId, userId), gte(usageEventsTable.createdAt, since)))
    .groupBy(sql`date_trunc('day', ${usageEventsTable.createdAt})::date`)
    .orderBy(sql`date_trunc('day', ${usageEventsTable.createdAt})::date asc`);

  res.json(
    GetUsageDailyResponse.parse(
      rows.map((r) => ({
        date: r.date,
        requestCount: r.requestCount ?? 0,
        totalBilledUsd: r.totalBilledUsd ?? 0,
        totalTokens: r.totalTokens ?? 0,
      }))
    )
  );
});

export default router;
