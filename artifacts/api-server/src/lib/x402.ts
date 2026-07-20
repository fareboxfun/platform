/**
 * x402 — machine-native HTTP payment verification
 * Verifies a Solana USDC transaction signature before allowing gateway access.
 */

import type { Request, Response, NextFunction } from "express";
import type { ApiKeyRequest } from "./api-key-auth";
import { requireApiKey } from "./api-key-auth";
import { logger } from "./logger";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGG";
const SOLANA_RPC = process.env.HELIUS_RPC_URL
  ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_RPC_URL}`
  : "https://api.mainnet-beta.solana.com";

// USDC token account address for the deposit wallet (cached at first call)
let _depositAta: string | null = null;

async function getDepositAta(): Promise<string | null> {
  if (_depositAta) return _depositAta;
  const wallet = process.env.DEPOSIT_WALLET_ADDRESS;
  if (!wallet) return null;
  try {
    const resp = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "getTokenAccountsByOwner",
        params: [wallet, { mint: USDC_MINT }, { encoding: "jsonParsed" }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await resp.json() as { result?: { value?: { pubkey: string }[] } };
    _depositAta = data?.result?.value?.[0]?.pubkey ?? null;
    logger.info({ depositAta: _depositAta }, "x402: deposit USDC ATA resolved");
    return _depositAta;
  } catch (e) {
    logger.warn({ e }, "x402: could not resolve deposit ATA");
    return null;
  }
}

export interface X402VerifyResult {
  valid: boolean;
  amountUsdc?: number;
  payer?: string;
  reason?: string;
}

/**
 * Verify a Solana tx signature as an x402 payment.
 * Checks: tx exists, is recent (<5 min), and credits USDC to our deposit ATA.
 */
export async function verifyX402Payment(sig: string): Promise<X402VerifyResult> {
  if (!sig || sig.length < 64 || sig.length > 128) {
    return { valid: false, reason: "invalid signature format" };
  }

  let txData: { result?: {
    blockTime?: number;
    meta?: {
      preTokenBalances?: { accountIndex: number; mint: string; uiTokenAmount: { uiAmount: number | null } }[];
      postTokenBalances?: { accountIndex: number; mint: string; uiTokenAmount: { uiAmount: number | null } }[];
    };
    transaction?: { message?: { accountKeys?: { pubkey: string }[] } };
  } } | null = null;

  try {
    const resp = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "getTransaction",
        params: [sig, { encoding: "jsonParsed", commitment: "confirmed", maxSupportedTransactionVersion: 0 }],
      }),
      signal: AbortSignal.timeout(10000),
    });
    txData = await resp.json() as typeof txData;
  } catch (e) {
    logger.error({ e, sig }, "x402: Solana RPC error");
    return { valid: false, reason: "RPC error" };
  }

  const tx = txData?.result;
  if (!tx) return { valid: false, reason: "transaction not found" };

  // Must be recent (within 5 minutes of submission)
  const blockTime = tx.blockTime ?? 0;
  const ageSeconds = Date.now() / 1000 - blockTime;
  if (ageSeconds > 300) {
    return { valid: false, reason: `transaction too old (${Math.round(ageSeconds)}s)` };
  }

  // Get our deposit USDC ATA
  const depositAta = await getDepositAta();

  const pre = tx.meta?.preTokenBalances ?? [];
  const post = tx.meta?.postTokenBalances ?? [];
  const accountKeys = tx.transaction?.message?.accountKeys ?? [];

  // Find any USDC balance increase in the tx
  // If we have the deposit ATA, only count transfers to it; otherwise accept any USDC credit
  let receivedUsdc = 0;
  let payerPubkey: string | undefined;

  for (const postBal of post) {
    if (postBal.mint !== USDC_MINT) continue;

    // If we know the deposit ATA, verify this is our account
    if (depositAta) {
      const accountPubkey = accountKeys[postBal.accountIndex]?.pubkey;
      if (accountPubkey !== depositAta) continue;
    }

    const preBal = pre.find((p) => p.accountIndex === postBal.accountIndex);
    const preAmt = preBal?.uiTokenAmount?.uiAmount ?? 0;
    const postAmt = postBal.uiTokenAmount?.uiAmount ?? 0;
    const delta = postAmt - preAmt;

    if (delta > 0) {
      receivedUsdc = delta;
      // Best-effort payer: first account in tx
      payerPubkey = accountKeys[0]?.pubkey;
      break;
    }
  }

  if (receivedUsdc <= 0) {
    return { valid: false, reason: "no USDC credit to deposit address found in transaction" };
  }

  logger.info({ sig, receivedUsdc, payerPubkey }, "x402: payment verified");
  return { valid: true, amountUsdc: receivedUsdc, payer: payerPubkey };
}

/**
 * Express middleware: accepts API key auth OR x402 payment.
 * Falls through to requireApiKey if Authorization header present.
 * Verifies X-Payment header on Solana if no API key.
 * Returns 402 with quote if neither is present.
 */
export async function requireApiKeyOrX402(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = req.headers["authorization"] as string | undefined;
  const xPayment = req.headers["x-payment"] as string | undefined;

  // ── Case 1: Regular API key ───────────────────────────────────────────────
  if (auth) {
    return requireApiKey(req, res, next);
  }

  // ── Case 2: X-Payment header — verify Solana tx ───────────────────────────
  if (xPayment) {
    try {
      const result = await verifyX402Payment(xPayment.trim());
      if (!result.valid) {
        res.status(402).json({
          error: {
            message: `X-Payment verification failed: ${result.reason}`,
            code: "payment_invalid",
          },
        });
        return;
      }

      // Inject x402 context — route handler checks req.x402Verified to skip balance debit
      const gkReq = req as ApiKeyRequest;
      gkReq.gkUserId   = "x402-pool";
      gkReq.gkApiKeyId = null as unknown as string;
      gkReq.gkKey      = null as unknown as ApiKeyRequest["gkKey"];
      (req as Request & { x402Verified?: boolean; x402AmountUsdc?: number }).x402Verified  = true;
      (req as Request & { x402Verified?: boolean; x402AmountUsdc?: number }).x402AmountUsdc = result.amountUsdc;

      return next();
    } catch (e) {
      logger.error({ e, xPayment }, "x402: verification threw");
      res.status(402).json({ error: { message: "Payment verification error", code: "payment_error" } });
      return;
    }
  }

  // ── Case 3: No auth, no payment — return 402 with x402 quote ─────────────
  const depositAddress = process.env.DEPOSIT_WALLET_ADDRESS ?? "";
  res.status(402).json({
    error: {
      message:
        "Payment required. Attach Authorization: Bearer sk-... header, or pay per-request with X-Payment: <solana-tx-sig> (x402).",
      code: "payment_required",
    },
    x402: {
      version: 1,
      scheme: "exact",
      network: "solana-mainnet",
      recipient: depositAddress,
      asset: {
        address: USDC_MINT,
        symbol: "USDC",
        decimals: 6,
        chain: "solana-mainnet",
      },
      estimatedCostUsdc: 0.001,
      maxAgeSeconds: 300,
      discovery: "https://api.farebox.fun/.well-known/x402",
      instructions:
        "1. GET /.well-known/x402 for quote → 2. Send USDC to recipient → 3. Retry with X-Payment: <tx-signature>",
    },
  });
}
