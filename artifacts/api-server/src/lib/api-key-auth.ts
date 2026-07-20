import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db, apiKeysTable, usersTable, sessionsTable } from "@workspace/db";
import type { Request, Response, NextFunction } from "express";

export type ApiKeyRequest = Request & {
  gkUserId: string;
  gkApiKeyId: string | null; // null when authenticated via session
  gkKey: typeof apiKeysTable.$inferSelect | null;
};

function errJson(res: Response, status: number, msg: string, code: string) {
  res.status(status).json({
    error: { message: msg, type: "invalid_request_error", code },
  });
}

/**
 * Accepts either:
 *   Authorization: Bearer sk-fbx-<key>  — API key auth
 *   Cookie: session_id=<id>             — session auth (for the in-dashboard playground)
 */
export async function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const auth = req.headers.authorization;

  // ── API key path ──────────────────────────────────────────────────────────
  if (auth?.startsWith("Bearer ")) {
    const raw = auth.slice(7).trim();
    if (!raw.startsWith("sk-fbx-")) {
      errJson(res, 401, "Invalid API key format.", "invalid_api_key");
      return;
    }

    const keyHash = createHash("sha256").update(raw).digest("hex");
    const [key] = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.keyHash, keyHash));

    if (!key || key.status !== "active") {
      errJson(res, 401, "Invalid or revoked API key.", "invalid_api_key");
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, key.userId));

    if (!user || user.status !== "active") {
      errJson(res, 403, "Account suspended.", "account_suspended");
      return;
    }

    const r = req as ApiKeyRequest;
    r.gkUserId = key.userId;
    r.gkApiKeyId = key.id;
    r.gkKey = key;
    next();
    return;
  }

  // ── Session cookie path (playground) ─────────────────────────────────────
  const sessionId = req.cookies?.session_id as string | undefined;
  if (sessionId) {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, sessionId));

    if (!session || new Date() > session.expiresAt) {
      errJson(res, 401, "Session expired.", "session_expired");
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));

    if (!user || user.status !== "active") {
      errJson(res, 403, "Account suspended.", "account_suspended");
      return;
    }

    const r = req as ApiKeyRequest;
    r.gkUserId = user.id;
    r.gkApiKeyId = null;
    r.gkKey = null;
    next();
    return;
  }

  errJson(res, 401, "Missing Authorization header. Expected: Bearer <api-key>", "missing_api_key");
}
