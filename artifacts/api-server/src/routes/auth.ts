import { Router, type IRouter } from "express";
import { randomBytes } from "crypto";
import { eq, and } from "drizzle-orm";
import { db, usersTable, authNoncesTable, sessionsTable } from "@workspace/db";
import {
  GetAuthNonceResponse,
  VerifyAuthBody,
  VerifyAuthResponse,
  GetMeResponse,
  LogoutResponse,
} from "@workspace/api-zod";
import { generateId } from "../lib/id";
import nacl from "tweetnacl";
import bs58 from "bs58";

const router: IRouter = Router();

// GET /auth/nonce
router.get("/auth/nonce", async (_req, res): Promise<void> => {
  const nonce = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min TTL

  await db.insert(authNoncesTable).values({ nonce, expiresAt });

  res.json(GetAuthNonceResponse.parse({ nonce, expiresAt: expiresAt.toISOString() }));
});

// POST /auth/verify
router.post("/auth/verify", async (req, res): Promise<void> => {
  const parsed = VerifyAuthBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { walletAddress, nonce, signature, message } = parsed.data;

  // Validate nonce
  const [nonceRow] = await db
    .select()
    .from(authNoncesTable)
    .where(and(eq(authNoncesTable.nonce, nonce), eq(authNoncesTable.used, false)));

  if (!nonceRow || new Date() > nonceRow.expiresAt) {
    res.status(401).json({ error: "Invalid or expired nonce" });
    return;
  }

  // ── ed25519 signature verification ────────────────────────────────────────
  // The client signs the SIWS message with the Solana wallet's private key.
  // We verify: sig is a valid ed25519 sig of the message under the wallet pubkey.
  if (signature && !signature.startsWith("stub-")) {
    try {
      // Decode base58 public key → 32 bytes
      const pubkeyBytes = bs58.decode(walletAddress);

      // Decode base64 signature → 64 bytes
      const sigBytes = Uint8Array.from(Buffer.from(signature, "base64"));

      // Reconstruct or use provided message
      const msgText = message ?? `farebox.fun wants you to sign in with your Solana account:\n${walletAddress}\n\nSign in to Farebox\n\nNonce: ${nonce}`;
      const msgBytes = new TextEncoder().encode(msgText);

      // Verify
      const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubkeyBytes);
      if (!valid) {
        res.status(401).json({ error: "Invalid signature" });
        return;
      }

      // Sanity: message must contain the nonce to prevent replay
      if (!msgText.includes(nonce)) {
        res.status(401).json({ error: "Nonce mismatch in message" });
        return;
      }
    } catch (err) {
      res.status(401).json({ error: "Signature verification failed" });
      return;
    }
  } else if (!signature || signature.startsWith("stub-")) {
    // Reject stub signatures in production
    if (process.env.NODE_ENV === "production") {
      res.status(401).json({ error: "Valid wallet signature required" });
      return;
    }
    // Dev only: allow stub sigs for testing without a real wallet
  }

  // Mark nonce used (after verification to prevent timing attacks)
  await db.update(authNoncesTable).set({ used: true }).where(eq(authNoncesTable.nonce, nonce));

  // Find or create user
  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.walletAddress, walletAddress));

  let isNew = false;
  if (!user) {
    const id = generateId("usr");
    const [created] = await db
      .insert(usersTable)
      .values({ id, walletAddress, status: "active" })
      .returning();
    user = created;
    isNew = true;
  }

  // Create session
  const sessionId = generateId("ses");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.insert(sessionsTable).values({ id: sessionId, userId: user.id, expiresAt });

  res.cookie("session_id", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: expiresAt,
  });

  res.json(
    VerifyAuthResponse.parse({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      isNew,
    })
  );
});

// POST /auth/logout
router.post("/auth/logout", async (req, res): Promise<void> => {
  const sessionId = req.cookies?.session_id as string | undefined;
  if (sessionId) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId)).catch(() => {});
    res.clearCookie("session_id");
  }
  res.json(LogoutResponse.parse({ success: true }));
});

// GET /auth/me
router.get("/auth/me", async (req, res): Promise<void> => {
  const sessionId = req.cookies?.session_id as string | undefined;
  if (!sessionId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  if (!session || new Date() > session.expiresAt) {
    res.clearCookie("session_id");
    res.status(401).json({ error: "Session expired" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(
    GetMeResponse.parse({
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    })
  );
});

export default router;
