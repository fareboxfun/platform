import { Router, type IRouter, type Request } from "express";
import { eq, desc } from "drizzle-orm";
import { db, paymentsTable } from "@workspace/db";
import {
  ListPaymentsQueryParams,
  ListPaymentsResponse,
  CreateTopupBody,
  CreateTopupResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/session";
import { generateId } from "../lib/id";

const router: IRouter = Router();
router.use(requireAuth);

type AuthReq = Request & { userId: string };

// GET /payments
router.get("/payments", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const query = ListPaymentsQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  const payments = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, userId))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(
    ListPaymentsResponse.parse(
      payments.map((p) => ({
        id: p.id,
        method: p.method,
        amountUsdc: parseFloat(p.amountUsdc),
        amountUsd: parseFloat(p.amountUsd),
        chain: p.chain,
        txSignature: p.txSignature,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))
    )
  );
});

// POST /payments/topup
router.post("/payments/topup", async (req, res): Promise<void> => {
  const userId = (req as AuthReq).userId;
  const parsed = CreateTopupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { amountUsdc } = parsed.data;
  const id = generateId("pay");

  const depositAddress = process.env.DEPOSIT_WALLET_ADDRESS ?? "";
  const memo = `farebox-${userId.substring(0, 8)}-${id.substring(0, 8)}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min to pay
  const solanaPay = `solana:${depositAddress}?amount=${amountUsdc}&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&memo=${memo}`;

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      id,
      userId,
      method: "usdc_topup",
      amountUsdc: String(amountUsdc),
      amountUsd: String(amountUsdc), // 1:1 USDC:USD
      chain: "solana",
      depositAddress,
      memo,
      status: "pending",
    })
    .returning();

  res.status(201).json(
    CreateTopupResponse.parse({
      payment: {
        id: payment.id,
        method: payment.method,
        amountUsdc: parseFloat(payment.amountUsdc),
        amountUsd: parseFloat(payment.amountUsd),
        chain: payment.chain,
        txSignature: null,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
      },
      depositAddress,
      memo,
      expiresAt: expiresAt.toISOString(),
      solanaPay,
    })
  );
});

export default router;
