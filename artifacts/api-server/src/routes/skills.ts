import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, modelsTable } from "@workspace/db";
import { requireApiKey, type ApiKeyRequest } from "../lib/api-key-auth";
import { getCurrentBalance, debitBalance } from "../lib/balance-helper";
import { streamCompletion } from "../lib/providers";
import { generateId } from "../lib/id";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Built-in skill registry ───────────────────────────────────────────────
const SKILLS = [
  {
    id:              "summarize",
    name:            "Summarize",
    description:     "Distill any text, document, or conversation into clear key points.",
    category:        "Productivity",
    systemPrompt:    "You are a concise summarization engine. Summarize the user's input into structured bullet-point takeaways. Use markdown. Be direct — no filler.",
    defaultModel:    "claude-sonnet-4-5",
    priceMultiplier: 1.0,
  },
  {
    id:              "translate",
    name:            "Translate",
    description:     "Translate text into any language, preserving tone and context.",
    category:        "Language",
    systemPrompt:    "You are a professional translator. Translate accurately, preserving idioms, tone, and nuance. Output only the translated text unless asked otherwise.",
    defaultModel:    "claude-sonnet-4-5",
    priceMultiplier: 1.0,
  },
  {
    id:              "code-review",
    name:            "Code Review",
    description:     "Review code for bugs, security issues, and best-practice violations.",
    category:        "Developer",
    systemPrompt:    "You are a senior engineer doing a thorough code review. Identify bugs, security vulnerabilities, performance issues, and style problems. Be specific with line references and suggest fixes. Use markdown.",
    defaultModel:    "claude-opus-4-5",
    priceMultiplier: 1.2,
  },
  {
    id:              "explain",
    name:            "Explain",
    description:     "Explain any concept, code, or document in plain English.",
    category:        "Education",
    systemPrompt:    "You are an expert explainer. Break down complex topics into clear, simple language. Use analogies where helpful. Assume the reader is intelligent but unfamiliar with the domain.",
    defaultModel:    "claude-sonnet-4-5",
    priceMultiplier: 1.0,
  },
  {
    id:              "sentiment",
    name:            "Sentiment Analysis",
    description:     "Analyze tone, sentiment, and emotional signals in any text.",
    category:        "Analytics",
    systemPrompt:    "You are a sentiment analysis engine. Analyze the provided text and output: overall sentiment (positive/negative/neutral/mixed), confidence (0–1), key phrases driving the sentiment, and a brief explanation. Respond in JSON.",
    defaultModel:    "gpt-4.1",
    priceMultiplier: 1.0,
  },
  {
    id:              "extract-data",
    name:            "Data Extractor",
    description:     "Parse unstructured text into clean structured JSON.",
    category:        "Data",
    systemPrompt:    "You are a data extraction engine. Parse the user's text and extract all structured data as clean JSON. Infer field names from context. If uncertain, include the raw value with an inference note.",
    defaultModel:    "gpt-4.1",
    priceMultiplier: 1.1,
  },
  {
    id:              "draft-email",
    name:            "Draft Email",
    description:     "Write a professional email from a short brief or bullet points.",
    category:        "Productivity",
    systemPrompt:    "You are an expert business writer. Write a clear, professional email from the user's brief. Match their stated tone (formal/casual). Output only the email body and subject line.",
    defaultModel:    "claude-sonnet-4-5",
    priceMultiplier: 1.0,
  },
  {
    id:              "fix-grammar",
    name:            "Fix Grammar",
    description:     "Correct grammar, spelling, and clarity without changing the voice.",
    category:        "Language",
    systemPrompt:    "You are a precise copy editor. Fix grammar, spelling, and punctuation errors. Improve sentence clarity where needed. Preserve the author's voice and intent entirely. Output only the corrected text.",
    defaultModel:    "gpt-4.1-mini",
    priceMultiplier: 0.8,
  },
] as const;

type SkillId = typeof SKILLS[number]["id"];

