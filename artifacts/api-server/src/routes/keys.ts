import { Router, type IRouter, type Request } from "express";
import { createHash, randomBytes } from "crypto";
import { eq, and } from "drizzle-orm";
import { db, apiKeysTable } from "@workspace/db";
import {
  ListApiKeysResponse,
  CreateApiKeyBody,
  CreateApiKeyResponse,
  RevokeApiKeyParams,
  RevokeApiKeyResponse,
  UpdateApiKeyParams,
  UpdateApiKeyBody,
  UpdateApiKeyResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/session";
import { generateId } from "../lib/id";

const router: IRouter = Router();

router.use(requireAuth);

type AuthReq = Request & { userId: string };

// GET /keys
router.get("/keys", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const keys = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.userId, userId))
    .orderBy(apiKeysTable.createdAt);

  res.json(
    ListApiKeysResponse.parse(
      keys.map((k) => ({
        id: k.id,
        label: k.label,
        prefix: k.prefix,
        status: k.status,
        dailyCapUsd: k.dailyCapUsd ? parseFloat(k.dailyCapUsd) : null,
        monthlyCapUsd: k.monthlyCapUsd ? parseFloat(k.monthlyCapUsd) : null,
        rateLimitRpm: k.rateLimitRpm,
        allowedModels: k.allowedModels ?? [],
        createdAt: k.createdAt.toISOString(),
        revokedAt: k.revokedAt ? k.revokedAt.toISOString() : null,
      }))
    )
  );
});

// POST /keys
router.post("/keys", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const parsed = CreateApiKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const raw = `sk-fbx-${randomBytes(32).toString("base64url")}`;
  const prefix = raw.substring(0, 12);
  const keyHash = createHash("sha256").update(raw).digest("hex");
  const id = generateId("key");

  const [key] = await db
    .insert(apiKeysTable)
    .values({
      id,
      userId,
      keyHash,
      prefix,
      label: parsed.data.label,
      status: "active",
      dailyCapUsd: parsed.data.dailyCapUsd != null ? String(parsed.data.dailyCapUsd) : null,
      monthlyCapUsd: parsed.data.monthlyCapUsd != null ? String(parsed.data.monthlyCapUsd) : null,
      rateLimitRpm: parsed.data.rateLimitRpm ?? null,
      allowedModels: parsed.data.allowedModels ?? [],
    })
    .returning();

  res.status(201).json(
    CreateApiKeyResponse.parse({
      apiKey: {
        id: key.id,
        label: key.label,
        prefix: key.prefix,
        status: key.status,
        dailyCapUsd: key.dailyCapUsd ? parseFloat(key.dailyCapUsd) : null,
        monthlyCapUsd: key.monthlyCapUsd ? parseFloat(key.monthlyCapUsd) : null,
        rateLimitRpm: key.rateLimitRpm,
        allowedModels: key.allowedModels ?? [],
        createdAt: key.createdAt.toISOString(),
        revokedAt: null,
      },
      rawKey: raw,
    })
  );
});

// DELETE /keys/:id
router.delete("/keys/:id", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RevokeApiKeyParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [key] = await db
    .update(apiKeysTable)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(and(eq(apiKeysTable.id, params.data.id), eq(apiKeysTable.userId, userId)))
    .returning();

  if (!key) {
    res.status(404).json({ error: "Key not found" });
    return;
  }

  res.json(RevokeApiKeyResponse.parse({ success: true }));
});

// PATCH /keys/:id
router.patch("/keys/:id", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateApiKeyParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateApiKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.label !== undefined) updates.label = parsed.data.label;
  if (parsed.data.dailyCapUsd !== undefined)
    updates.dailyCapUsd = parsed.data.dailyCapUsd != null ? String(parsed.data.dailyCapUsd) : null;
  if (parsed.data.monthlyCapUsd !== undefined)
    updates.monthlyCapUsd = parsed.data.monthlyCapUsd != null ? String(parsed.data.monthlyCapUsd) : null;
  if (parsed.data.rateLimitRpm !== undefined) updates.rateLimitRpm = parsed.data.rateLimitRpm;

  const [key] = await db
    .update(apiKeysTable)
    .set(updates)
    .where(and(eq(apiKeysTable.id, params.data.id), eq(apiKeysTable.userId, userId)))
    .returning();

  if (!key) {
    res.status(404).json({ error: "Key not found" });
    return;
  }

  res.json(
    UpdateApiKeyResponse.parse({
      id: key.id,
      label: key.label,
      prefix: key.prefix,
      status: key.status,
      dailyCapUsd: key.dailyCapUsd ? parseFloat(key.dailyCapUsd) : null,
      monthlyCapUsd: key.monthlyCapUsd ? parseFloat(key.monthlyCapUsd) : null,
      rateLimitRpm: key.rateLimitRpm,
      allowedModels: key.allowedModels ?? [],
      createdAt: key.createdAt.toISOString(),
      revokedAt: key.revokedAt ? key.revokedAt.toISOString() : null,
    })
  );
});

export default router;
