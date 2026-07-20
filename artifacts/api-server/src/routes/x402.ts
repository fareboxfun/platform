import { Router, type IRouter } from "express";

const router: IRouter = Router();

const DEPOSIT_ADDRESS = process.env.DEPOSIT_WALLET_ADDRESS ?? "";
const USDC_MINT       = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// ── GET /.well-known/x402 ─────────────────────────────────────────────────
// Machine-readable payment discovery for x402-compatible agents.
// https://x402.org
router.get("/.well-known/x402", (_req, res): void => {
  res.json({
    scheme:  "exact",
    network: "solana-mainnet",
    asset: {
      address:  USDC_MINT,
      symbol:   "USDC",
      decimals: 6,
    },
    payTo:       DEPOSIT_ADDRESS,
    description: "Farebox LLM Gateway — pay per inference in USDC on Solana.",
    endpoints: {
      chatCompletions: "/v1/chat/completions",
      models:          "/v1/models",
      skills:          "/v1/skills",
    },
    pricing: {
      model:         "provider-cost × (1 + markup%)",
      minAmountUsdc: "0.001",
      note:          "Encode the model ID in the transaction memo field.",
    },
    verification: {
      type:    "solana-transaction",
      header:  "X-Payment",
      format:  "base58-encoded transaction signature",
      ttlSecs: 60,
    },
  });
});

export default router;
