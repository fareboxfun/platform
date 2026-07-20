import React, { useState } from 'react';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import { Copy, Check, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

const BORDER = '2.5px solid #1A1A1A';
const SHADOW = '4px 4px 0 #1A1A1A';
const PURPLE = '#7C3AED';
const YELLOW = '#FFD93D';
const CREAM  = '#FFFBEF';
const TEAL   = '#4ECDC4';

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return { copied, copy };
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const { copied, copy } = useCopy(code);
  return (
    <div style={{ background: '#1A1A1A', border: BORDER, borderRadius: 12, boxShadow: SHADOW, overflow: 'hidden' }}>
      {label && (
        <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #ffffff12' }}>
          <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#9CA3AF' }}>{label}</span>
          <button onClick={copy} className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest"
            style={{ color: copied ? PURPLE : '#6B7280' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="px-5 py-4 overflow-x-auto text-xs leading-relaxed whitespace-pre"
        style={{ fontFamily: "'Space Mono', monospace", color: '#D1FAE5' }}>{code}</pre>
    </div>
  );
}

const FLOW = `# Step 1 — Agent sends request (no auth header)
POST https://api.farebox.fun/v1/chat/completions
Content-Type: application/json
{ "model": "gpt-4o-mini", "messages": [...] }

# Step 2 — Server responds 402 with payment details
HTTP/1.1 402 Payment Required
X-Payment-Network:  solana
X-Payment-Asset:    USDC
X-Payment-Amount:   0.000013
X-Payment-Address:  FbxVaultXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X-Payment-Memo:     req_abc123

# Step 3 — Client library signs & sends USDC on Solana
# Step 4 — Repeat original request with payment proof
POST https://api.farebox.fun/v1/chat/completions
X-Payment-Signature: <base58-encoded-tx-sig>

# Step 5 — Server confirms, streams response
HTTP/1.1 200 OK
Content-Type: text/event-stream
...`;

const CURL_EXAMPLE = `# Install the x402 CLI helper
npm i -g x402-cli

# Fund your wallet (Solana mainnet, USDC)
x402 fund --amount 5

# Make a request — payment is automatic
x402 curl https://api.farebox.fun/v1/chat/completions \\
  -H 'Content-Type: application/json' \\
  -d '{"model":"claude-3-5-haiku","messages":[{"role":"user","content":"Hello"}]}'`;

const PY_EXAMPLE = `from x402.client import X402Client

client = X402Client(
    wallet_key=os.environ["SOLANA_PRIVATE_KEY"],
    rpc_url="https://api.mainnet-beta.solana.com"
)

response = client.post(
    "https://api.farebox.fun/v1/chat/completions",
    json={
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Summarize this article"}]
    }
)
print(response.json())`;

export default function X402Page() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
      <TopNav />
      <div className="pt-14">

        {/* Hero */}
        <div className="px-4 sm:px-8 py-10 sm:py-16" style={{ borderBottom: BORDER }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4" style={{ color: TEAL }}>
              — HTTP-native Machine Payments
            </div>
            <h1 className="uppercase leading-none mb-4"
              style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(28px, 7vw, 96px)', letterSpacing: '-0.02em' }}>
              x402 Lane
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: '#6B7280' }}>
              The x402 protocol extends HTTP with machine-native micropayments. Your agent pays per request in USDC on Solana — no accounts, no invoices, no API keys required.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {['No API Key', 'No Account', 'USDC on Solana', '~400ms finality', 'Any language'].map(tag => (
                <span key={tag} className="nb-tag font-bold" style={{ background: `${TEAL}18`, color: '#0E7490', borderColor: `${TEAL}50` }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">

          {/* Why x402 */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>Why x402</h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: <Globe className="w-5 h-5" />,  color: TEAL,   title: 'Zero Friction', body: 'No sign-up, no billing cycle, no rate-limit hell. Fund a wallet, call the endpoint.' },
                { icon: <Zap className="w-5 h-5" />,    color: YELLOW, title: 'Per-Token Billing', body: 'Pay only for what you use. Pricing reflects exact provider cost + Farebox margin.' },
                { icon: <Shield className="w-5 h-5" />, color: PURPLE, title: 'Trustless', body: "On-chain confirmation. Farebox never holds your private key. Every payment is auditable." },
              ].map(({ icon, color, title, body }) => (
                <div key={title} style={{ border: BORDER, borderRadius: 12, boxShadow: '3px 3px 0 #1A1A1A', background: '#FFFFFF', padding: '20px' }}>
                  <div className="mb-3" style={{ color }}>{icon}</div>
                  <div className="font-black uppercase text-sm mb-1" style={{ fontFamily: "'Archivo Black', sans-serif" }}>{title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Protocol flow */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>Protocol Flow</h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <CodeBlock code={FLOW} label="HTTP · x402 · Solana" />
          </section>

          {/* Code examples */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>Quick Start</h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <div className="space-y-6">
              <CodeBlock code={CURL_EXAMPLE} label="cURL + x402 CLI" />
              <CodeBlock code={PY_EXAMPLE}   label="Python" />
            </div>
          </section>

          {/* Comparison table */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>
                x402 vs API Key
              </h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <div style={{ border: BORDER, borderRadius: 12, boxShadow: SHADOW, overflow: 'hidden', background: '#FFFFFF' }}>
              <div className="grid grid-cols-3 px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-widest"
                style={{ background: '#1A1A1A', color: '#9CA3AF' }}>
                <span>Feature</span><span>x402 Lane</span><span>API Key</span>
              </div>
              {[
                ['Account required',   '✗ None',             '✓ Yes'],
                ['Private key needed', '✓ Your wallet only', '✗ No'],
                ['Prepay required',    '✗ Pay per call',     '✓ Balance topup'],
                ['Audit trail',        '✓ On-chain',         '✓ Dashboard'],
                ['Agent-native',       '✓ Native',           '⚠ Possible'],
                ['Rate limits',        '✗ None',             '⚠ Per plan'],
              ].map(([feat, x402, api], i, arr) => (
                <div key={feat} className="grid grid-cols-3 px-6 py-3 text-sm"
                  style={{ borderBottom: i < arr.length - 1 ? '1.5px solid #F3F4F6' : 'none' }}>
                  <span className="font-semibold" style={{ color: '#374151' }}>{feat}</span>
                  <span className="font-mono font-bold" style={{ color: x402.startsWith('✓') ? '#16A34A' : x402.startsWith('✗') ? '#DC2626' : '#D97706' }}>{x402}</span>
                  <span className="font-mono font-bold" style={{ color: api.startsWith('✓') ? '#16A34A' : api.startsWith('✗') ? '#DC2626' : '#D97706' }}>{api}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="nb-card p-8 flex items-center justify-between flex-wrap gap-4" style={{ background: '#1A1A1A' }}>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] mb-2" style={{ color: TEAL }}>Start paying per token</div>
              <div className="font-black uppercase text-xl" style={{ fontFamily: "'Archivo Black', sans-serif", color: 'white' }}>
                Fund a Solana wallet. Call the endpoint.
              </div>
            </div>
            <a href="/docs#x402" className="nb-btn nb-btn-primary flex items-center gap-2">
              Read the Docs <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
