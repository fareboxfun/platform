import { Router, type IRouter } from "express";
import { db, modelsTable } from "@workspace/db";
import { ListModelsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /models — public endpoint, no auth required
router.get("/models", async (_req, res): Promise<void> => {
  const models = await db.select().from(modelsTable).orderBy(modelsTable.provider, modelsTable.name);

  res.json(
    ListModelsResponse.parse(
      models.map((m) => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        description: m.description,
        contextWindow: m.contextWindow,
        inputPerMtokUsd: parseFloat(m.inputPerMtokUsd),
        outputPerMtokUsd: parseFloat(m.outputPerMtokUsd),
        billedInputPerMtokUsd: parseFloat(m.inputPerMtokUsd) * (1 + parseFloat(m.markupPct) / 100),
        billedOutputPerMtokUsd: parseFloat(m.outputPerMtokUsd) * (1 + parseFloat(m.markupPct) / 100),
        markupPct: parseFloat(m.markupPct),
        supportsStreaming: m.supportsStreaming,
        supportsTools: m.supportsTools,
      }))
    )
  );
});

export default router;
