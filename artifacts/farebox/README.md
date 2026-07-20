# farebox-web

The web frontend for [farebox.fun](https://farebox.fun), built with React 19 and Vite 7.

## Stack

| | |
|---|---|
| **React 19** + **Vite 7** | Core framework |
| **Tailwind CSS v4** + **Radix UI** | UI primitives |
| **Framer Motion** | Animations |
| **Privy** | Wallet + social auth |
| **TanStack Query** | Data fetching + caching |
| **Wouter** | Client-side routing |
| **Zod** | Form + response validation |

## Pages

| Route | Description |
|---|---|
| `/` | Landing — hero, features, pricing |
| `/dashboard` | API key management, usage, billing |
| `/models` | Browse 36+ available models |
| `/compute` | Compute marketplace |
| `/docs` | Integration documentation |
| `/skill` | Agent Skills — community tools for agents |
| `/mcp` | MCP server setup guide |
| `/status` | Real-time service status |

## Development

```bash
# from repo root
pnpm install

# copy env
cp artifacts/farebox/.env.example artifacts/farebox/.env

# start dev server
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/farebox run dev
```

## Build

```bash
pnpm --filter @workspace/farebox run build
# output → artifacts/farebox/dist/public/
```

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Dev server port (required) |
| `BASE_PATH` | URL base path, e.g. `/` (required) |
