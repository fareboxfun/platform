# farebox-mcp

**Farebox MCP Server** — connect Claude Desktop, Cursor, or any MCP-compatible client to 36+ frontier LLMs. Payments happen automatically per token in USDC on Solana — no accounts, no invoices.

[![npm version](https://img.shields.io/npm/v/farebox-mcp)](https://www.npmjs.com/package/farebox-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Install

```bash
npx farebox-mcp
```

No global install needed. Runs directly from the npm registry.

## Quick setup

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)  
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "farebox": {
      "command": "npx",
      "args": ["-y", "farebox-mcp"],
      "env": {
        "FAREBOX_API_KEY": "sk-fbx-your-key-here"
      }
    }
  }
}
```

### Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "farebox": {
      "command": "npx",
      "args": ["-y", "farebox-mcp"],
      "env": {
        "FAREBOX_API_KEY": "sk-fbx-your-key-here"
      }
    }
  }
}
```

Get your API key at [farebox.fun/dashboard](https://farebox.fun/dashboard).

## Keyless mode (x402)

No API key required — your agent pays per request autonomously in USDC on Solana:

```json
{
  "mcpServers": {
    "farebox": {
      "command": "npx",
      "args": ["-y", "farebox-mcp"],
      "env": {
        "FAREBOX_SOLANA_PRIVATE_KEY": "your-base58-private-key",
        "FAREBOX_MODE": "x402"
      }
    }
  }
}
```

## Available tools

Once connected, your agent has access to:

- **36+ frontier models** — GPT-4o, Claude Sonnet, Gemini Flash, Llama, DeepSeek, Mistral, and more
- **Community skills** — `summarize`, `translate`, `code-review`, `explain`, `sentiment`, `extract-data`, `draft-email`, `fix-grammar`

All models and skills appear as individual tools in your MCP client automatically.

## Environment variables

| Variable | Description |
|---|---|
| `FAREBOX_API_KEY` | API key from [farebox.fun/dashboard](https://farebox.fun/dashboard) |
| `FAREBOX_SOLANA_PRIVATE_KEY` | Base58 Solana private key (x402 keyless mode) |
| `FAREBOX_MODE` | `apikey` (default) or `x402` |
| `FAREBOX_BASE_URL` | Override API base URL (optional) |

## Pricing

Pay per token in USDC — no minimum, no subscription.

| Model | Input | Output |
|---|---|---|
| llama-4-scout | $0.11 / 1M tokens | $0.34 / 1M tokens |
| gpt-4o-mini | $0.15 / 1M tokens | $0.60 / 1M tokens |
| claude-sonnet-4-5 | $3.00 / 1M tokens | $15.00 / 1M tokens |
| gpt-4o | $2.50 / 1M tokens | $10.00 / 1M tokens |

Full model list: [farebox.fun/models](https://farebox.fun/models)

## Links

- Website: [farebox.fun](https://farebox.fun)
- MCP setup guide: [farebox.fun/mcp](https://farebox.fun/mcp)
- npm: [npmjs.com/package/farebox-mcp](https://www.npmjs.com/package/farebox-mcp)
- GitHub: [github.com/fareboxfun/farebox-mcp](https://github.com/fareboxfun/farebox-mcp)
- X: [@Farebox_](https://x.com/Farebox_)

## License

[MIT](./LICENSE)
