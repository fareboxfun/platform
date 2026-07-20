import React from 'react';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import { CheckCircle2, Circle, Clock, Rocket } from 'lucide-react';

const BORDER = '2.5px solid #1A1A1A';
const SHADOW = '4px 4px 0 #1A1A1A';
const PURPLE = '#7C3AED';
const YELLOW = '#FFD93D';
const CREAM  = '#FFFBEF';
const GREEN  = '#6BCB77';
const CORAL  = '#FF6B6B';

type Phase = 'shipped' | 'current' | 'upcoming' | 'future';

const PHASES: { quarter: string; label: string; phase: Phase; items: { title: string; body: string; done?: boolean }[] }[] = [
  {
    quarter: 'Q1 2026',
    label: 'Foundation',
    phase: 'shipped',
    items: [
      { title: 'Multi-provider LLM Gateway',   body: 'OpenAI, Anthropic, Google, xAI, Groq, DeepInfra routing behind a single API.',          done: true },
      { title: 'API Key Auth + Balance System', body: 'Prepaid credit system with per-key daily/monthly caps and usage tracking.',              done: true },
      { title: 'USDC Top-up on Solana',         body: 'Wallet-native onboarding — fund your account by sending USDC to your deposit address.', done: true },
      { title: 'Streaming Relay',               body: 'Server-sent events passthrough with full token streaming to the client.',                done: true },
      { title: 'Usage Dashboard',               body: 'Per-key token usage, cost breakdown, and billing history.',                             done: true },
    ],
  },
  {
    quarter: 'Q2 2026',
    label: 'Agent Infrastructure',
    phase: 'shipped',
    items: [
      { title: 'MCP Server (farebox-mcp)',   body: 'Plug Farebox into Claude Desktop, Cursor, or any MCP-compatible agent framework.',    done: true },
      { title: 'x402 Agent Lane',            body: 'No-account per-request USDC payments over HTTP. Pure machine-native billing.',        done: true },
      { title: 'Skill Marketplace (Beta)',   body: 'Community-published tools callable over MCP or REST. 80% revenue share for builders.', done: true },
      { title: 'Relay Node Network (Alpha)', body: 'Earn USDC by running Farebox compute nodes. Register a node and join the network.',    done: true },
      { title: 'Playground',                body: 'In-browser model comparison with live cost metering.',                               done: true },
    ],
  },
  {
    quarter: 'Q3 2026',
    label: 'Power Tools',
    phase: 'current',
    items: [
      { title: 'fbx CLI',                 body: 'Full terminal interface: fbx chat, fbx keys, fbx balance, fbx usage. Manage your entire gateway from any shell.' },
      { title: 'Embeddings & Multimodal', body: 'text-embedding-3, voyage-3, DALL·E 3, and Stable Diffusion — same API key, same USDC balance, every modality.' },
      { title: 'Team Workspaces',         body: 'Org-level billing with sub-keys, shared balance pools, member invite flows, and role-based access control.' },
      { title: 'Spend Alerts & Webhooks', body: 'Real-time push events for low balance, daily cap hits, and cost spikes. Route to Slack, Discord, or any HTTP endpoint.' },
      { title: 'Agent Spend Policies',    body: 'Time-window budgets, per-model rate limits, auto-pause on overage, and kill-switch controls — enforced per key.' },
    ],
  },
  {
    quarter: 'Q4 2026',
    label: 'Open Protocol',
    phase: 'future',
    items: [
      { title: 'Farebox Protocol Token',   body: 'Governance and fee-sharing token for relay node operators and skill builders.' },
      { title: 'Cross-chain Payments',     body: 'Ethereum, Base, and other EVM chain support for x402 payments.' },
      { title: 'Self-hosted Gateway',      body: 'Open-source Farebox Gateway for enterprise self-deployment.' },
      { title: 'Autonomous Agent Billing', body: 'Agent wallets with auto-recharge, spending policies, and multi-sig approval flows.' },
    ],
  },
];

const PHASE_CONFIG: Record<Phase, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  shipped:  { color: GREEN,  bg: '#F0FDF4', icon: <CheckCircle2 className="w-5 h-5" />, label: 'Shipped' },
  current:  { color: PURPLE, bg: '#F5F3FF', icon: <Clock className="w-5 h-5" />,        label: 'In Progress' },
  upcoming: { color: YELLOW, bg: '#FEFCE8', icon: <Rocket className="w-5 h-5" />,       label: 'Upcoming' },
  future:   { color: CORAL,  bg: '#FFF7F7', icon: <Circle className="w-5 h-5" />,       label: 'Future' },
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
      <TopNav />
      <div className="pt-14">

        {/* Hero */}
        <div className="px-4 sm:px-8 py-10 sm:py-16" style={{ borderBottom: BORDER }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4" style={{ color: PURPLE }}>
              — Product Roadmap
            </div>
            <h1 className="uppercase leading-none mb-4"
              style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(28px, 8vw, 100px)', letterSpacing: '-0.02em' }}>
              Roadmap
            </h1>
            <p className="text-lg max-w-xl" style={{ color: '#6B7280' }}>
              Building the payment layer for the agentic web. Here's where we are and where we're going.
            </p>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-8">
              {Object.entries(PHASE_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2 text-xs font-bold px-3 py-1.5"
                  style={{ border: BORDER, borderRadius: 8, boxShadow: '2px 2px 0 #1A1A1A', background: cfg.bg, color: cfg.color }}>
                  <span style={{ color: cfg.color }}>{cfg.icon}</span>
                  {cfg.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-10 sm:space-y-12">
          {PHASES.map(({ quarter, label, phase, items }) => {
            const cfg = PHASE_CONFIG[phase];
            return (
              <div key={quarter}>
                {/* Phase header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-3 shrink-0">
                    <div style={{ color: cfg.color }}>{cfg.icon}</div>
                    <div>
                      <div className="text-[9px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: cfg.color }}>{quarter}</div>
                      <div className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 18 }}>{label}</div>
                    </div>
                  </div>
                  <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 shrink-0"
                    style={{ background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.color}50`, borderRadius: 6 }}>
                    {cfg.label}
                  </span>
                </div>

                {/* Items */}
                <div style={{ border: BORDER, borderRadius: 12, boxShadow: SHADOW, background: '#FFFFFF', overflow: 'hidden' }}>
                  {items.map((item, i) => (
                    <div key={item.title} className="flex items-start gap-4 px-6 py-4"
                      style={{ borderBottom: i < items.length - 1 ? '1.5px solid #F3F4F6' : 'none' }}>
                      {/* Status dot */}
                      <div className="shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: item.done ? GREEN : phase === 'current' ? PURPLE : '#D1D5DB',
                          background: item.done ? GREEN : 'transparent',
                        }}>
                        {item.done && <Check />}
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-wide mb-0.5"
                          style={{ fontFamily: "'Archivo Black', sans-serif", color: item.done ? '#6B7280' : '#1A1A1A',
                          textDecoration: item.done ? 'line-through' : 'none' }}>
                          {item.title}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Bottom note */}
          <p className="text-xs font-mono text-center" style={{ color: '#9CA3AF' }}>
            Roadmap is subject to change. Ship fast, learn faster. Last updated July 2026.
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}

function Check() {
  return <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
