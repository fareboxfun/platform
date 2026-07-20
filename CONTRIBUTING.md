# Contributing to Farebox

Thank you for your interest in contributing to the Farebox platform.

## Getting started

1. Fork this repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/platform.git`
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feat/your-feature`
5. Make your changes, commit, and open a pull request

## Project structure

```
artifacts/
  farebox/        # React + Vite web frontend
  api-server/     # Express 5 API server

lib/
  api-spec/       # OpenAPI spec
  api-zod/        # Zod schemas (shared between server + client)
  api-client-react/ # TanStack Query hooks
  db/             # Drizzle ORM schema + migrations

packages/
  farebox-mcp/    # Standalone MCP server (published on npm)
```

## Code conventions

- **TypeScript strict mode** throughout — no `any`, no implicit `any`
- **Pino** for all server-side logging (structured JSON)
- **Zod** for all runtime validation at API boundaries
- **Drizzle ORM** — no raw SQL unless absolutely necessary
- **Conventional commits:** `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`

## Pull request checklist

- [ ] `pnpm run typecheck` passes with no errors
- [ ] New endpoints have Zod input validation
- [ ] Environment variables are documented in `.env.example`
- [ ] No secrets or credentials committed

## Reporting bugs

Open a GitHub issue or reach out on [X / Twitter](https://x.com/Farebox_).

## License

By contributing, you agree your work will be licensed under the [MIT License](./LICENSE).
