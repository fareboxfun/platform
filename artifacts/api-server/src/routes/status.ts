import { Router, type IRouter } from "express";
import { desc, gte, eq, sql } from "drizzle-orm";
import { db, statusChecksTable } from "@workspace/db";

const router: IRouter = Router();

/* ── services definition ────────────────────────────── */
const SERVICES = [
  {
    id: "farebox-website",
    name: "Farebox Website",
    tag: "FRONTEND",
    description: "Landing, dashboard, playground",
    domain: "farebox.fun",
    check: async (): Promise<{ ok: boolean; latencyMs: number }> => {
      const t0 = Date.now();
      try {
        const r = await fetch("https://farebox.fun", {
          signal: AbortSignal.timeout(6000),
        });
        return { ok: r.status < 500, latencyMs: Date.now() - t0 };
      } catch {
        return { ok: false, latencyMs: Date.now() - t0 };
      }
    },
  },
  {
    id: "farebox-api",
    name: "API Server",
    tag: "REST",
    description: "Keys, billing, auth, usage",
    domain: "api.farebox.fun",
    check: async (): Promise<{ ok: boolean; latencyMs: number }> => {
      const t0 = Date.now();
      try {
        const r = await fetch("http://localhost:8080/api/healthz", {
          signal: AbortSignal.timeout(5000),
        });
        return { ok: r.status < 400, latencyMs: Date.now() - t0 };
      } catch {
        return { ok: false, latencyMs: Date.now() - t0 };
      }
    },
  },
  {
    id: "llm-gateway",
    name: "LLM Gateway",
    tag: "INFERENCE",
    description: "Model routing, streaming completions",
    domain: "api.farebox.fun/v1",
    check: async (): Promise<{ ok: boolean; latencyMs: number }> => {
      const t0 = Date.now();
      try {
        const r = await fetch("http://localhost:8080/api/models", {
          signal: AbortSignal.timeout(5000),
        });
        return { ok: r.status < 400, latencyMs: Date.now() - t0 };
      } catch {
        return { ok: false, latencyMs: Date.now() - t0 };
      }
    },
  },
  {
    id: "helius-webhooks",
    name: "Helius Webhooks",
    tag: "DEPOSITS",
    description: "USDC deposit listener, Solana tx relay",
    domain: "api.farebox.fun/webhooks",
    check: async (): Promise<{ ok: boolean; latencyMs: number }> => {
      const t0 = Date.now();
      try {
        // Helius RPC — ping via getVersion
        const r = await fetch(
          `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY ?? ""}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getVersion" }),
            signal: AbortSignal.timeout(6000),
          }
        );
        const json = await r.json();
        return { ok: !!json?.result?.["solana-core"], latencyMs: Date.now() - t0 };
      } catch {
        return { ok: false, latencyMs: Date.now() - t0 };
      }
    },
  },
  {
    id: "solana-rpc",
    name: "Solana RPC",
    tag: "CHAIN",
    description: "Mainnet — USDC settlement layer",
    domain: "mainnet-beta.solana.com",
    check: async (): Promise<{ ok: boolean; latencyMs: number }> => {
      const t0 = Date.now();
      try {
        const r = await fetch("https://api.mainnet-beta.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" }),
          signal: AbortSignal.timeout(6000),
        });
        const json = await r.json();
        return { ok: json?.result === "ok", latencyMs: Date.now() - t0 };
      } catch {
        return { ok: false, latencyMs: Date.now() - t0 };
      }
    },
  },
  {
    id: "platform-metrics",
    name: "Platform Metrics",
    tag: "TELEMETRY",
    description: "Live usage aggregation pipeline",
    domain: "api.farebox.fun/platform",
    check: async (): Promise<{ ok: boolean; latencyMs: number }> => {
      const t0 = Date.now();
      try {
        const r = await fetch("http://localhost:8080/api/platform/metrics", {
          signal: AbortSignal.timeout(5000),
        });
        return { ok: r.status < 400, latencyMs: Date.now() - t0 };
      } catch {
        return { ok: false, latencyMs: Date.now() - t0 };
      }
    },
  },
];

/* ── GET /status  (public) ─────────────────────────── */
router.get("/status", async (_req, res): Promise<void> => {
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const since1h  = new Date(Date.now() - 60 * 60 * 1000);

  // Run all live checks in parallel
  const liveResults = await Promise.all(
    SERVICES.map(async (svc) => {
      const { ok, latencyMs } = await svc.check();
      const status = ok
        ? latencyMs > 3000 ? "degraded" : "operational"
        : "down";
      return { id: svc.id, status, latencyMs };
    })
  );

  // Persist each check (skip if checked in last hour to avoid flood)
  const recentIds = await db
    .select({ serviceId: statusChecksTable.serviceId })
    .from(statusChecksTable)
    .where(gte(statusChecksTable.checkedAt, since1h));

  const recentSet = new Set(recentIds.map((r) => r.serviceId));

  await Promise.all(
    liveResults
      .filter((r) => !recentSet.has(r.id))
      .map((r) =>
        db.insert(statusChecksTable).values({
          serviceId: r.id,
          status:    r.status,
          latencyMs: r.latencyMs,
        })
      )
  );

  // Fetch 90-day daily history per service
  const historyRows = await db
    .select({
      serviceId: statusChecksTable.serviceId,
      day: sql<string>`date_trunc('day', ${statusChecksTable.checkedAt})::date::text`,
      status: sql<string>`
        CASE
          WHEN bool_or(${statusChecksTable.status} = 'down')     THEN 'down'
          WHEN bool_or(${statusChecksTable.status} = 'degraded') THEN 'degraded'
          ELSE 'operational'
        END
      `,
    })
    .from(statusChecksTable)
    .where(gte(statusChecksTable.checkedAt, since90))
    .groupBy(
      statusChecksTable.serviceId,
      sql`date_trunc('day', ${statusChecksTable.checkedAt})::date`
    )
    .orderBy(sql`date_trunc('day', ${statusChecksTable.checkedAt})::date asc`);

  // Compute uptime % per service (all-time based on records we have)
  const uptimeRows = await db
    .select({
      serviceId: statusChecksTable.serviceId,
      total:  sql<number>`count(*)::int`,
      upDays: sql<number>`count(*) filter (where ${statusChecksTable.status} = 'operational')::int`,
    })
    .from(statusChecksTable)
    .where(gte(statusChecksTable.checkedAt, since90))
    .groupBy(statusChecksTable.serviceId);

  const uptimeMap = Object.fromEntries(
    uptimeRows.map((r) => [
      r.serviceId,
      r.total > 0 ? ((r.upDays / r.total) * 100).toFixed(2) : "100.00",
    ])
  );

  const historyByService: Record<string, { day: string; status: string }[]> = {};
  for (const row of historyRows) {
    if (!historyByService[row.serviceId]) historyByService[row.serviceId] = [];
    historyByService[row.serviceId].push({ day: row.day, status: row.status });
  }

  const liveMap = Object.fromEntries(liveResults.map((r) => [r.id, r]));

  const services = SERVICES.map((svc) => {
    const live = liveMap[svc.id];
    return {
      id:          svc.id,
      name:        svc.name,
      description: svc.description,
      domain:      svc.domain,
      status:      live.status,
      latencyMs:   live.latencyMs,
      uptimePct:   uptimeMap[svc.id] ?? "100.00",
      history:     historyByService[svc.id] ?? [],
    };
  });

  const overall = services.every((s) => s.status === "operational")
    ? "operational"
    : services.some((s) => s.status === "down")
      ? "down"
      : "degraded";

  res.json({ overall, checkedAt: new Date().toISOString(), services });
});

export default router;
