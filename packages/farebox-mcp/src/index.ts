/**
 * farebox-mcp — Farebox MCP Server
 * Implements the Model Context Protocol (MCP) over stdio.
 * Compatible with Claude Desktop, Cursor, Continue, and any MCP client.
 *
 * Usage:
 *   npx farebox-mcp
 *
 * Environment variables:
 *   FAREBOX_API_KEY   — required. Your sk-fbx-... key from https://farebox.fun/dashboard/keys
 *   FAREBOX_API_BASE  — optional. Defaults to https://api.farebox.fun
 */

const API_BASE = process.env.FAREBOX_API_BASE ?? "https://api.farebox.fun";
const API_KEY  = process.env.FAREBOX_API_KEY  ?? "";

if (!API_KEY) {
  process.stderr.write("[farebox-mcp] FAREBOX_API_KEY is not set. Get a key at https://farebox.fun/dashboard/keys\n");
}

// ── Tool definitions ──────────────────────────────────────────────────────
const TOOLS = [
  {
    name:        "list_models",
    description: "List all available Farebox models with pricing. Returns an array of model objects.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name:        "chat",
    description: "Send a chat completion to any Farebox model. Returns the assistant's reply.",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type:        "string",
          description: "Farebox model ID. Examples: claude-opus-4-5, gpt-4.1, gemini-2.5-pro",
        },
        messages: {
          type:  "array",
          items: {
            type:       "object",
            properties: {
              role:    { type: "string", enum: ["system", "user", "assistant"] },
              content: { type: "string" },
            },
            required: ["role", "content"],
          },
          description: "Conversation history in OpenAI message format.",
        },
        temperature: {
          type:        "number",
          description: "Sampling temperature 0–2. Lower = more deterministic.",
        },
        max_tokens: {
          type:        "number",
          description: "Maximum tokens to generate.",
        },
      },
      required: ["model", "messages"],
    },
  },
  {
    name:        "call_skill",
    description: "Call a Farebox built-in skill (summarize, translate, code-review, explain, sentiment, extract-data). Faster than crafting a prompt from scratch.",
    inputSchema: {
      type: "object",
      properties: {
        skill: {
          type:        "string",
          enum:        ["summarize", "translate", "code-review", "explain", "sentiment", "extract-data", "draft-email", "fix-grammar"],
          description: "Skill ID.",
        },
        input: {
          type:        "string",
          description: "The text or content to process.",
        },
        model: {
          type:        "string",
          description: "Override the default model for this skill.",
        },
      },
      required: ["skill", "input"],
    },
  },
  {
    name:        "get_balance",
    description: "Get the current Farebox account balance and spending totals in USD.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name:        "get_usage",
    description: "Get recent usage statistics from your Farebox account.",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type:        "number",
          description: "Number of days to look back. Defaults to 7.",
        },
      },
      required: [],
    },
  },
];

// ── API helpers ───────────────────────────────────────────────────────────
const authHeaders = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type":  "application/json",
};

async function callTool(name: string, args: Record<string, unknown>): Promise<{ content: Array<{ type: string; text: string }> }> {
  if (name === "list_models") {
    const r    = await fetch(`${API_BASE}/v1/models`, { headers: authHeaders });
    const data = await r.json() as { data?: unknown[] };
    const models = data.data ?? [];
    return { content: [{ type: "text", text: JSON.stringify(models, null, 2) }] };
  }

  if (name === "chat") {
    const r = await fetch(`${API_BASE}/v1/chat/completions`, {
      method:  "POST",
      headers: authHeaders,
      body:    JSON.stringify({ ...args, stream: false }),
    });
    const data = await r.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      error?:   { message?: string };
    };
    if (data.error) throw new Error(data.error.message ?? "Provider error");
    const text = data.choices?.[0]?.message?.content ?? "No response";
    return { content: [{ type: "text", text }] };
  }

  if (name === "call_skill") {
    const r = await fetch(`${API_BASE}/v1/skills/${args.skill}/call`, {
      method:  "POST",
      headers: authHeaders,
      body:    JSON.stringify({ input: args.input, model: args.model, stream: false }),
    });
    const data = await r.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      error?:   { message?: string };
    };
    if (data.error) throw new Error((data.error as { message?: string }).message ?? "Skill error");
    const text = data.choices?.[0]?.message?.content ?? JSON.stringify(data);
    return { content: [{ type: "text", text }] };
  }

  if (name === "get_balance") {
    const r    = await fetch(`${API_BASE}/balance`, { headers: authHeaders });
    const data = await r.json() as { balanceUsd?: number; totalSpentUsd?: number; totalTopupUsd?: number };
    return {
      content: [{
        type: "text",
        text: [
          `Current balance:  $${(data.balanceUsd   ?? 0).toFixed(4)} USD`,
          `Total deposited:  $${(data.totalTopupUsd ?? 0).toFixed(4)} USD`,
          `Total spent:      $${(data.totalSpentUsd ?? 0).toFixed(4)} USD`,
        ].join("\n"),
      }],
    };
  }

  if (name === "get_usage") {
    const days = (args.days as number) ?? 7;
    const r    = await fetch(`${API_BASE}/usage?days=${days}`, { headers: authHeaders });
    const data = await r.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  return { content: [{ type: "text", text: `Unknown tool: ${name}` }] };
}

// ── MCP stdio transport ───────────────────────────────────────────────────
process.stdin.setEncoding("utf8");
let buffer = "";

process.stdin.on("data", (chunk: string) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";
  for (const line of lines) {
    if (line.trim()) handleMessage(line.trim());
  }
});

async function handleMessage(raw: string): Promise<void> {
  let msg: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try { msg = JSON.parse(raw); } catch { return; }

  if (msg.method === "initialize") {
    send({
      jsonrpc: "2.0",
      id:      msg.id,
      result:  {
        protocolVersion: "2024-11-05",
        capabilities:    { tools: {} },
        serverInfo:      { name: "farebox-mcp", version: "1.0.0" },
      },
    });
    return;
  }

  if (msg.method === "tools/list") {
    send({ jsonrpc: "2.0", id: msg.id, result: { tools: TOOLS } });
    return;
  }

  if (msg.method === "tools/call") {
    const params = msg.params as { name: string; arguments?: Record<string, unknown> };
    try {
      const result = await callTool(params.name, params.arguments ?? {});
      send({ jsonrpc: "2.0", id: msg.id, result });
    } catch (e) {
      send({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: String(e) } });
    }
    return;
  }

  if (msg.id != null) {
    send({ jsonrpc: "2.0", id: msg.id, result: {} });
  }
}

function send(msg: object): void {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

process.on("SIGINT",  () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
