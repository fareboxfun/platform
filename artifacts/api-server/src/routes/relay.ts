import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { requireAuth } from "../lib/session";
import { generateId } from "../lib/id";
import { logger } from "../lib/logger";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

// ── Ensure relay_nodes table exists ──────────────────────────────────────
db.execute(sql`
  CREATE TABLE IF NOT EXISTS relay_nodes (
    id              text        PRIMARY KEY,
    user_id         text        NOT NULL,
    wallet_address  text        NOT NULL,
    endpoint_url    text        NOT NULL,
    label           text        NOT NULL DEFAULT 'My Node',
    status          text        NOT NULL DEFAULT 'inactive',
    last_seen       timestamptz,
    total_routed    numeric(14,0) NOT NULL DEFAULT 0,
    total_earned_usd numeric(14,8) NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT NOW()
  )
`).catch(e => logger.warn({ e }, "relay_nodes table init"));

type AuthReq = Request & { userId: string };

// ── GET /relay/stats — public network stats ───────────────────────────────
router.get("/relay/stats", async (_req, res): Promise<void> => {
  try {
    const rows = await db.execute(sql`
      SELECT
        COUNT(*)            FILTER (WHERE status = 'active')  AS active_nodes,
        COUNT(*)                                               AS total_nodes,
        COALESCE(SUM(total_routed),       0)                  AS total_routed,
        COALESCE(SUM(total_earned_usd::numeric), 0)           AS total_earned
      FROM relay_nodes
    `);
    const s = (rows.rows ?? rows)[0] as any ?? {};
    res.json({
      activeNodes:  Number(s.active_nodes   ?? 0),
      totalNodes:   Number(s.total_nodes    ?? 0),
      totalRouted:  Number(s.total_routed   ?? 0),
      totalEarned:  Number(s.total_earned   ?? 0),
      marginShare:  0.80,
      payoutCycle:  "weekly",
    });
  } catch (e) {
    logger.warn({ e }, "relay stats error");
    res.json({ activeNodes: 0, totalNodes: 0, totalRouted: 0, totalEarned: 0, marginShare: 0.80, payoutCycle: "weekly" });
  }
});

// ── GET /relay/nodes — list active nodes (public) ────────────────────────
router.get("/relay/nodes", async (_req, res): Promise<void> => {
  try {
    const rows = await db.execute(sql`
      SELECT id, label, status, total_routed, total_earned_usd, last_seen, created_at
      FROM   relay_nodes
      WHERE  status = 'active'
      ORDER  BY total_routed DESC
      LIMIT  50
    `);
    res.json({ object: "list", data: rows.rows ?? rows });
  } catch (e) {
    logger.warn({ e }, "relay nodes list error");
    res.json({ object: "list", data: [] });
  }
});

// ── POST /relay/register — register a new relay node ─────────────────────
router.post("/relay/register", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthReq;
  const { walletAddress, endpointUrl, label } = req.body as {
    walletAddress?: string;
    endpointUrl?:   string;
    label?:         string;
  };

  if (!walletAddress || !endpointUrl) {
    res.status(400).json({ error: { message: "walletAddress and endpointUrl are required", code: "invalid_request" } });
    return;
  }

  try { new URL(endpointUrl); } catch {
    res.status(400).json({ error: { message: "endpointUrl must be a valid HTTPS URL", code: "invalid_url" } });
    return;
  }

  const id = generateId("rly");
  try {
    await db.execute(sql`
      INSERT INTO relay_nodes (id, user_id, wallet_address, endpoint_url, label)
      VALUES (${id}, ${userId}, ${walletAddress}, ${endpointUrl}, ${label ?? "My Node"})
    `);
    logger.info({ id, userId, walletAddress }, "relay node registered");
    res.status(201).json({
      id,
      walletAddress,
      endpointUrl,
      label:   label ?? "My Node",
      status:  "inactive",
      message: "Node registered. It becomes active once our verifier confirms your endpoint is reachable.",
    });
  } catch (e) {
    logger.error({ e }, "relay register error");
    res.status(500).json({ error: { message: "Registration failed", code: "internal_error" } });
  }
});

// ── POST /relay/heartbeat — keep node alive ───────────────────────────────
router.post("/relay/heartbeat", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthReq;
  const { nodeId }  = req.body as { nodeId?: string };

  if (!nodeId) {
    res.status(400).json({ error: { message: "nodeId required", code: "invalid_request" } });
    return;
  }

  try {
    await db.execute(sql`
      UPDATE relay_nodes
      SET    last_seen = NOW(), status = 'active'
      WHERE  id = ${nodeId} AND user_id = ${userId}
    `);
    res.json({ ok: true, lastSeen: new Date().toISOString() });
  } catch (e) {
    logger.error({ e }, "relay heartbeat error");
    res.status(500).json({ error: "heartbeat failed" });
  }
});

export default router;
