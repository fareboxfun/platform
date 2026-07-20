import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import gatewayRouter from "./routes/gateway";
import skillsRouter  from "./routes/skills";
import x402Router    from "./routes/x402";
import { logger } from "./lib/logger";

const app: Express = express();

// Security headers — must be first
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow /v1 assets cross-origin
  contentSecurityPolicy: false, // API server, not serving HTML
}));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Dashboard/API routes: restrict to known origins.
// Add DEV_ORIGIN in .env for local development (e.g. DEV_ORIGIN=http://localhost:3000).
const allowedOrigins: (string | RegExp)[] = [
  "https://farebox.fun",
  "https://www.farebox.fun",
  "https://stats.farebox.fun",
  "http://127.0.0.1",
  "http://localhost",
];

if (process.env.DEV_ORIGIN) {
  allowedOrigins.push(process.env.DEV_ORIGIN);
}

app.use("/api", cors({
  credentials: true,
  origin: allowedOrigins,
}));

// Gateway routes: open CORS — any app can call the LLM gateway
app.use("/v1", cors({ origin: "*", credentials: false }));

app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api",  router);
app.use("/v1",   gatewayRouter);
app.use("/v1",   skillsRouter);   // built-in skills marketplace
app.use(x402Router);               // /.well-known/x402 discovery (no prefix)

// Global error handler — must be last, after all routes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
