import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import {
  Copy, Check, ArrowRight, Terminal, Cpu, Zap, Globe,
  DollarSign, Shield, Server, Activity, TrendingUp, ChevronRight
} from 'lucide-react';

/* ─── copy hook ─────────────────────────────── */
function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copied, copy };
}

/* ─── API base ──────────────────────────────── */
const API_BASE = (() => {
  if (typeof window === 'undefined') return 'https://api.farebox.fun';
  const h = window.location.hostname;
  if (h === 'farebox.fun' || h === 'www.farebox.fun') return 'https://api.farebox.fun';
  return '/api-proxy';
})();

interface RelayStats {
  activeNodes: number;
  totalNodes: number;
  totalRouted: number;
  totalEarned: number;
  marginShare: number;
  payoutCycle: string;
}

/* ─── code block ────────────────────────────── */
function CodeBlock({ code, label }: { code: string; label?: string }) {
  const { copied, copy } = useCopy(code);
  return (
    <div style={{ background: '#1A1A1A', border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A', overflow: 'hidden' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #ffffff12' }}>
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3" style={{ color: '#6B7280' }} />
          {label && <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#9CA3AF' }}>{label}</span>}
        </div>
        <button onClick={copy} className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest transition-colors"
          style={{ color: copied ? '#7C3AED' : '#6B7280' }}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <pre className="px-5 py-4 text-[12px] font-mono leading-relaxed overflow-x-auto" style={{ color: '#E5E7EB' }}>
        {code}
      </pre>
    </div>
  );
}

/* ─── node type card ────────────────────────── */
function NodeCard({
  icon: Icon, title, desc, earn, req, badge, accentColor
}: {
  icon: React.ElementType; title: string; desc: string; earn: string; req: string; badge?: string; accentColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="nb-card flex flex-col overflow-hidden"
      style={{
        transition: 'transform 0.1s, box-shadow 0.1s',
        transform: hovered ? 'translate(-2px,-2px)' : 'none',
        boxShadow: hovered ? `6px 6px 0 #1A1A1A` : '4px 4px 0 #1A1A1A',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Colored top accent bar */}
      <div style={{ height: 6, background: accentColor }} />
      <div className="px-6 pt-5 pb-4 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 flex items-center justify-center" style={{ background: accentColor + '22', border: `2px solid ${accentColor}`, borderRadius: 10 }}>
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          {badge && (
            <span className="text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5"
              style={{ background: '#FFD93D', color: '#1A1A1A', border: '1.5px solid #1A1A1A', borderRadius: 6, boxShadow: '1.5px 1.5px 0 #1A1A1A' }}>
              {badge}
            </span>
          )}
        </div>
        <div className="font-black uppercase text-lg tracking-tight leading-tight mb-2"
          style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
          {title}
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B7280' }}>{desc}</p>
        <div className="space-y-2 pt-3" style={{ borderTop: '2px solid #1A1A1A' }}>
          <div className="flex justify-between text-xs">
            <span className="font-mono" style={{ color: '#9CA3AF' }}>Earnings</span>
            <span className="font-mono font-black" style={{ color: '#1A1A1A' }}>{earn}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-mono" style={{ color: '#9CA3AF' }}>Min. hardware</span>
            <span className="font-mono font-black" style={{ color: '#1A1A1A' }}>{req}</span>
          </div>
        </div>
      </div>
      <div className="px-6 pb-5">
        <a href="#quickstart" className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-widest transition-colors hover:opacity-70" style={{ color: accentColor }}>
          Get started <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

/* ─── step ──────────────────────────────────── */
function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 flex items-center justify-center text-white font-black text-base"
        style={{ background: '#7C3AED', border: '2.5px solid #1A1A1A', borderRadius: 10, boxShadow: '3px 3px 0 #1A1A1A', fontFamily: "'Big Shoulders Display', sans-serif" }}>
        {n}
      </div>
      <div className="pt-1">
        <div className="font-black uppercase text-sm tracking-tight mb-1"
          style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
          {title}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
      </div>
    </div>
  );
}

/* ─── registration modal ───────────────────── */
function RegisterModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', solanaWallet: '', endpoint: '', maxRps: '200' });
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error' | 'unauth'>('idle');

  const submit = async () => {
    if (!form.name || !form.solanaWallet || !form.endpoint) return;
    setState('loading');
    try {
      const r = await fetch(`${API_BASE}/api/relay/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, solanaWallet: form.solanaWallet, endpoint: form.endpoint, maxRps: parseInt(form.maxRps, 10) || 200 }),
      });
      if (r.status === 401) { setState('unauth'); return; }
      if (!r.ok) { setState('error'); return; }
      setState('success');
    } catch { setState('error'); }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #1A1A1A', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, background: 'white', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: 9, fontFamily: "'Space Mono', monospace", fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#6B7280', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: '#FFFBEF', border: '2.5px solid #1A1A1A', borderRadius: 16, boxShadow: '6px 6px 0 #1A1A1A', width: '100%', maxWidth: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7C3AED', marginBottom: 4 }}>— Relay Network</div>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 24, fontWeight: 900, textTransform: 'uppercase', color: '#1A1A1A', margin: 0 }}>Register Your Node</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '2px solid #1A1A1A', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>✕</button>
        </div>

        {state === 'success' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 900, fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 20, textTransform: 'uppercase', marginBottom: 8 }}>Node Registered!</div>
            <p style={{ color: '#6B7280', fontSize: 13 }}>Your node is pending review. You'll receive a heartbeat token by email to start routing traffic.</p>
            <button onClick={onClose} className="nb-btn nb-btn-primary" style={{ marginTop: 20 }}>Done</button>
          </div>
        ) : state === 'unauth' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <div style={{ fontWeight: 900, fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 20, textTransform: 'uppercase', marginBottom: 8 }}>Sign In Required</div>
            <p style={{ color: '#6B7280', fontSize: 13 }}>You need a Farebox account to register a relay node. Sign in to continue.</p>
            <a href="/dashboard" className="nb-btn nb-btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Go to Dashboard <ArrowRight className="w-4 h-4" /></a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Node Name</label>
              <input style={inputStyle} placeholder="e.g. tokyo-vps-01" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Solana Wallet (USDC payouts)</label>
              <input style={inputStyle} placeholder="FBx...your_solana_address" value={form.solanaWallet} onChange={e => setForm(f => ({ ...f, solanaWallet: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Node Endpoint URL</label>
              <input style={inputStyle} placeholder="https://relay.yourdomain.com" value={form.endpoint} onChange={e => setForm(f => ({ ...f, endpoint: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Max Requests/sec</label>
              <input style={inputStyle} type="number" placeholder="200" value={form.maxRps} onChange={e => setForm(f => ({ ...f, maxRps: e.target.value }))} />
            </div>
            {state === 'error' && <p style={{ color: '#F87171', fontSize: 12, fontFamily: 'monospace', margin: 0 }}>Registration failed. Please try again.</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={onClose} className="nb-btn nb-btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={submit} disabled={state === 'loading' || !form.name || !form.solanaWallet || !form.endpoint} className="nb-btn nb-btn-primary" style={{ flex: 2 }}>
                {state === 'loading' ? 'Registering…' : 'Register Node'} {state !== 'loading' && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── main ──────────────────────────────────── */
export default function ComputePage() {
  const [relayStats, setRelayStats] = useState<RelayStats | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/relay/stats`)
      .then(r => r.json())
      .then(d => setRelayStats(d as RelayStats))
      .catch(() => {/* silently fail — stats are a bonus */});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#FFFBEF', fontFamily: "'Space Grotesk', sans-serif" }}>
      {showRegModal && <RegisterModal onClose={() => setShowRegModal(false)} />}
      <TopNav />

      {/* ── HERO ──────────────────────────────── */}
      <section className="pt-14" style={{ borderBottom: '2.5px solid #1A1A1A' }}>
        <div className="max-w-6xl mx-auto px-8 pt-16 pb-0 grid lg:grid-cols-2 gap-12 items-end">
          {/* Left */}
          <div>
            <div className="text-[9px] font-mono font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>
              — Farebox Relay Network
            </div>
            <h1 className="font-black uppercase tracking-tighter leading-none mb-6"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 'clamp(40px,6vw,72px)', color: '#1A1A1A' }}>
              RUN A NODE.<br />
              <span style={{ color: '#7C3AED' }}>EARN USDC.</span>
            </h1>
            <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: '#374151' }}>
              Farebox Compute is a permissionless relay network. Run a routing node, forward LLM requests to providers, and earn <strong>80% of the routing margin</strong> — paid weekly in USDC to your Solana wallet.
            </p>

            {/* Stat badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { label: '80%', sub: 'margin share', color: '#7C3AED' },
                { label: 'USDC', sub: 'Solana', color: '#4ECDC4' },
                { label: 'Open', sub: 'permissionless', color: '#FFD93D' },
              ].map(({ label, sub, color }) => (
                <div key={label} className="px-4 py-2.5 flex flex-col items-center min-w-[80px]"
                  style={{ background: 'white', border: '2.5px solid #1A1A1A', borderRadius: 10, boxShadow: '3px 3px 0 #1A1A1A' }}>
                  <div className="text-base font-black uppercase tracking-tight" style={{ fontFamily: "'Big Shoulders Display', sans-serif", color }}>{label}</div>
                  <div className="text-[8px] font-mono uppercase tracking-widest mt-0.5" style={{ color: '#9CA3AF' }}>{sub}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <a href="#quickstart" className="nb-btn nb-btn-primary">
                Start a Node <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a href="#economics" className="nb-btn nb-btn-outline">
                Economics
              </a>
            </div>
          </div>

          {/* Right — live stats panel */}
          <div className="nb-card self-end overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '2px solid #1A1A1A', background: '#1A1A1A' }}>
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em]" style={{ color: '#9CA3AF' }}>Relay Network — Live</span>
              <span className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-wider" style={{ color: '#4ADE80' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#4ADE80' }} />
                {relayStats !== null ? `${relayStats.activeNodes} node${relayStats.activeNodes !== 1 ? 's' : ''} active` : 'Fetching…'}
              </span>
            </div>
            {([
              { label: 'Active relay nodes',   value: relayStats !== null ? String(relayStats.activeNodes) : '…', sub: relayStats !== null ? `${relayStats.totalNodes} registered total` : '' },
              { label: 'Requests routed',      value: relayStats !== null ? relayStats.totalRouted.toLocaleString() : '…', sub: 'all-time' },
              { label: 'Total node earnings',  value: relayStats !== null ? `${relayStats.totalEarned.toFixed(4)}` : '…', sub: 'USDC paid out' },
              { label: 'Routing margin share', value: relayStats !== null ? `${Math.round(relayStats.marginShare * 100)}%` : '80%', sub: 'of gateway spread' },
              { label: 'Payout frequency',     value: 'Weekly', sub: 'every Sunday UTC' },
              { label: 'Min. withdrawal',      value: '$1 USDC', sub: 'Solana mainnet' },
            ] as { label: string; value: string; sub: string }[]).map(({ label, value, sub }, i) => (
              <div key={label} className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: i < 5 ? '1px solid #1A1A1A20' : 'none' }}>
                <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{label}</span>
                <div className="text-right">
                  <span className="text-sm font-mono font-black" style={{ color: '#1A1A1A' }}>{value}</span>
                  {sub && <div className="text-[9px] font-mono" style={{ color: '#9CA3AF' }}>{sub}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────── */}
      <section style={{ borderBottom: '2.5px solid #1A1A1A', background: 'white' }}>
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-[9px] font-mono font-black uppercase tracking-[0.25em] mb-2" style={{ color: '#7C3AED' }}>— How it works</div>
          <h2 className="font-black uppercase tracking-tight mb-12"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40, color: '#1A1A1A' }}>
            Four Steps to Earning
          </h2>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            <Step n={1} title="Install the CLI"
              body="Install fbx-relay via npm or download a single binary. No build tools, no Docker. Runs anywhere Node 18+ is available." />
            <Step n={2} title="Register your wallet"
              body="Connect a Solana wallet address. Your node receives a unique relay ID tied to your public key — no private key ever leaves your machine." />
            <Step n={3} title="Forward requests"
              body="Your node joins the routing pool. Farebox load-balances real LLM requests to your node; you proxy them to the upstream provider and return the streamed response." />
            <Step n={4} title="Collect USDC"
              body="Every Sunday, your accumulated routing margin (80% of the spread between gateway price and provider cost) is transferred to your Solana wallet." />
          </div>
        </div>
      </section>

      {/* ── NODE TYPES ────────────────────────── */}
      <section style={{ borderBottom: '2.5px solid #1A1A1A' }}>
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-[9px] font-mono font-black uppercase tracking-[0.25em] mb-2" style={{ color: '#7C3AED' }}>— Node types</div>
          <h2 className="font-black uppercase tracking-tight mb-10"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40, color: '#1A1A1A' }}>
            Choose Your Role
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <NodeCard
              icon={Globe}
              title="Relay Node"
              desc="Route LLM API requests between agents and upstream providers. Pure TCP/HTTP forwarding — no GPU required."
              earn="80% of routing margin"
              req="1 vCPU · 512 MB RAM"
              badge="Available"
              accentColor="#7C3AED"
            />
            <NodeCard
              icon={Cpu}
              title="Inference Node"
              desc="Run open-source models locally (Llama, Mistral, DeepSeek). Serve inferences directly and earn per token generated."
              earn="90% of inference revenue"
              req="GPU 12 GB+ VRAM"
              badge="Q4 2026"
              accentColor="#4ECDC4"
            />
            <NodeCard
              icon={Shield}
              title="Validator Node"
              desc="Verify billing records and sign off on micropayment settlements on-chain. Stake required for slashing protection."
              earn="5% of settlement volume"
              req="1 vCPU · stake 10 USDC"
              badge="Q1 2027"
              accentColor="#FF9F43"
            />
          </div>
        </div>
      </section>

      {/* ── ECONOMICS ─────────────────────────── */}
      <section id="economics" style={{ borderBottom: '2.5px solid #1A1A1A', background: 'white' }}>
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-[9px] font-mono font-black uppercase tracking-[0.25em] mb-2" style={{ color: '#7C3AED' }}>— Economics</div>
          <h2 className="font-black uppercase tracking-tight mb-4"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40, color: '#1A1A1A' }}>
            Revenue Split
          </h2>
          <p className="text-sm mb-10 max-w-xl" style={{ color: '#6B7280' }}>
            Every dollar a user pays to Farebox is split transparently. Relay operators capture the majority; the protocol retains a thin slice for infra and treasury buybacks.
          </p>

          {/* Split visual */}
          <div className="flex flex-col md:flex-row gap-0 mb-10 overflow-hidden" style={{ border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A' }}>
            {[
              { pct: 80, label: 'Relay Operator', color: '#7C3AED', sub: 'You' },
              { pct: 15, label: 'Farebox Protocol', color: '#1A1A1A', sub: 'infra + team' },
              { pct: 5,  label: 'Buyback',         color: '#4338CA', sub: 'token burn' },
            ].map(({ pct, label, color, sub }, i) => (
              <div key={label} className="flex flex-col justify-between p-5"
                style={{ flex: pct, background: color, minWidth: 80, borderRight: i < 2 ? '2px solid #1A1A1A40' : 'none' }}>
                <div className="text-3xl font-black text-white" style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
                  {pct}%
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-white">{label}</div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Example earnings table */}
          <div className="nb-card overflow-hidden">
            <div className="px-5 py-3" style={{ borderBottom: '2px solid #1A1A1A', background: '#1A1A1A' }}>
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em]" style={{ color: '#9CA3AF' }}>
                Example earnings — relay node routing 1% of Farebox traffic
              </span>
            </div>
            <div>
              {[
                { traffic: '$1,000 / mo',  node: '$800 / mo',    provider: '$200 stays w/ protocol' },
                { traffic: '$5,000 / mo',  node: '$4,000 / mo',  provider: '' },
                { traffic: '$25,000 / mo', node: '$20,000 / mo', provider: '' },
              ].map(({ traffic, node, provider }, i) => (
                <div key={i} className="grid grid-cols-3 px-5 py-3 text-xs font-mono" style={{ borderBottom: i < 2 ? '1px solid #1A1A1A15' : 'none' }}>
                  <span style={{ color: '#6B7280' }}>{traffic} gateway margin</span>
                  <span className="font-black" style={{ color: '#7C3AED' }}>{node}</span>
                  <span style={{ color: '#9CA3AF' }}>{provider}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICKSTART ────────────────────────── */}
      <section id="quickstart" style={{ borderBottom: '2.5px solid #1A1A1A' }}>
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-[9px] font-mono font-black uppercase tracking-[0.25em] mb-2" style={{ color: '#7C3AED' }}>— Quick start</div>
          <h2 className="font-black uppercase tracking-tight mb-3"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40, color: '#1A1A1A' }}>
            Live in 60 Seconds
          </h2>
          <p className="text-sm mb-8 max-w-xl" style={{ color: '#6B7280' }}>
            One binary, one wallet, one command. Your node is live immediately after registering.
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <CodeBlock label="1 · Install" code={`# npm (Node 18+)
npm install -g fbx-relay

# or download binary
curl -fsSL https://get.farebox.fun/relay | bash`} />
              <CodeBlock label="2 · Register your Solana wallet" code={`fbx-relay init --wallet <YOUR_SOLANA_ADDRESS>

# Outputs your Relay ID:
# relay_7xK3mN...`} />
              <CodeBlock label="3 · Start routing" code={`fbx-relay start

# Listening on :8787
# Registered with Farebox network
# Routing pool: 1 node active`} />
            </div>

            {/* Config + notes */}
            <div className="space-y-4">
              <CodeBlock label="Optional · config.toml" code={`[relay]
listen_port   = 8787
max_rps       = 200        # requests per second
log_level     = "info"

[wallet]
address       = "YOUR_SOLANA_ADDRESS"
payout_day    = "sunday"   # UTC

[tls]
enabled       = true
cert_path     = "/etc/ssl/certs/farebox.crt"`} />

              <div className="nb-card overflow-hidden">
                <div className="px-4 py-2.5" style={{ borderBottom: '2px solid #1A1A1A', background: '#1A1A1A' }}>
                  <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em]" style={{ color: '#9CA3AF' }}>Security notes</span>
                </div>
                {[
                  '🔒 Only your public wallet address is registered — no private keys',
                  '🔒 All upstream API credentials are held by Farebox, never your node',
                  '🔒 Node traffic is mTLS-terminated end-to-end',
                  '🔒 USDC payouts are on-chain and auditable at any time',
                ].map((note, i) => (
                  <div key={i} className="px-4 py-2.5 text-xs font-mono" style={{ borderBottom: i < 3 ? '1px solid #1A1A1A12' : 'none', color: '#374151' }}>{note}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HARDWARE REQUIREMENTS ─────────────── */}
      <section style={{ borderBottom: '2.5px solid #1A1A1A', background: 'white' }}>
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-[9px] font-mono font-black uppercase tracking-[0.25em] mb-2" style={{ color: '#7C3AED' }}>— Requirements</div>
          <h2 className="font-black uppercase tracking-tight mb-10"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40, color: '#1A1A1A' }}>
            Relay Node Hardware
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                tier: 'Minimum',
                specs: ['1 vCPU', '512 MB RAM', '10 GB disk', '50 Mbps uplink', 'Node 18+'],
                accentColor: '#9CA3AF',
              },
              {
                tier: 'Recommended',
                specs: ['2 vCPU', '2 GB RAM', '20 GB SSD', '200 Mbps uplink', 'Node 20 LTS'],
                accentColor: '#7C3AED',
                highlight: true,
              },
              {
                tier: 'High-throughput',
                specs: ['4+ vCPU', '4 GB RAM', '40 GB NVMe', '1 Gbps uplink', 'Dedicated IP'],
                accentColor: '#1A1A1A',
              },
            ].map(({ tier, specs, accentColor, highlight }) => (
              <div key={tier} className="nb-card overflow-hidden"
                style={highlight ? { border: '2.5px solid #7C3AED', boxShadow: '4px 4px 0 #7C3AED' } : {}}>
                <div style={{ height: 4, background: accentColor }} />
                <div className="px-5 py-3" style={{ borderBottom: '1.5px solid #1A1A1A20' }}>
                  <span className="text-xs font-mono font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>{tier}</span>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {specs.map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs font-mono" style={{ color: '#374151' }}>
                      <ChevronRight className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-mono mt-4" style={{ color: '#9CA3AF' }}>
            Compatible with any VPS, bare metal, home server, or cloud instance. AWS t3.micro qualifies at minimum tier.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section style={{ background: '#1A1A1A', borderBottom: '2.5px solid #1A1A1A' }}>
        <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-[9px] font-mono font-black uppercase tracking-[0.25em] mb-3" style={{ color: '#7C3AED' }}>
              — Alpha · Open Registration
            </div>
            <h2 className="font-black uppercase tracking-tight text-white mb-2"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36 }}>
              Register Your Node
            </h2>
            <p className="text-sm max-w-md" style={{ color: '#9CA3AF' }}>
              The Farebox relay network is live and accepting nodes. Register now, get a heartbeat token, and start earning 80% of routing margin in USDC — deposited weekly.
            </p>
            {relayStats !== null && (
              <div className="flex items-center gap-2 mt-4">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ADE80' }} />
                <span className="text-xs font-mono" style={{ color: '#4ADE80' }}>
                  {relayStats.totalNodes} node{relayStats.totalNodes !== 1 ? 's' : ''} registered · {relayStats.activeNodes} active
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button onClick={() => setShowRegModal(true)} className="nb-btn nb-btn-primary">
              Register Node <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a href="https://t.me/farebox" target="_blank" rel="noopener noreferrer"
              className="nb-btn nb-btn-yellow">
              Join Telegram
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
