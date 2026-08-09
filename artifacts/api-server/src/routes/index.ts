import { Router, type IRouter } from "express";
import path from "path";
import { readFileSync } from "fs";
import healthRouter   from "./health";
import authRouter     from "./auth";
import keysRouter     from "./keys";
import balanceRouter  from "./balance";
import usageRouter    from "./usage";
import modelsRouter   from "./models";
import dashboardRouter from "./dashboard";
import paymentsRouter from "./payments";
import platformRouter from "./platform";
import statusRouter   from "./status";
import webhooksRouter from "./webhooks";
import relayRouter    from "./relay";

const router: IRouter = Router();

// ── GET /api — root info endpoint (used by deployment healthcheck & clients) ──
router.get("/", (_req, res): void => {
  res.json({
    name: "Farebox API",
    version: "1.0.0",
    status: "ok",
    docs: "https://farebox.fun/docs",
    gateway: "/v1/chat/completions",
    models: "/v1/models",
  });
});

router.use(healthRouter);
router.use(authRouter);
router.use(platformRouter);  // public — no requireAuth
router.use(statusRouter);    // public — no requireAuth
router.use(modelsRouter);    // public — no requireAuth
router.use(webhooksRouter);  // public — verified by secret header
router.use(relayRouter);     // relay network — public stats, auth on write routes

// ── GET /api/mcp-server ── serve built farebox-mcp binary ──────────────────
// Router is mounted at /api, so this becomes /api/mcp-server
router.get("/mcp-server", (_req, res): void => {
  try {
    const mcpPath = path.resolve(process.cwd(), "../../packages/farebox-mcp/dist/index.js");
    const js = readFileSync(mcpPath, "utf-8");
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Content-Disposition", 'attachment; filename="farebox-mcp.js"');
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(js);
  } catch {
    res.status(404).json({ error: "MCP server binary not found. Run: pnpm --filter farebox-mcp build" });
  }
});
router.use(keysRouter);
router.use(balanceRouter);
router.use(usageRouter);
router.use(dashboardRouter);
router.use(paymentsRouter);

export default router;
