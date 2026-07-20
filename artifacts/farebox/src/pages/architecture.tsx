import React from 'react';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import { Link } from 'wouter';
import { ArrowDown } from 'lucide-react';

/* ── Design tokens ───────────────────────────────────── */
const BORDER  = '2.5px solid #1A1A1A';
const SHADOW  = '4px 4px 0 #1A1A1A';
const RADIUS  = 10;
const CREAM   = '#FFFBEF';
const PURPLE  = '#7C3AED';
const YELLOW  = '#FFD93D';

/* ── Reusable layer box ──────────────────────────────── */
function LayerBox({
  title, items, accent = false,
}: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div
      style={{
        border: BORDER,
        borderRadius: RADIUS,
        boxShadow: accent ? SHADOW : '2px 2px 0 #1A1A1A',
        background: accent ? '#F3EEFF' : '#FFFFFF',
        padding: '18px 20px',
      }}
    >
      <div
        className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] mb-3"
        style={{ color: accent ? PURPLE : '#9CA3AF' }}
      >
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(i => (
          <span
            key={i}
            className="text-xs font-bold"
            style={{
              border: accent ? `1.5px solid ${PURPLE}60` : '1.5px solid #D1D5DB',
              borderRadius: 6,
              padding: '4px 10px',
              background: accent ? `${PURPLE}12` : '#F9FAFB',
              color: accent ? PURPLE : '#374151',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-3">
      <div
        style={{
          width: 32, height: 32,
          border: '2px solid #1A1A1A',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: YELLOW,
          boxShadow: '2px 2px 0 #1A1A1A',
        }}
      >
        <ArrowDown className="w-4 h-4" style={{ color: '#1A1A1A' }} />
      </div>
    </div>
  );
}

export default function Architecture() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
      <TopNav />
      <div className="pt-14">

        {/* ── Hero header ──────────────────────────────── */}
        <div
          className="px-4 sm:px-8 py-10 sm:py-16"
          style={{ borderBottom: BORDER, background: '#FFFBEF' }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4" style={{ color: PURPLE }}>
              — System Design
            </div>
            <h1
              className="uppercase leading-none"
              style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: 'clamp(26px, 7vw, 104px)',
                color: '#1A1A1A',
                letterSpacing: '-0.02em',
              }}
            >
              Architecture
            </h1>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-14 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 sm:gap-12">

          {/* ── LEFT: Diagram ────────────────────────────── */}
          <div>
            {/* Section title */}
            <div className="flex items-center gap-3 mb-8">
              <h2
                className="font-black uppercase"
                style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22, color: '#1A1A1A' }}
              >
                High-Level Layers
              </h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>

            <div className="space-y-0">
              <LayerBox title="Entry Points" items={['Chat Playground', 'REST API / SDK', 'CLI', 'MCP Server', 'x402 Agent Lane']} />
              <Arrow />
              <LayerBox
                title="Gateway Core (Edge)"
                accent
                items={['Auth', 'Balance Check', 'Model Routing', 'Provider Call', 'Streaming Relay', 'Usage Capture', 'Async Metering Queue']}
              />
              <Arrow />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LayerBox title="Provider Pool" items={['Anthropic', 'OpenAI', 'Google', 'xAI', 'Groq', 'DeepInfra']} />
                <LayerBox title="Billing & Metering" items={['Credit Ledger (Postgres)', 'Pricing Table', 'Aggregator', 'Reconciliation']} />
              </div>
              <Arrow />
              <LayerBox title="Surfaces" items={['Dashboard', 'Usage API', 'Webhooks', 'Alerts', 'CSV Export']} />
            </div>

            {/* ── Request lifecycle ──────────────────────── */}
            <div className="flex items-center gap-3 mt-14 mb-6">
              <h2
                className="font-black uppercase"
                style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22, color: '#1A1A1A' }}
              >
                Request Lifecycle
              </h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <div className="text-xs font-mono mb-5" style={{ color: '#7C3AED' }}>
              MONEY PATH — every token that flows through
            </div>

            <div
              style={{
                border: BORDER,
                borderRadius: RADIUS,
                boxShadow: SHADOW,
                overflow: 'hidden',
                background: '#FFFFFF',
              }}
            >
              {[
                ['1', 'Auth', 'Constant-time compare of key hash; load scopes, caps, rate limit from edge cache (fallback to DB).'],
                ['2', 'Pre-flight Balance Check', 'Reject with 402 Payment Required before spending at the provider. Require balance ≥ estimated max cost to prevent negative balances.'],
                ['3', 'Model Routing', 'Map public model name → provider + provider model ID + pricing row. Unknown model → 404 model_not_found.'],
                ['4', 'Relay', 'Stream tokens to the client as they arrive. Do not buffer whole responses. SSE passthrough.'],
                ['5', 'Usage Capture', "Read provider's usage object from the final message. If connection dies early, estimate and flag event estimated=true for reconciliation."],
                ['6', 'Async Billing', 'Pricing + ledger debit off the hot path. Target added latency p95 < 50 ms.'],
              ].map(([num, title, desc], idx, arr) => (
                <div
                  key={num}
                  className="flex gap-4 items-start px-5 py-4"
                  style={{
                    borderBottom: idx < arr.length - 1 ? '2px solid #F3F4F6' : 'none',
                  }}
                >
                  <div
                    className="shrink-0 mt-0.5 flex items-center justify-center font-black text-sm"
                    style={{
                      width: 30, height: 30,
                      background: '#1A1A1A',
                      color: YELLOW,
                      borderRadius: 6,
                      fontFamily: "'Archivo Black', sans-serif",
                    }}
                  >
                    {num}
                  </div>
                  <div>
                    <div
                      className="text-sm font-black uppercase tracking-wide mb-1"
                      style={{ fontFamily: "'Archivo Black', sans-serif", color: '#1A1A1A' }}
                    >
                      {title}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Stack + Data model ─────────────────── */}
          <div className="space-y-10">

            {/* Recommended stack */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2
                  className="font-black uppercase"
                  style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 20, color: '#1A1A1A' }}
                >
                  Recommended Stack
                </h2>
                <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
              </div>
              <div className="space-y-3">
                {[
                  ['Gateway Core',      'Hono on Cloudflare Workers (edge) or LiteLLM Proxy on Fly.io for fastest MVP'],
                  ['Key Service',       'Postgres + KV cache at edge'],
                  ['Credit Ledger',     'Postgres, append-only, single source of truth'],
                  ['Metering Pipeline', 'Cloudflare Queues / Redis → worker → Postgres; ClickHouse at scale'],
                  ['Payments',          'Solana RPC (Helius) + on-chain confirmation watcher'],
                  ['x402 Lane',         'x402 protocol, USDC on Solana'],
                  ['Dashboard',         'React + Recharts (this app)'],
                  ['Observability',     'Structured logs + uptime alerts + Sentry'],
                ].map(([comp, tech]) => (
                  <div
                    key={comp}
                    style={{
                      border: BORDER,
                      borderRadius: 8,
                      boxShadow: '2px 2px 0 #1A1A1A',
                      background: '#FFFFFF',
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] mb-1.5"
                      style={{ color: PURPLE }}
                    >
                      {comp}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                      {tech}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Data Model */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <h2
                  className="font-black uppercase"
                  style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 20, color: '#1A1A1A' }}
                >
                  Core Data Model
                </h2>
                <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
              </div>
              <div
                style={{
                  border: BORDER,
                  borderRadius: RADIUS,
                  boxShadow: SHADOW,
                  background: '#1A1A1A',
                  padding: '20px 22px',
                  overflowX: 'auto',
                }}
              >
                <pre
                  className="whitespace-pre text-xs leading-relaxed"
                  style={{ fontFamily: "'Space Mono', monospace", color: '#D1FAE5' }}
                >{`users(id, wallet_address, status)

api_keys(
  id, user_id, key_hash, label,
  allowed_models[],
  rate_limit_rpm,
  daily_cap_usd, monthly_cap_usd,
  status, revoked_at
)

ledger_entries(
  id, user_id, type,
  -- 'topup'|'debit'|'refund'|'adjustment'
  amount_usd, ref_id,
  balance_after,  -- running balance
  created_at      -- append-only
)

usage_events(
  id, request_id, user_id, api_key_id,
  model, provider,
  input_tokens, output_tokens,
  provider_cost_usd, billed_usd,
  margin_usd, latency_ms,
  status
)

models(
  id, provider, name,
  input_per_mtok_usd,
  output_per_mtok_usd,
  markup_pct
)`}</pre>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  'ledger_entries is append-only; corrections are new adjustment rows.',
                  'Every debit references a request_id; same request_id cannot double-charge.',
                  'Every top-up references a unique tx_signature; same tx cannot credit twice.',
                  'Balance = SUM(ledger_entries.amount) must always be reproducible.',
                ].map(r => (
                  <div key={r} className="flex gap-2 items-start text-xs" style={{ color: '#6B7280' }}>
                    <span className="font-black shrink-0 mt-0.5" style={{ color: PURPLE }}>→</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fallback Routing */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <h2
                  className="font-black uppercase"
                  style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 20, color: '#1A1A1A' }}
                >
                  Fallback Routing
                </h2>
                <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
              </div>
              <div
                style={{
                  border: BORDER,
                  borderRadius: RADIUS,
                  boxShadow: '2px 2px 0 #1A1A1A',
                  background: '#FFFFFF',
                  padding: '18px 20px',
                }}
              >
                <pre
                  className="whitespace-pre text-xs leading-relaxed"
                  style={{ fontFamily: "'Space Mono', monospace", color: '#374151' }}
                >{`try primary provider
  on 5xx / timeout / rate-limit:
    if model has designated fallback:
      retry once on fallback
      tag usage_event.provider
    else:
      surface provider error
      (include provider name)

Rule: never silently swap to a
different model family unless the
key owner opted in.
Honesty over cleverness.`}</pre>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
