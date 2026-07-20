import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, modelsTable, usageEventsTable } from "@workspace/db";
import { requireApiKey, type ApiKeyRequest } from "../lib/api-key-auth";
import { requireApiKeyOrX402 } from "../lib/x402";
import { getCurrentBalance, debitBalance } from "../lib/balance-helper";
import { checkRateLimit } from "../lib/rate-limiter";
import { streamCompletion, type GatewayRequest } from "../lib/providers";
import { generateId } from "../lib/id";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ─── GET /v1/models ──────────────────────────────────────────────────────────
// Public — no API key required, returns OpenAI-compatible model list
router.get("/models", async (_req, res): Promise<void> => {
  const models = await db.select().from(modelsTable);
  res.json({
    object: "list",
    data: models.map((m) => ({
      id: m.id,
      object: "model",
      created: Math.floor(m.effectiveFrom.getTime() / 1000),
      owned_by: m.provider,
    })),
  });
});

// ─── POST /v1/chat/completions ───────────────────────────────────────────────
router.post("/chat/completions", requireApiKeyOrX402, async (req: Request, res: Response): Promise<void> => {
  const gkReq = req as ApiKeyRequest;
  const { gkUserId, gkApiKeyId, gkKey } = gkReq;
  const isX402 = !!(req as Request & { x402Verified?: boolean }).x402Verified;
  const requestId = generateId();

  // 1. Parse body
  const body = req.body as GatewayRequest;
  if (!body.model || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: { message: "model and messages are required", code: "invalid_request" } });
    return;
  }

  // 2. Rate limit (only for API key auth; session/playground gets a default 60 RPM)
  const rateLimitId = gkApiKeyId ?? `session:${gkUserId}`;
  const rateLimitRpm = gkKey?.rateLimitRpm ?? 60;
  if (!checkRateLimit(rateLimitId, rateLimitRpm)) {
    res.status(429).json({ error: { message: "Rate limit exceeded", code: "rate_limit_exceeded" } });
    return;
  }

  // 3. Look up model
  const [model] = await db.select().from(modelsTable).where(eq(modelsTable.id, body.model));
  if (!model) {
    res.status(404).json({ error: { message: `Model '${body.model}' not found`, code: "model_not_found" } });
    return;
  }

  // 4. Check allowed models on key (skip for session auth)
  if (gkKey && gkKey.allowedModels.length > 0 && !gkKey.allowedModels.includes(body.model)) {
    res.status(403).json({ error: { message: `Model '${body.model}' not allowed for this key`, code: "model_not_permitted" } });
    return;
  }

  // 4b. Enforce per-key daily / monthly spending caps
  if (gkKey && gkApiKeyId && (gkKey.dailyCapUsd != null || gkKey.monthlyCapUsd != null)) {
    const now = new Date();
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [caps] = await db
      .select({
        spentDay:   sql<string>`coalesce(sum(case when ${usageEventsTable.createdAt} >= ${startOfDay}   then ${usageEventsTable.billedUsd}::numeric else 0 end), 0)`,
        spentMonth: sql<string>`coalesce(sum(case when ${usageEventsTable.createdAt} >= ${startOfMonth} then ${usageEventsTable.billedUsd}::numeric else 0 end), 0)`,
      })
      .from(usageEventsTable)
      .where(and(eq(usageEventsTable.apiKeyId, gkApiKeyId), eq(usageEventsTable.status, "success")));

    if (gkKey.dailyCapUsd != null && parseFloat(caps.spentDay) >= gkKey.dailyCapUsd) {
      res.status(429).json({ error: { message: `Daily spending cap of ${gkKey.dailyCapUsd} reached for this key.`, code: "budget_exceeded" } });
      return;
    }
    if (gkKey.monthlyCapUsd != null && parseFloat(caps.spentMonth) >= gkKey.monthlyCapUsd) {
      res.status(429).json({ error: { message: `Monthly spending cap of ${gkKey.monthlyCapUsd} reached for this key.`, code: "budget_exceeded" } });
      return;
    }
  }

  // 5. Check balance (skip for x402 — user already paid on-chain)
  if (!isX402) {
    const balance = await getCurrentBalance(gkUserId);
    if (balance < 0.001) {
      res.status(402).json({ error: { message: "Insufficient balance. Top up your Farebox account to continue.", code: "insufficient_balance" } });
      return;
    }
  }

  const stream = body.stream !== false; // default to streaming

  // 6. Set SSE headers for streaming
  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
  }

  const startMs = Date.now();
  let inputTokens = 0;
  let outputTokens = 0;
  let providerError: string | null = null;

  try {
    const gen = streamCompletion(model, body, requestId);

    for await (const chunk of gen) {
      if ("text" in chunk) {
        if (stream) res.write(chunk.text);
      } else if ("usage" in chunk) {
        inputTokens = chunk.usage.inputTokens;
        outputTokens = chunk.usage.outputTokens;
      } else if ("done" in chunk) {
        if (stream) {
          res.write("data: [DONE]\n\n");
          res.end();
        }
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    providerError = msg;
    logger.error({ requestId, model: body.model, err: msg }, "Gateway provider error");

    if (stream) {
      // Send error as SSE then close
      const errChunk = {
        error: { message: msg, code: "provider_error" },
      };
      res.write(`data: ${JSON.stringify(errChunk)}\n\n`);
      res.end();
    } else {
      res.status(502).json({ error: { message: msg, code: "provider_error" } });
    }
  }

  // 7. Bill and log (even on partial success)
  const latencyMs = Date.now() - startMs;
  const inputPerMtok = parseFloat(model.inputPerMtokUsd);
  const outputPerMtok = parseFloat(model.outputPerMtokUsd);
  const markup = parseFloat(model.markupPct) / 100;

  const providerCostUsd =
    (inputTokens / 1_000_000) * inputPerMtok +
    (outputTokens / 1_000_000) * outputPerMtok;
  const billedUsd = providerCostUsd * (1 + markup);
  const marginUsd = billedUsd - providerCostUsd;

  const status = providerError ? "error" : "success";

  // Log usage event regardless
  const usageId = generateId("usg");
  await db.insert(usageEventsTable).values({
    id: usageId,
    userId: gkUserId,
    apiKeyId: gkApiKeyId ?? null,
    model: model.id,
    provider: model.provider,
    inputTokens,
    outputTokens,
    cachedTokens: 0,
    providerCostUsd: providerCostUsd.toFixed(8),
    billedUsd: billedUsd.toFixed(8),
    marginUsd: marginUsd.toFixed(8),
    latencyMs,
    status,
    estimated: false,
  }).catch((e) => logger.error({ e }, "Failed to insert usage event"));

  // Debit ledger only on success with actual tokens (skip for x402 — on-chain payment covers cost)
  if (!isX402 && status === "success" && billedUsd > 0) {
    await debitBalance({
      userId: gkUserId,
      amountUsd: billedUsd,
      description: `${model.id} · ${inputTokens}in ${outputTokens}out`,
      refId: usageId,
    }).catch((e) => {
      logger.error({ e }, "Failed to debit balance after successful request");
    });
  }
});

export default router;
