import React, { useState } from 'react';
import { Link } from 'wouter';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import { ChevronRight, Copy, Check, Terminal, Key, Zap, Server, Cpu, Globe } from 'lucide-react';

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: '#1A1A1A', border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A', overflow: 'hidden', margin: '1rem 0' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #ffffff12' }}>
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#9CA3AF' }}>{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="flex items-center gap-1 text-[10px] font-mono transition-colors"
          style={{ color: copied ? '#7C3AED' : '#6B7280' }}
        >
          {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-5 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre" style={{ color: '#E5E7EB' }}>{code}</pre>
    </div>
  );
}

const SECTIONS = [
  { id: 'quickstart', label: 'Quickstart', icon: Zap },
  { id: 'auth', label: 'Authentication', icon: Key },
  { id: 'api', label: 'API Reference', icon: Server },
  { id: 'sdks', label: 'SDKs & Libraries', icon: Globe },
  { id: 'mcp', label: 'MCP Server', icon: Cpu },
  { id: 'x402', label: 'x402 Agent Lane', icon: Terminal },
  { id: 'cli', label: 'CLI', icon: Terminal },
  { id: 'errors', label: 'Error Codes', icon: Terminal },
];

export default function Docs() {
  const [active, setActive] = useState('quickstart');

  return (
    <div className="min-h-screen" style={{ background: '#FFFBEF', fontFamily: "'Space Grotesk', sans-serif" }}>
      <TopNav />
      <div className="pt-14 flex max-w-7xl mx-auto min-h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 sticky top-14 self-start h-[calc(100vh-56px)] overflow-y-auto"
          style={{ borderRight: '2.5px solid #1A1A1A', background: 'white' }}>
          <div className="p-5" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: '#7C3AED' }}>Documentation</div>
          </div>
          <nav className="p-3 space-y-1.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActive(id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-left transition-all"
                style={active === id
                  ? { background: '#7C3AED', color: 'white', border: '2px solid #1A1A1A', borderRadius: 8, boxShadow: '3px 3px 0 #1A1A1A' }
                  : { color: '#6B7280', background: 'transparent', border: '2px solid transparent', borderRadius: 8 }
                }>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-8 py-6 sm:py-12 max-w-3xl">

          {/* Mobile section picker */}
          <div className="md:hidden mb-6">
            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              style={{
                width: '100%',
                border: '2.5px solid #1A1A1A',
                borderRadius: 10,
                padding: '10px 14px',
                background: 'white',
                color: '#1A1A1A',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '3px 3px 0 #1A1A1A',
                cursor: 'pointer',
              }}
            >
              {SECTIONS.map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>

          {active === 'quickstart' && (
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>Getting Started</div>
              <h1 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 7vw, 56px)', color: '#1A1A1A' }}>Quickstart</h1>
              <p className="text-base mb-8 leading-relaxed" style={{ color: '#4B5563' }}>Connect wallet → deposit USDC → generate a key → make your first API call. Target: <strong>under 3 minutes</strong>.</p>

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-10" style={{ color: '#1A1A1A' }}>Step 1: Connect Wallet</h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#4B5563' }}>Go to the <Link href="/dashboard" className="text-primary underline">Dashboard</Link> and click <strong>Connect Wallet</strong>. Farebox supports any Solana wallet (Phantom, Backpack, Solflare). You sign a message; your private key never leaves your wallet.</p>

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-10" style={{ color: '#1A1A1A' }}>Step 2: Top Up Balance</h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#4B5563' }}>Go to <strong>Balance → Top Up</strong>. Scan the Solana Pay QR code or copy the deposit address. Send any amount of USDC (SPL) on Solana. Balance credits in seconds after on-chain finality.</p>

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-10" style={{ color: '#1A1A1A' }}>Step 3: Generate an API Key</h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#4B5563' }}>Go to <strong>API Keys → New Key</strong>. Give it a label. Optionally set a daily cap. Copy the key; it's shown once.</p>

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-10" style={{ color: '#1A1A1A' }}>Step 4: Make Your First Call</h2>
              <CodeBlock lang="python" code={`from openai import OpenAI

client = OpenAI(
    base_url="https://api.farebox.fun/v1",
    api_key="sk-fbx-YOUR_KEY_HERE",
)

response = client.chat.completions.create(
    model="claude-opus-4-5",
    messages=[{"role": "user", "content": "Hello, Farebox!"}],
)
print(response.choices[0].message.content)`} />

              <CodeBlock lang="typescript" code={`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.farebox.fun/v1",
  apiKey: "sk-fbx-YOUR_KEY_HERE",
});

const response = await client.chat.completions.create({
  model: "gpt-4.1",
  messages: [{ role: "user", content: "Hello, Farebox!" }],
});
console.log(response.choices[0].message.content);`} />

              <CodeBlock lang="bash" code={`curl https://api.farebox.fun/v1/chat/completions \\
  -H "Authorization: Bearer sk-fbx-YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-2-5-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`} />

              <div className="mt-10 p-5 nb-card" style={{ background: '#7C3AED12', borderColor: '#7C3AED' }}>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: '#7C3AED' }}>Tip</div>
                <p className="text-sm" style={{ color: '#374151' }}>Farebox is a <strong>drop-in replacement</strong> for OpenAI's SDK. Change <code className="font-mono px-1.5 py-0.5 text-xs" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 4 }}>base_url</code> and your key; nothing else changes. Works with LangChain, Vercel AI SDK, Cursor, and any OpenAI-compatible library.</p>
              </div>
            </div>
          )}

          {active === 'auth' && (
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>Authentication</div>
              <h1 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 7vw, 56px)', color: '#1A1A1A' }}>Auth</h1>

              <h2 className="text-xl font-black uppercase tracking-tight mb-4" style={{ color: '#1A1A1A' }}>Wallet Login (SIWS)</h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#4B5563' }}>Farebox uses <strong>Sign In With Solana (SIWS)</strong>. Your private key never leaves your wallet. Farebox only ever verifies your ed25519 signature against the nonce we issued.</p>
              <CodeBlock lang="http" code={`# 1. Get a single-use nonce
GET /api/auth/nonce
→ { nonce: "a8f3...", expiresAt: "2026-..." }

# 2. Sign the message in your wallet:
#    { domain: "farebox.fun", address, nonce, issuedAt }

# 3. Submit signature
POST /api/auth/verify
Body: { walletAddress, nonce, signature }
→ { user: { ... }, isNew: false }
# Session cookie is set (httpOnly)`} />

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-10" style={{ color: '#1A1A1A' }}>API Key Auth</h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#4B5563' }}>All gateway calls use a Bearer token. Keys are prefixed <code className="font-mono px-1.5 py-0.5 text-xs" style={{ background: '#7C3AED', color: 'white', borderRadius: 4 }}>sk-fbx-</code>, stored as SHA-256 hashes, compared in constant time. The raw key is shown exactly once at creation.</p>
              <CodeBlock lang="http" code={`Authorization: Bearer sk-fbx-<your-key>`} />

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-10" style={{ color: '#1A1A1A' }}>Key Scopes & Caps</h2>
              <div className="nb-card overflow-hidden">
                {[
                  ['daily_cap_usd', 'Max spend per calendar day. Hard stop at 100%, soft alert at 80%.'],
                  ['monthly_cap_usd', 'Max spend per calendar month.'],
                  ['rate_limit_rpm', 'Max requests per minute. 429 budget_exceeded when reached.'],
                  ['allowed_models', 'Whitelist of model IDs. Requests to other models → 403.'],
                ].map(([k, v], i) => (
                  <div key={k} className="flex gap-4 px-5 py-3 text-sm" style={{ borderBottom: i < 3 ? '1px solid #1A1A1A12' : 'none' }}>
                    <code className="font-mono text-xs px-2 py-0.5 shrink-0 self-start" style={{ background: '#7C3AED', color: 'white', borderRadius: 4 }}>{k}</code>
                    <span style={{ color: '#4B5563' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'api' && (
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>Reference</div>
              <h1 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 7vw, 56px)', color: '#1A1A1A' }}>API Reference</h1>
              <p className="text-sm mb-8" style={{ color: '#4B5563' }}>Base URL: <code className="font-mono px-2 py-0.5" style={{ background: '#7C3AED', color: 'white', borderRadius: 4 }}>https://api.farebox.fun</code></p>

              {[
                { method: 'POST', path: '/v1/chat/completions', auth: 'Bearer key', desc: 'OpenAI-compatible chat endpoint. Streaming (SSE) supported. Tool calls passed through across all providers.', body: '{ model, messages, stream?, temperature?, max_tokens?, tools? }' },
                { method: 'GET', path: '/v1/models', auth: 'Bearer key', desc: 'List all available models with live pricing.', body: null },
                { method: 'GET', path: '/api/balance', auth: 'Session cookie', desc: 'Current balance, total topped up, total spent.', body: null },
                { method: 'GET', path: '/api/balance/ledger', auth: 'Session cookie', desc: 'Paginated ledger history (topup / debit / refund rows).', body: null },
                { method: 'GET', path: '/api/usage', auth: 'Session cookie', desc: 'Paginated usage event log. Filter by model, date range.', body: null },
                { method: 'GET', path: '/api/usage/by-model', auth: 'Session cookie', desc: 'Aggregated spend, tokens, and request count per model.', body: null },
                { method: 'GET', path: '/api/usage/daily', auth: 'Session cookie', desc: 'Daily spend and token aggregates for charts.', body: null },
                { method: 'GET', path: '/api/keys', auth: 'Session cookie', desc: 'List your API keys (hash not exposed, prefix only).', body: null },
                { method: 'POST', path: '/api/keys', auth: 'Session cookie', desc: 'Create a new API key. Returns raw key once.', body: '{ label, dailyCapUsd?, monthlyCapUsd?, rateLimitRpm?, allowedModels? }' },
                { method: 'DELETE', path: '/api/keys/:id', auth: 'Session cookie', desc: 'Revoke a key immediately.', body: null },
                { method: 'POST', path: '/api/payments/topup', auth: 'Session cookie', desc: 'Initiate a USDC deposit. Returns Solana Pay URI.', body: '{ amountUsdc }' },
              ].map(ep => (
                <div key={ep.path} className="mb-5 nb-card overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '2px solid #1A1A1A', background: '#1A1A1A' }}>
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded`}
                      style={{
                        background: ep.method === 'POST' ? '#7C3AED' : ep.method === 'DELETE' ? '#FF6B6B' : '#4ECDC4',
                        color: ep.method === 'DELETE' ? 'white' : ep.method === 'POST' ? 'white' : '#1A1A1A',
                      }}>
                      {ep.method}
                    </span>
                    <code className="font-mono text-sm font-bold" style={{ color: '#E5E7EB' }}>{ep.path}</code>
                    <span className="ml-auto text-[9px] font-mono uppercase tracking-widest" style={{ color: '#6B7280' }}>{ep.auth}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm" style={{ color: '#4B5563' }}>{ep.desc}</p>
                    {ep.body && <code className="text-[11px] font-mono block mt-2" style={{ color: '#9CA3AF' }}>{ep.body}</code>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {active === 'sdks' && (
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>Libraries</div>
              <h1 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 7vw, 56px)', color: '#1A1A1A' }}>SDKs</h1>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: '#4B5563' }}>Farebox is OpenAI-wire-compatible. Any library that accepts a custom <code className="font-mono text-xs px-1.5 py-0.5" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 4 }}>base_url</code> works out of the box. No SDK changes required.</p>

              {[
                { name: 'OpenAI Python SDK', install: 'pip install openai', snippet: `from openai import OpenAI\nclient = OpenAI(base_url="https://api.farebox.fun/v1", api_key="sk-fbx-...")` },
                { name: 'OpenAI Node.js SDK', install: 'npm install openai', snippet: `import OpenAI from "openai";\nconst client = new OpenAI({ baseURL: "https://api.farebox.fun/v1", apiKey: "sk-fbx-..." });` },
                { name: 'LangChain Python', install: 'pip install langchain-openai', snippet: `from langchain_openai import ChatOpenAI\nllm = ChatOpenAI(model="claude-opus-4-5", base_url="https://api.farebox.fun/v1", api_key="sk-fbx-...")` },
                { name: 'Vercel AI SDK', install: 'npm install ai @ai-sdk/openai', snippet: `import { createOpenAI } from "@ai-sdk/openai";\nconst farebox = createOpenAI({ baseURL: "https://api.farebox.fun/v1", apiKey: "sk-fbx-..." });\nconst model = farebox("gpt-4.1");` },
              ].map(s => (
                <div key={s.name} className="mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#1A1A1A' }}>{s.name}</h3>
                  <CodeBlock lang="bash" code={s.install} />
                  <CodeBlock lang="python" code={s.snippet} />
                </div>
              ))}
            </div>
          )}

          {active === 'mcp' && (
            <div id="mcp">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>MCP Server</div>
              <h1 className="uppercase leading-none mb-6" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 7vw, 56px)', color: '#1A1A1A' }}>Farebox MCP</h1>
              <div className="flex items-start gap-3 px-5 py-4 mb-8" style={{ background: '#F0FDF4', border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A' }}>
                <span className="shrink-0 text-[9px] font-mono font-black uppercase tracking-widest px-2 py-1 mt-0.5" style={{ background: '#6BCB77', color: '#1A1A1A', borderRadius: 6 }}>Beta · Live</span>
                <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>farebox-mcp is live on npm. Run it directly with <code className="font-mono text-xs">npx farebox-mcp</code> — or download from <code className="font-mono text-xs">api.farebox.fun/api/mcp-server</code>. Requires <code className="font-mono text-xs">FAREBOX_API_KEY</code>.</p>
              </div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4B5563' }}>Install <code className="font-mono px-1.5 py-0.5 text-xs" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 4 }}>farebox-mcp</code> in Claude Desktop or Cursor with one config line. It uses your Farebox API key; <strong>never asks for wallet private keys</strong>.</p>

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-8" style={{ color: '#1A1A1A' }}>Install: Claude Desktop</h2>
              <CodeBlock lang="json" code={`// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "farebox": {
      "command": "npx",
      "args": ["farebox-mcp"],
      "env": {
        "FAREBOX_API_KEY": "sk-fbx-YOUR_KEY"
      }
    }
  }
}`} />

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-8" style={{ color: '#1A1A1A' }}>Available Tools</h2>
              <div className="nb-card overflow-hidden">
                {[
                  ['chat(model, messages, opts)', 'Call any Farebox model with a full messages array.'],
                  ['list_models()', 'Return all available models with live prices.'],
                  ['estimate_cost(model, text)', 'Pre-flight cost estimate before spending.'],
                  ['get_balance()', 'Current credit balance in USD.'],
                  ['get_usage(range)', 'Usage summary for a time range (e.g. "7d", "30d").'],
                ].map(([tool, desc], i) => (
                  <div key={tool as string} className="flex gap-4 items-start px-5 py-3" style={{ borderBottom: i < 4 ? '1px solid #1A1A1A12' : 'none' }}>
                    <code className="font-mono text-xs px-2 py-1 shrink-0" style={{ background: '#7C3AED', color: 'white', borderRadius: 4 }}>{tool}</code>
                    <p className="text-sm" style={{ color: '#4B5563' }}>{desc as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'x402' && (
            <div id="x402">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>Agent Lane</div>
              <h1 className="uppercase leading-none mb-6" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 7vw, 56px)', color: '#1A1A1A' }}>x402 Lane</h1>
              <div className="flex items-start gap-3 px-5 py-4 mb-8" style={{ background: '#F0FDF4', border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A' }}>
                <span className="shrink-0 text-[9px] font-mono font-black uppercase tracking-widest px-2 py-1 mt-0.5" style={{ background: '#6BCB77', color: '#1A1A1A', borderRadius: 6 }}>Alpha · Live</span>
                <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>Discovery endpoint live at <code className="font-mono text-xs">GET /.well-known/x402</code>. The gateway returns <code className="font-mono text-xs">402</code> with a payment quote when called without auth. Full on-chain signature verification ships Q4 2026.</p>
              </div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4B5563' }}>AI agents can call Farebox without an account or API key, using the <strong>x402 pay-per-call protocol</strong> on USDC/Solana. No KYC. No credit card. Pure machine-native payment.</p>

              <h2 className="text-xl font-black uppercase tracking-tight mb-4 mt-8" style={{ color: '#1A1A1A' }}>Flow</h2>
              <CodeBlock lang="http" code={`# 1. Agent sends request without key
POST /v1/chat/completions
→ 402 Payment Required
  { price: "0.0042", asset: "USDC", chain: "solana",
    payTo: "Fbx...", nonce: "xyz", expiresAt: "..." }

# 2. Agent pays on-chain via x402 client library
# 3. Agent retries with payment proof
POST /v1/chat/completions
  X-PAYMENT: <proof>
→ 200 OK (streamed response)

# Price quote TTL: 30 seconds
# Discovery: GET /.well-known/x402`} />

              <div className="mt-8 nb-card" style={{ background: '#1A1A1A', borderColor: '#1A1A1A' }}>
                <div className="p-6">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Use Case</div>
                  <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>Autonomous agents running in Cloudflare Workers, Deno Deploy, or serverless functions that cannot hold a wallet session. They discover the price, pay per call, and never need an account. Agents that call frequently should graduate to a prepaid key for lower effective cost.</p>
                </div>
              </div>
            </div>
          )}

          {active === 'cli' && (
            <div id="cli">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>CLI</div>
              <h1 className="uppercase leading-none mb-6" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 7vw, 56px)', color: '#1A1A1A' }}>fbx CLI</h1>
              <div className="flex items-start gap-3 px-5 py-4 mb-8" style={{ background: '#FFD93D', border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A' }}>
                <span className="shrink-0 text-[9px] font-mono font-black uppercase tracking-widest px-2 py-1 mt-0.5" style={{ background: '#1A1A1A', color: '#FFD93D', borderRadius: 6 }}>Coming Soon · Q3 2026</span>
                <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}><code className="font-mono text-xs">farebox-cli</code> is not yet published to npm. The commands below are the planned interface — running them now will fail.</p>
              </div>
              <CodeBlock lang="bash" code={`npm install -g farebox-cli`} />
              <div className="space-y-2 mt-4">
                {[
                  'fbx keys list',
                  'fbx keys create --label "my-agent" --daily-cap 5',
                  'fbx keys revoke <key-id>',
                  'fbx balance',
                  'fbx usage --30d',
                  'fbx usage --group-by model',
                  'fbx chat -m claude-sonnet-4-5 "Explain x402"',
                ].map(cmd => (
                  <div key={cmd} className="flex items-center gap-3 font-mono text-sm px-4 py-2.5 nb-card-sm" style={{ background: '#FFFBEF' }}>
                    <span style={{ color: '#7C3AED' }}>$</span>
                    <code style={{ color: '#1A1A1A' }}>{cmd}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'errors' && (
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>Errors</div>
              <h1 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 7vw, 56px)', color: '#1A1A1A' }}>Error Codes</h1>
              <div className="nb-card overflow-hidden">
                {[
                  ['402', 'insufficient_balance', 'Credit balance is below the estimated request cost. Top up and retry.', '#FFD93D', '#1A1A1A'],
                  ['401', 'invalid_key', 'API key not found or revoked. Check your key.', '#FF6B6B', 'white'],
                  ['403', 'model_not_allowed', 'This key\'s allowed_models list does not include the requested model.', '#FF6B6B', 'white'],
                  ['429', 'budget_exceeded', 'Daily or monthly cap reached for this key.', '#FF9F43', '#1A1A1A'],
                  ['429', 'rate_limit', 'Requests per minute limit hit. Retry after 1 second.', '#FF9F43', '#1A1A1A'],
                  ['404', 'model_not_found', 'Model ID not recognized. Check /v1/models for valid IDs.', '#9CA3AF', 'white'],
                  ['503', 'provider_unavailable', 'Upstream provider returned 5xx. Retry with exponential backoff.', '#4ECDC4', '#1A1A1A'],
                ].map(([code, name, desc, bg, fg], i) => (
                  <div key={name as string} className="flex gap-4 items-start px-5 py-3" style={{ borderBottom: i < 6 ? '1px solid #1A1A1A12' : 'none' }}>
                    <span className="text-[11px] font-mono font-black shrink-0 px-2 py-0.5"
                      style={{ background: bg as string, color: fg as string, border: '1.5px solid #1A1A1A', borderRadius: 6, boxShadow: '1.5px 1.5px 0 #1A1A1A' }}>
                      {code}
                    </span>
                    <code className="text-xs font-mono shrink-0" style={{ color: '#7C3AED' }}>{name}</code>
                    <p className="text-sm" style={{ color: '#4B5563' }}>{desc as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