// ── GET /skills ───────────────────────────────────────────────────────────
// Public — no API key required
router.get("/skills", (_req, res): void => {
  res.json({
    object: "list",
    data: SKILLS.map(({ id, name, description, category, defaultModel, priceMultiplier }) => ({
      id,
      name,
      description,
      category,
      defaultModel,
      priceMultiplier,
    })),
  });
});

// ── POST /skills/:id/call ─────────────────────────────────────────────────
// Requires API key. Calls the built-in skill and bills like a normal request.
router.post("/skills/:id/call", requireApiKey, async (req: Request, res: Response): Promise<void> => {
  const skill = SKILLS.find(s => s.id === req.params.id);
  if (!skill) {
    res.status(404).json({ error: { message: `Skill '${req.params.id}' not found`, code: "skill_not_found" } });
    return;
  }

  const { gkUserId } = req as ApiKeyRequest;
  const { input, model: reqModel, stream: streamReq } = req.body as {
    input?: string;
    model?: string;
    stream?: boolean;
  };

  if (!input || typeof input !== "string") {
    res.status(400).json({ error: { message: "'input' string is required", code: "invalid_request" } });
    return;
  }

  const modelId = reqModel ?? skill.defaultModel;
  const [model] = await db.select().from(modelsTable).where(eq(modelsTable.id, modelId));
  if (!model) {
    res.status(404).json({ error: { message: `Model '${modelId}' not found`, code: "model_not_found" } });
    return;
  }

  const balance = await getCurrentBalance(gkUserId);
  if (balance < 0.001) {
    res.status(402).json({ error: { message: "Insufficient balance. Top up your Farebox account.", code: "insufficient_balance" } });
    return;
  }

  const doStream = streamReq !== false;
  if (doStream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
  }

  const requestId = generateId("sk");
  const startMs  = Date.now();
  let inputTokens  = 0;
  let outputTokens = 0;
  let fullText     = '';
  let providerError: string | null = null;

  try {
    const gen = streamCompletion(
      model,
      {
        model: modelId,
        messages: [
          { role: "system", content: skill.systemPrompt },
          { role: "user",   content: input },
        ],
        stream: doStream,
      },
      requestId,
    );

    for await (const chunk of gen) {
      if ("text" in chunk) {
        if (doStream) res.write(chunk.text);
        else fullText += chunk.text;
      } else if ("usage" in chunk) {
        inputTokens  = chunk.usage.inputTokens;
        outputTokens = chunk.usage.outputTokens;
      } else if ("done" in chunk && doStream) {
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }
  } catch (err) {
    providerError = String(err);
    logger.error({ err, skill: skill.id }, "Skill call error");
    if (doStream) {
      res.write(`data: ${JSON.stringify({ error: { message: providerError, code: "provider_error" } })}\n\n`);
      res.end();
    } else {
      res.status(502).json({ error: { message: providerError, code: "provider_error" } });
    }
    return;
  }

  // Send non-streaming response
  if (!doStream) {
    res.json({
      id: requestId,
      object: "skill_completion",
      skill: skill.id,
      model: modelId,
      output: fullText,
      usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    });
  }

  // Bill (same formula as gateway, × skill priceMultiplier)
  const ip      = parseFloat(model.inputPerMtokUsd);
  const op      = parseFloat(model.outputPerMtokUsd);
  const markup  = parseFloat(model.markupPct) / 100;
  const cost    = ((inputTokens / 1_000_000) * ip + (outputTokens / 1_000_000) * op) * skill.priceMultiplier;
  const billed  = cost * (1 + markup);
  const latency = Date.now() - startMs;

  logger.info({ requestId, skill: skill.id, model: modelId, inputTokens, outputTokens, billed, latency }, "skill call billed");

  if (billed > 0) {
    await debitBalance({
      userId:      gkUserId,
      amountUsd:   billed,
      description: `skill:${skill.id} · ${model.id} · ${inputTokens}in ${outputTokens}out`,
      refId:       requestId,
    }).catch(e => logger.error({ e }, "Skill billing debit failed"));
  }
});

export default router;
