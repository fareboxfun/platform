import type { Model } from "@workspace/db";
import { logger } from "./logger";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GatewayRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  [key: string]: unknown;
}

export interface UsageCounts {
  inputTokens: number;
  outputTokens: number;
}

export type StreamChunk = { text: string } | { usage: UsageCounts } | { done: true };

/**
 * Returns an async generator that yields SSE-formatted strings
 * (already prefixed with "data: ") ending with "data: [DONE]\n\n".
 * Also yields a final { usage } chunk for billing.
 */
export async function* streamCompletion(
  model: Model,
  body: GatewayRequest,
  requestId: string
): AsyncGenerator<StreamChunk> {
  const provider = model.provider.toLowerCase();

  if (provider === "openai") {
    yield* streamOpenAI(model, body, requestId);
  } else if (provider === "anthropic") {
    yield* streamAnthropic(model, body, requestId);
  } else {
    // All other providers (openrouter, xAI, Google, etc.) route through OpenRouter
    yield* streamOpenRouter(model, body, requestId);
  }
}

// ─── OpenAI ─────────────────────────────────────────────────────────────────

async function* streamOpenAI(
  model: Model,
  body: GatewayRequest,
  requestId: string
): AsyncGenerator<StreamChunk> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const payload = {
    model: model.id,
    messages: body.messages,
    stream: true,
    stream_options: { include_usage: true },
    ...(body.temperature !== undefined && { temperature: body.temperature }),
    ...(body.max_tokens !== undefined && { max_tokens: body.max_tokens }),
    ...(body.top_p !== undefined && { top_p: body.top_p }),
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    const err = await res.text();
    logger.error({ provider: "openai", status: res.status, err }, "OpenAI error");
    throw new Error(`OpenAI returned ${res.status}: ${err.slice(0, 200)}`);
  }

  let inputTokens = 0;
  let outputTokens = 0;
  const decoder = new TextDecoder();
  let buf = "";

  for await (const chunk of res.body as AsyncIterable<Uint8Array>) {
    buf += decoder.decode(chunk, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        // Patch the model ID to our model id
        parsed.model = model.id;

        // Capture usage from the usage chunk at end
        if (parsed.usage) {
          inputTokens = parsed.usage.prompt_tokens ?? 0;
          outputTokens = parsed.usage.completion_tokens ?? 0;
        }

        const choice = parsed.choices?.[0];
        if (choice?.delta?.content) {
          yield { text: `data: ${JSON.stringify(parsed)}\n\n` };
        } else if (parsed.usage) {
          // Don't forward usage chunk to client; we handle it ourselves
        } else if (choice) {
          yield { text: `data: ${JSON.stringify(parsed)}\n\n` };
        }
      } catch {}
    }
  }

  yield { usage: { inputTokens, outputTokens } };
  yield { done: true };
}

// ─── OpenRouter (universal fallback — OpenAI-compatible) ─────────────────────

async function* streamOpenRouter(
  model: Model,
  body: GatewayRequest,
  requestId: string
): AsyncGenerator<StreamChunk> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const payload = {
    model: model.id, // OpenRouter uses provider/model-name format
    messages: body.messages,
    stream: true,
    stream_options: { include_usage: true },
    ...(body.temperature !== undefined && { temperature: body.temperature }),
    ...(body.max_tokens !== undefined && { max_tokens: body.max_tokens }),
    ...(body.top_p !== undefined && { top_p: body.top_p }),
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://farebox.fun",
      "X-Title": "Farebox",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    const err = await res.text();
    logger.error({ provider: "openrouter", model: model.id, status: res.status, err }, "OpenRouter error");
    throw new Error(`OpenRouter returned ${res.status}: ${err.slice(0, 200)}`);
  }

  let inputTokens = 0;
  let outputTokens = 0;
  const decoder = new TextDecoder();
  let buf = "";

  for await (const chunk of res.body as AsyncIterable<Uint8Array>) {
    buf += decoder.decode(chunk, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        parsed.model = model.id;

        if (parsed.usage) {
          inputTokens = parsed.usage.prompt_tokens ?? 0;
          outputTokens = parsed.usage.completion_tokens ?? 0;
        }

        const choice = parsed.choices?.[0];
        if (choice?.delta?.content) {
          yield { text: `data: ${JSON.stringify(parsed)}\n\n` };
        } else if (choice?.finish_reason) {
          yield { text: `data: ${JSON.stringify(parsed)}\n\n` };
        }
      } catch {}
    }
  }

  yield { usage: { inputTokens, outputTokens } };
  yield { done: true };
}

// ─── Anthropic ───────────────────────────────────────────────────────────────

async function* streamAnthropic(
  model: Model,
  body: GatewayRequest,
  requestId: string
): AsyncGenerator<StreamChunk> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  // Convert OpenAI messages to Anthropic format
  const systemMsg = body.messages.find((m) => m.role === "system")?.content;
  const messages = body.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const payload: Record<string, unknown> = {
    model: model.id,
    messages,
    max_tokens: body.max_tokens ?? 4096,
    stream: true,
    ...(systemMsg && { system: systemMsg }),
    ...(body.temperature !== undefined && { temperature: body.temperature }),
    ...(body.top_p !== undefined && { top_p: body.top_p }),
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    const err = await res.text();
    logger.error({ provider: "anthropic", status: res.status, err }, "Anthropic error");
    throw new Error(`Anthropic returned ${res.status}: ${err.slice(0, 200)}`);
  }

  let inputTokens = 0;
  let outputTokens = 0;
  let msgId = `msg_${requestId}`;
  const created = Math.floor(Date.now() / 1000);
  const decoder = new TextDecoder();
  let buf = "";
  let eventType = "";

  for await (const chunk of res.body as AsyncIterable<Uint8Array>) {
    buf += decoder.decode(chunk, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
        continue;
      }
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();

      try {
        const parsed = JSON.parse(data);

        if (eventType === "message_start") {
          msgId = parsed.message?.id ?? msgId;
          inputTokens = parsed.message?.usage?.input_tokens ?? 0;
        } else if (eventType === "content_block_delta") {
          const text = parsed.delta?.text ?? "";
          if (text) {
            // Convert to OpenAI chunk format
            const oaiChunk = {
              id: msgId,
              object: "chat.completion.chunk",
              created,
              model: model.id,
              choices: [
                {
                  index: 0,
                  delta: { content: text },
                  finish_reason: null,
                },
              ],
            };
            yield { text: `data: ${JSON.stringify(oaiChunk)}\n\n` };
          }
        } else if (eventType === "message_delta") {
          outputTokens = parsed.usage?.output_tokens ?? outputTokens;
          const stopReason = parsed.delta?.stop_reason;
          if (stopReason) {
            const oaiChunk = {
              id: msgId,
              object: "chat.completion.chunk",
              created,
              model: model.id,
              choices: [
                {
                  index: 0,
                  delta: {},
                  finish_reason:
                    stopReason === "end_turn" ? "stop" : stopReason,
                },
              ],
            };
            yield { text: `data: ${JSON.stringify(oaiChunk)}\n\n` };
          }
        }
      } catch {}
    }
  }

  yield { usage: { inputTokens, outputTokens } };
  yield { done: true };
}
