# Farebox Platform

Crypto-native LLM gateway. OpenAI-compatible API with per-token USDC payments on Solana. No subscriptions, no invoices — machine-native billing via the [x402 protocol](https://x402.org).

## Architecture

This monorepo contains all platform services:

| Package | Description |
|---|---|
| `artifacts/farebox` | Web frontend — [farebox.fun](https://farebox.fun) |
| `artifacts/api-server` | REST API + x402 payment gateway |
| `lib/api-spec` | OpenAPI specification |
| `lib/api-zod` | Zod validation schemas |
| `lib/api-client-react` | React query hooks |
| `lib/db` | Drizzle ORM schema + migrations |
| `packages/farebox-mcp` | MCP server — also on [npm](https://www.npmjs.com/package/farebox-mcp) |

## Quickstart

**Prerequisites:** Node.js ≥ 18, pnpm ≥ 9

```bash
git clone https://github.com/fareboxfun/platform.git
cd platform
pnpm install
```

**Start the API server:**
```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
# fill in required variables
pnpm --filter @workspace/api-server run dev
```

**Start the web frontend:**
```bash
cp artifacts/farebox/.env.example artifacts/farebox/.env
pnpm --filter @workspace/farebox run dev
```

## MCP Server

Connect Claude Desktop or Cursor to all 36+ Farebox models in two lines of config:

```bash
npx farebox-mcp
```

Full setup guide → [farebox.fun/mcp](https://farebox.fun/mcp)  
npm package → [npmjs.com/package/farebox-mcp](https://www.npmjs.com/package/farebox-mcp)

## x402 — Keyless Machine Payments

Farebox implements [x402](https://x402.org), an open standard for HTTP micropayments. AI agents can call the API without an account — the server returns a `402 Payment Required` with a USDC quote, the agent signs the payment on Solana, and retries. No invoices, no OAuth, no human in the loop.

Try it:
```bash
curl https://api.farebox.fun/.well-known/x402
```

## Links

- Website: [farebox.fun](https://farebox.fun)
- API docs: [farebox.fun/docs](https://farebox.fun/docs)
- Status: [farebox.fun/status](https://farebox.fun/status)
- npm: [npmjs.com/package/farebox-mcp](https://www.npmjs.com/package/farebox-mcp)
- X: [@Farebox_](https://x.com/Farebox_)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and PRs welcome.

## License

[MIT](./LICENSE)
