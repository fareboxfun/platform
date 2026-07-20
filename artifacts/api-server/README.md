# farebox-api

REST API server for the Farebox platform. OpenAI-compatible LLM gateway with x402 machine-payment support and per-token USDC billing on Solana.

## Stack

| | |
|---|---|
| **Express 5** | HTTP server |
| **Drizzle ORM** | PostgreSQL schema + migrations |
| **Pino** | Structured JSON logging |
| **Zod** | Request/response validation |
| **x402** | Per-request USDC micropayments (Solana) |
| **esbuild** | Production build |

## API reference

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/status` | Platform service status + uptime |
| `GET` | `/.well-known/x402` | x402 payment manifest |
| `GET` | `/api/models` | Available LLM models |
| `GET` | `/v1/models` | OpenAI-compatible model list |
| `GET` | `/api/skills` | Community agent skills |
| `GET` | `/api/mcp-server` | Download the farebox-mcp binary |

### Authenticated (API key or x402)

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/chat/completions` | OpenAI-compatible chat completions |
| `POST` | `/api/keys` | Create API key |
| `GET` | `/api/keys` | List API keys |
| `DELETE` | `/api/keys/:id` | Revoke API key |
| `GET` | `/api/usage` | Token usage history |
| `GET` | `/api/balance` | USDC balance |
| `POST` | `/api/payments/deposit` | Initiate USDC deposit |

### Relay network

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/relay/register` | Register a relay node |
| `GET` | `/api/relay/nodes` | List active relay nodes |

## x402 payment flow

```
Client → POST /v1/chat/completions
Server → 402 Payment Required  { amount, currency: "USDC", recipient, network: "solana" }
Client → signs payment on-chain, retries with X-Payment header
Server → 200 OK  (streams response)
```

## Development

```bash
# from repo root
pnpm install
cp artifacts/api-server/.env.example artifacts/api-server/.env
# fill in required variables

pnpm --filter @workspace/api-server run dev
```

## Build

```bash
pnpm --filter @workspace/api-server run build
# output → artifacts/api-server/dist/index.mjs
```

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session signing secret (32+ chars) |
| `DEPOSIT_WALLET_ADDRESS` | Solana wallet address for x402 deposits |
| `HELIUS_API_KEY` | Helius RPC API key (Solana webhooks) |
| `OPENAI_API_KEY` | OpenAI provider key |
| `ANTHROPIC_API_KEY` | Anthropic provider key |
| `PORT` | Server port (default: `8080`) |
| `NODE_ENV` | `development` or `production` |
