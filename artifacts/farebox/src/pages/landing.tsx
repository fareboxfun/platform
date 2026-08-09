import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ChevronRight, Twitter, Github, Send, BookOpen, Copy, Check } from 'lucide-react';
import { TopNav } from '../components/top-nav';
import { Logo } from '../components/logo';
import { Footer } from '../components/footer';
import { useWalletAuth as usePrivyAuth } from '../lib/wallet';
import { useQuery } from '@tanstack/react-query';

/* ── platform metrics hook (public endpoint) ── */
interface PlatformMetrics {
  totalRequests: number;
  totalTokens: number;
  totalBilledUsd: number;
  avgDailyRequests: number;
  avgDailyBilledUsd: number;
  activeModelCount: number;
}

function usePlatformMetrics() {
  return useQuery<PlatformMetrics>({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const r = await fetch(`https://api.farebox.fun/api/platform/metrics`);
      if (!r.ok) throw new Error('metrics fetch failed');
      return r.json();
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

function fmtBig(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

/* ── Live metrics strip ────────────────────── */
function LiveMetricsStrip() {
  const { data, isError } = usePlatformMetrics();

  const metrics = [
    {
      label: 'Agent Calls Served',
      value: data ? fmtBig(data.totalRequests) : '—',
      sub: 'API + gateway inference',
      color: '#7C3AED',
      bg: '#F3F0FF',
    },
    {
      label: 'Tokens Processed',
      value: data ? fmtBig(data.totalTokens) : '—',
      sub: 'cumulative all-time',
      color: '#1A1A1A',
      bg: '#FFD93D',
    },
    {
      label: 'Avg Cost / Day',
      value: data ? `$${data.avgDailyBilledUsd.toFixed(2)}` : '—',
      sub: '7-day rolling average',
      color: '#1A1A1A',
      bg: '#4ECDC4',
    },
    {
      label: 'Models Active',
      value: data ? String(data.activeModelCount) : '—',
      sub: 'across 6 providers',
      color: '#1A1A1A',
      bg: '#FF6B6B',
    },
  ];

  return (
    <div style={{ borderTop: '2.5px solid #1A1A1A', borderBottom: '2.5px solid #1A1A1A', background: '#FFFBEF' }} className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <span className={`w-2.5 h-2.5 rounded-full ${isError ? 'bg-[#FF6B6B]' : 'bg-[#6BCB77] animate-pulse'}`} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#7C3AED]">
            Live Platform Metrics
          </span>
        </div>
        {/* 4 metric boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(m => (
            <div
              key={m.label}
              style={{
                background: m.bg,
                border: '2.5px solid #1A1A1A',
                borderRadius: 12,
                boxShadow: '4px 4px 0 #1A1A1A',
                padding: '20px 20px',
              }}
            >
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] mb-2 truncate" style={{ color: m.color === '#1A1A1A' ? '#1A1A1A99' : '#7C3AED99' }}>
                {m.label}
              </div>
              <div
                className="font-black tracking-tight leading-none mb-1"
                style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 28, color: m.color }}
              >
                {m.value}
              </div>
              <div className="text-[9px] font-mono" style={{ color: m.color === '#1A1A1A' ? '#1A1A1A80' : '#7C3AED80' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── feature data ─────────────────────────────── */
const FEATURES = [
  {
    num: '01',
    title: 'Unified API',
    body: 'Swap models instantly. Standard OpenAI format across Claude, Gemini, Grok, and GPT. Zero SDK changes.',
    accent: '#7C3AED',
    bg: 'white',
  },
  {
    num: '02',
    title: 'USDC Metering',
    body: 'Top up a prepaid balance with USDC on Solana. No monthly commitments. Pay precisely for tokens used.',
    accent: '#FFD93D',
    bg: '#FFFBEF',
  },
  {
    num: '03',
    title: 'Agent Native',
    body: 'Give autonomous agents their own keys. Set hard daily caps to prevent runaway spend loops.',
    accent: '#4ECDC4',
    bg: 'white',
  },
  {
    num: '04',
    title: 'Zero Margin Padding',
    body: 'Transparent cost pass-through + fixed markup per 1M tokens. No surprises at month-end.',
    accent: '#FF6B6B',
    bg: '#FFFBEF',
  },
];

const PROVIDERS = [
  { name: 'Claude Opus 4.5',     sub: 'Anthropic'  },
  { name: 'Claude Sonnet 4.5',   sub: 'Anthropic'  },
  { name: 'Claude Haiku 3.5',    sub: 'Anthropic'  },
  { name: 'GPT-5.6',             sub: 'OpenAI'     },
  { name: 'GPT-5.6 Luna',        sub: 'OpenAI'     },
  { name: 'GPT-5.6 Sol',         sub: 'OpenAI'     },
  { name: 'o3',                  sub: 'OpenAI'     },
  { name: 'Gemini 2.5 Pro',      sub: 'Google'     },
  { name: 'Gemini 2.5 Flash',    sub: 'Google'     },
  { name: 'Grok 4.5',            sub: 'xAI'        },
  { name: 'Llama 4 Maverick',    sub: 'Meta'       },
  { name: 'Llama 4 Scout',       sub: 'Meta'       },
  { name: 'DeepSeek V4-Pro',     sub: 'DeepSeek'   },
  { name: 'DeepSeek V4-Flash',   sub: 'DeepSeek'   },
  { name: 'Mistral Large 3',     sub: 'Mistral'    },
  { name: 'Qwen3-235B',          sub: 'Alibaba'    },
];

/* ─── code snippets ────────────────────────────── */
const SNIPPETS = {
  python: {
    lines: [
      { t: 'dim',    v: 'from openai import OpenAI' },
      { t: 'blank',  v: '' },
      { t: 'dim',    v: 'client = OpenAI(' },
      { t: 'indent', v: '  base_url=', suffix: '"https://api.farebox.fun/v1"', sc: '#A78BFA' },
      { t: 'indent', v: '  api_key=',  suffix: '"sk-fbx-..."',                  sc: '#34D399' },
      { t: 'dim',    v: ')' },
      { t: 'blank',  v: '' },
      { t: 'dim',    v: 'response = client.chat.completions.create(' },
      { t: 'indent', v: '  model=',    suffix: '"claude-opus-4-5"',              sc: '#34D399' },
      { t: 'indent', v: '  messages=', suffix: '[{"role":"user","content":"…"}]', sc: '#FCD34D' },
      { t: 'dim',    v: ')' },
    ],
    raw: `from openai import OpenAI\n\nclient = OpenAI(\n  base_url="https://api.farebox.fun/v1",\n  api_key="sk-fbx-..."\n)\n\nresponse = client.chat.completions.create(\n  model="claude-opus-4-5",\n  messages=[{"role":"user","content":"…"}]\n)`,
  },
  typescript: {
    lines: [
      { t: 'dim',    v: 'import OpenAI from "openai";' },
      { t: 'blank',  v: '' },
      { t: 'dim',    v: 'const client = new OpenAI({' },
      { t: 'indent', v: '  baseURL: ', suffix: '"https://api.farebox.fun/v1"',   sc: '#A78BFA' },
      { t: 'indent', v: '  apiKey: ',  suffix: '"sk-fbx-..."',                   sc: '#34D399' },
      { t: 'dim',    v: '});' },
      { t: 'blank',  v: '' },
      { t: 'dim',    v: 'const response = await client.chat.completions.create({' },
      { t: 'indent', v: '  model: ',   suffix: '"claude-opus-4-5"',              sc: '#34D399' },
      { t: 'indent', v: '  messages: ',suffix: '[{role:"user",content:"…"}]',    sc: '#FCD34D' },
      { t: 'dim',    v: '});' },
    ],
    raw: `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://api.farebox.fun/v1",\n  apiKey: "sk-fbx-..."\n});\n\nconst response = await client.chat.completions.create({\n  model: "claude-opus-4-5",\n  messages: [{role:"user",content:"…"}]\n});`,
  },
};

/* Win98 raised button helper */
const w98raised = '2px 2px 0 0 #fff inset, -2px -2px 0 0 #808080 inset, 1px 1px 0 0 #dfdfdf inset, -1px -1px 0 0 #404040 inset';
const w98sunken = '-2px -2px 0 0 #fff inset, 2px 2px 0 0 #808080 inset, -1px -1px 0 0 #dfdfdf inset, 1px 1px 0 0 #404040 inset';
const w98frame  = '2px 2px 0 0 #fff inset, -2px -2px 0 0 #404040 inset, 1px 1px 0 0 #dfdfdf inset, -1px -1px 0 0 #808080 inset';

function Win98Btn({ label, onClick, title }: { label: string; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: '#C0C0C0',
        boxShadow: w98raised,
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        color: '#000',
        padding: '1px 4px',
        minWidth: 18,
        height: 18,
        cursor: 'default',
        userSelect: 'none',
        lineHeight: 1,
      }}
      onMouseDown={e => (e.currentTarget.style.boxShadow = w98sunken)}
      onMouseUp={e =>  (e.currentTarget.style.boxShadow = w98raised)}
      onMouseLeave={e =>(e.currentTarget.style.boxShadow = w98raised)}
    >
      {label}
    </button>
  );
}

function CodeSection() {
  const [tab, setTab] = useState<'python' | 'typescript'>('python');
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(SNIPPETS[tab].raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const snippet = SNIPPETS[tab];
  const filename = tab === 'python' ? 'farebox_example.py' : 'farebox_example.ts';

  return (
    <section style={{ background: 'white', borderTop: '2.5px solid #1A1A1A', borderBottom: '2.5px solid #1A1A1A' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr]">

        {/* ── LEFT: copy ── */}
        <div
          className="relative p-6 sm:p-10 lg:p-14 flex flex-col justify-center gap-6 sm:gap-8"
          style={{ borderRight: '2.5px solid #1A1A1A' }}
        >
          {/* NB accent corner */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, background: '#7C3AED', borderBottomRightRadius: 12 }} />

          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#7C3AED' }}>
              Drop-in Replacement
            </div>
            <h2
              className="uppercase leading-[0.88]"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(44px, 5vw, 76px)', color: '#1A1A1A' }}
            >
              Change<br />One URL.
            </h2>
          </div>

          <p className="text-sm text-black/60 max-w-xs leading-relaxed" style={{ borderLeft: '4px solid #7C3AED', paddingLeft: 16 }}>
            Same OpenAI SDK. Same message format. Point{' '}
            <code className="font-mono" style={{ color: '#7C3AED' }}>base_url</code> at Farebox and swap your key.
          </p>

          <div className="space-y-3">
            {[
              'Top up balance via Solana Pay',
              'Generate an API key in the dashboard',
              'Send requests, any model, one key',
            ].map((step, i) => (
              <div key={step} className="flex items-start gap-3 text-sm text-black/70">
                <span
                  className="mt-px text-[10px] font-black flex items-center justify-center shrink-0 text-white"
                  style={{ width: 22, height: 22, background: '#7C3AED', border: '2px solid #1A1A1A', borderRadius: 6, boxShadow: '2px 2px 0 #1A1A1A' }}
                >
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Win98 window ── */}
        <div className="flex items-center justify-center p-4 sm:p-8 lg:p-10" style={{ background: '#FFFBEF' }}>
          {/* window frame */}
          <div className="w-full max-w-[540px]" style={{ background: '#C0C0C0', boxShadow: w98frame, fontFamily: 'Arial, sans-serif' }}>

            {/* title bar */}
            <div
              className="flex items-center justify-between px-2 py-[3px] select-none"
              style={{ background: 'linear-gradient(to right, #000080, #1084D0)' }}
            >
              <div className="flex items-center gap-1.5">
                {/* tiny app icon — coloured squares */}
                <div className="flex gap-px shrink-0">
                  <span style={{ width: 6, height: 6, background: '#7C3AED', display: 'inline-block' }} />
                  <span style={{ width: 6, height: 6, background: '#A78BFA', display: 'inline-block' }} />
                </div>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{filename}</span>
              </div>
              <div className="flex items-center gap-px">
                <Win98Btn label="─" title="Minimise" />
                <Win98Btn label="□" title="Maximise" />
                <Win98Btn label="✕" title="Close" />
              </div>
            </div>

            {/* menu bar / tab strip */}
            <div
              className="flex items-end gap-0 px-1 pt-1 border-b"
              style={{ borderColor: '#808080', background: '#C0C0C0' }}
            >
              {(['python', 'typescript'] as const).map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      fontSize: 11,
                      padding: '3px 14px 2px',
                      marginBottom: active ? -1 : 0,
                      marginTop: active ? 0 : 2,
                      background: active ? '#C0C0C0' : '#A8A8A8',
                      boxShadow: active
                        ? '2px 0 0 0 #fff inset, -1px 0 0 0 #808080 inset, 0 2px 0 0 #fff inset, 2px 2px 0 0 #dfdfdf inset'
                        : '1px 0 0 0 #fff inset, -1px 0 0 0 #808080 inset, 0 1px 0 0 #dfdfdf inset',
                      color: '#000',
                      cursor: 'default',
                      borderBottom: active ? '1px solid #C0C0C0' : 'none',
                      position: 'relative',
                      zIndex: active ? 1 : 0,
                      userSelect: 'none',
                      fontWeight: active ? 'bold' : 'normal',
                    }}
                  >
                    {t === 'python' ? 'Python' : 'TypeScript'}
                  </button>
                );
              })}
            </div>

            {/* code area — sunken panel */}
            <div className="p-2" style={{ background: '#C0C0C0' }}>
              <div
                className="overflow-x-auto"
                style={{
                  background: '#1E1E1E',
                  boxShadow: w98sunken,
                  padding: '12px 14px',
                  minHeight: 260,
                }}
              >
                <pre style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 12.5, lineHeight: 1.65, margin: 0, color: '#D4D4D4' }}>
                  {snippet.lines.map((line, i) =>
                    line.t === 'blank' ? (
                      <div key={i} style={{ height: 10 }} />
                    ) : (
                      <div key={i}>
                        {line.suffix ? (
                          <>
                            <span style={{ color: '#9CDCFE' }}>{line.v}</span>
                            <span style={{ color: line.sc }}>{line.suffix}</span>
                          </>
                        ) : (
                          <span style={{ color: '#D4D4D4' }}>{line.v}</span>
                        )}
                      </div>
                    )
                  )}
                </pre>
              </div>
            </div>

            {/* status bar */}
            <div
              className="flex items-center justify-between px-2 py-[3px]"
              style={{ background: '#C0C0C0', borderTop: '1px solid #808080' }}
            >
              <div style={{ boxShadow: w98sunken, padding: '1px 6px', fontSize: 10, color: '#000', background: '#C0C0C0' }}>
                {filename}
              </div>
              <button
                onClick={copy}
                style={{
                  boxShadow: w98raised,
                  background: '#C0C0C0',
                  padding: '1px 10px',
                  fontSize: 10,
                  fontFamily: 'Arial, sans-serif',
                  color: '#000',
                  cursor: 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  userSelect: 'none',
                }}
                onMouseDown={e => (e.currentTarget.style.boxShadow = w98sunken)}
                onMouseUp={e =>  (e.currentTarget.style.boxShadow = w98raised)}
                onMouseLeave={e =>(e.currentTarget.style.boxShadow = w98raised)}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── main component ───────────────────────────── */
export default function Landing() {
  const { ready, authenticated, login, walletShort } = usePrivyAuth();

  return (
    <div
      className="min-h-screen text-foreground selection:bg-primary selection:text-white"
      style={{ background: '#FFFBEF', fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ── FIXED SOCIAL SIDEBAR ─────────────────── */}
      <aside
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col"
        style={{
          background: 'white',
          border: '2.5px solid #1A1A1A',
          borderRight: 'none',
          borderRadius: '12px 0 0 12px',
          boxShadow: '-4px 4px 0 #1A1A1A',
        }}
      >
        {[
          { icon: Twitter, label: 'X / Twitter', href: 'https://x.com/Farebox_' },
          { icon: Github, label: 'GitHub', href: 'https://github.com/fareboxfun' },
          { icon: Send, label: 'Telegram', href: '#' },
          { icon: BookOpen, label: 'Docs', href: '/docs' },
        ].map(({ icon: Icon, label, href }, idx, arr) => (
          <a
            key={label}
            href={href}
            title={label}
            target={href !== '#' ? '_blank' : undefined}
            rel={href !== '#' ? 'noopener noreferrer' : undefined}
            className="w-10 h-10 flex items-center justify-center transition-colors"
            style={{
              color: '#1A1A1A',
              borderBottom: idx < arr.length - 1 ? '2px solid #1A1A1A' : 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7C3AED'; (e.currentTarget as HTMLElement).style.background = '#F3F0FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#1A1A1A'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Icon className="w-4 h-4" />
          </a>
        ))}
      </aside>

      {/* ── NAV ──────────────────────────────────── */}
      <TopNav />

      {/* ── HERO ─────────────────────────────────── */}
      <header className="pt-[58px] overflow-hidden nb-dot-bg" style={{ background: '#FFFBEF' }}>
        {/* massive text hero */}
        <div style={{ borderBottom: '2.5px solid #1A1A1A' }}>
          <div className="relative">
            <div className="relative z-10 px-6 pt-10 pb-0 max-w-[100vw] overflow-hidden">
              {/* Label row */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="nb-badge"
                  style={{ color: '#7C3AED', borderColor: '#7C3AED', boxShadow: '2px 2px 0 #7C3AED' }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#6BCB77] animate-pulse inline-block" />
                  Powering Tomorrow
                </span>
              </div>

              {/* BIG HEADLINE — full bleed */}
              <div
                className="leading-[0.88] tracking-[-0.02em] uppercase select-none"
                style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(42px, 7.5vw, 96px)',
                }}
              >
                <div style={{ color: '#1A1A1A' }}>EVERY REQUEST</div>
                <div style={{ color: '#7C3AED' }}>PAYS ITS FARE.</div>
              </div>

              {/* sub row: description left, Win98 widget right */}
              <div className="mt-10 mb-0 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end pt-8 pb-10" style={{ borderTop: '2.5px solid #1A1A1A' }}>
                {/* left */}
                <div>
                  <p className="text-lg font-medium max-w-xl mb-8 leading-relaxed" style={{ color: '#1A1A1A', borderLeft: '4px solid #7C3AED', paddingLeft: 20 }}>
                    The crypto-native gateway for AI agents. Route any frontier model through
                    one OpenAI-compatible endpoint — billed transparently in USDC on Solana.
                    Build agents that settle per-call with x402. Run a relay node and earn
                    80% of the routing margin.
                  </p>

                  {/* Stat pills row */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {[
                      { label: '80% Cheaper', dot: '#FFD93D' },
                      { label: 'OPEN SOURCE', dot: '#4ECDC4' },
                      { label: 'X402 Ready', dot: '#7C3AED' },
                      { label: 'USDC Native', dot: '#6BCB77' },
                    ].map(({ label, dot }) => (
                      <span
                        key={label}
                        className="nb-badge"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: dot }} />
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Primary — wallet connect */}
                    {authenticated ? (
                      <Link href="/dashboard" className="nb-btn nb-btn-primary">
                        <span className="w-2 h-2 rounded-full bg-[#6BCB77] inline-block" />
                        {walletShort ?? 'Dashboard'} <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={login}
                        disabled={!ready}
                        className="nb-btn nb-btn-primary disabled:opacity-50"
                      >
                        Connect Wallet <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    {/* Secondary outline pills */}
                    {[
                      { label: 'Playground', href: '/playground', external: false },
                      { label: 'Stats', href: 'https://stats.farebox.fun', external: true },
                      { label: 'Models', href: '/models', external: false },
                    ].map(({ label, href, external }) =>
                      external ? (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-outline">
                          {label}
                        </a>
                      ) : (
                        <Link key={label} href={href} className="nb-btn nb-btn-outline">
                          {label}
                        </Link>
                      )
                    )}
                  </div>
                </div>

                {/* right — Win98 dialog widget */}
                <div className="hidden lg:flex items-end justify-end pr-16 pb-0">
                  {/* Win98 window shell */}
                  <div style={{
                    width: 232,
                    fontFamily: '"Pixelated MS Sans Serif", "MS Sans Serif", Arial, sans-serif',
                    fontSize: 11,
                    background: '#c0c0c0',
                    border: '2px solid',
                    borderColor: '#ffffff #808080 #808080 #ffffff',
                    boxShadow: '1px 1px 0 0 #000000',
                    userSelect: 'none',
                  }}>
                    {/* Title bar */}
                    <div style={{
                      background: 'linear-gradient(to right, #000080, #1084d0)',
                      padding: '3px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 4,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {/* App icon: tiny purple square */}
                        <div style={{ width: 14, height: 14, background: '#7C3AED', border: '1px solid #ffffff40', flexShrink: 0 }} />
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: 11, letterSpacing: 0 }}>
                          Farebox.exe
                        </span>
                      </div>
                      {/* Window controls */}
                      <div style={{ display: 'flex', gap: 2 }}>
                        {['_', '□', '✕'].map((icon, i) => (
                          <div key={i} style={{
                            width: 16, height: 14,
                            background: '#c0c0c0',
                            border: '2px solid',
                            borderColor: '#ffffff #808080 #808080 #ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 'bold', color: '#000000',
                            cursor: 'default',
                            lineHeight: 1,
                          }}>{icon}</div>
                        ))}
                      </div>
                    </div>

                    {/* Menu bar */}
                    <div style={{
                      borderBottom: '1px solid #808080',
                      padding: '2px 6px',
                      display: 'flex', gap: 12,
                    }}>
                      {['File', 'Model', 'Help'].map(item => (
                        <span key={item} style={{ color: '#000', fontSize: 11, cursor: 'default' }}>{item}</span>
                      ))}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Logo area — inset panel */}
                      <div style={{
                        background: '#ffffff',
                        border: '2px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        padding: '8px 10px',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <Logo size={32} wordmark={false} />
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: 12, color: '#000080' }}>FAREBOX</div>
                          <div style={{ fontSize: 9, color: '#444', marginTop: 1 }}>LLM Gateway v1.0</div>
                          <div style={{ fontSize: 9, color: '#444' }}>36 models · x402 · USDC</div>
                        </div>
                      </div>

                      {/* Status rows */}
                      {[
                        { label: 'Status',   value: '● OPERATIONAL', color: '#008000' },
                        { label: 'Provider', value: 'OpenRouter'                      },
                        { label: 'Network',  value: 'Solana Mainnet'                  },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                          <span style={{ color: '#444' }}>{label}:</span>
                          <span style={{ color: color ?? '#000', fontWeight: 'bold' }}>{value}</span>
                        </div>
                      ))}

                      {/* OK button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                        <div style={{
                          padding: '3px 18px',
                          background: '#c0c0c0',
                          border: '2px solid',
                          borderColor: '#ffffff #808080 #808080 #ffffff',
                          boxShadow: '1px 1px 0 0 #000',
                          fontSize: 11, fontWeight: 'bold', cursor: 'default',
                        }}>
                          OK
                        </div>
                      </div>
                    </div>

                    {/* Status bar */}
                    <div style={{
                      borderTop: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      padding: '2px 6px',
                      fontSize: 10, color: '#444',
                      display: 'flex', justifyContent: 'space-between',
                    }}>
                      <span>Ready</span>
                      <span style={{ borderLeft: '1px solid #808080', paddingLeft: 6 }}>36 models</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── PROVIDER STRIP — infinite marquee ────── */}
          <div
            className="flex items-stretch overflow-hidden"
            style={{ borderTop: '2.5px solid #1A1A1A', background: 'white' }}
          >
            {/* Label */}
            <div
              className="shrink-0 px-5 flex items-center z-10"
              style={{ borderRight: '2.5px solid #1A1A1A', background: 'white' }}
            >
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: '#7C3AED' }}>
                Our Models:
              </span>
            </div>

            {/* Marquee track */}
            <div className="flex-1 overflow-hidden relative">
              <div className="flex items-stretch" style={{ animation: 'marquee 36s linear infinite', width: 'max-content' }}>
                {/* Duplicate twice for seamless loop */}
                {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-[172px] px-6 py-4 flex flex-col items-center justify-center gap-1 cursor-default transition-colors"
                    style={{ borderRight: '2px solid #1A1A1A20' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F3F0FF'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <span className="text-sm font-black uppercase tracking-tight text-center leading-tight" style={{ color: '#1A1A1A' }}>{p.name}</span>
                    <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#7C3AED' }}>{p.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── LIVE PLATFORM METRICS ─────────────────── */}
      <LiveMetricsStrip />

      {/* ── FEATURES GRID ─────────────────────────── */}
      <section style={{ background: '#FFFBEF', borderBottom: '2.5px solid #1A1A1A' }}>
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="px-4 sm:px-8 py-6 sm:py-8" style={{ borderBottom: '2.5px solid #1A1A1A' }}>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-2" style={{ color: '#7C3AED' }}>Why Farebox</div>
            <h2
              className="uppercase leading-none"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(40px, 5vw, 72px)', color: '#1A1A1A' }}
            >
              Built Different.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className="nb-card-hover relative group overflow-hidden"
                style={{
                  background: f.bg,
                  border: 'none',
                  borderRight: i < 3 ? '2.5px solid #1A1A1A' : 'none',
                  borderBottom: '2.5px solid #1A1A1A',
                }}
              >
                {/* top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[4px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ background: f.accent }}
                />
                {/* ghost number */}
                <div
                  className="absolute bottom-2 right-3 text-[88px] font-black leading-none select-none pointer-events-none"
                  style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A08' }}
                >{f.num}</div>
                <div className="relative p-8 pt-10 flex flex-col h-full">
                  <div
                    className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-5"
                    style={{ color: f.accent }}
                  >{f.num}</div>
                  <h3
                    className="text-xl uppercase mb-3 leading-tight tracking-tight"
                    style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, color: '#1A1A1A' }}
                  >{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A80' }}>{f.body}</p>
                  <div className="mt-auto pt-8">
                    <span
                      className="inline-block w-8 h-[3px] transition-colors duration-200"
                      style={{ background: f.accent, opacity: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODE SECTION ──────────────────────────── */}
      <CodeSection />

      {/* ── MODELS PRICING ────────────────────────── */}
      <section id="models" style={{ background: '#FFFBEF', borderBottom: '2.5px solid #1A1A1A' }}>
        <div className="max-w-7xl mx-auto">
          {/* header row */}
          <div className="px-4 sm:px-8 py-6 sm:py-8 flex items-end justify-between gap-4 flex-wrap" style={{ borderBottom: '2.5px solid #1A1A1A' }}>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-2" style={{ color: '#7C3AED' }}>Transparent Pricing</div>
              <h2
                className="uppercase leading-none"
                style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(40px, 5vw, 72px)', color: '#1A1A1A' }}
              >The Models</h2>
            </div>
            <Link href="/dashboard/models"
              className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest nb-btn nb-btn-outline nb-btn-sm shrink-0">
              All Models <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-8 gap-4 sm:gap-5">
            {[
              { model: 'Grok 4.5', provider: 'xAI', input: '$2.30', output: '$6.90', ctx: '256k', highlight: false, bg: '#FFFBEF', accent: '#FF6B6B' },
              { model: 'GPT-5.6', provider: 'OpenAI', input: '$5.75', output: '$34.50', ctx: '128k', highlight: true, bg: '#7C3AED', accent: '#FFD93D' },
              { model: 'DeepSeek V4-Pro', provider: 'DeepSeek', input: '$0.32', output: '$1.00', ctx: '128k', highlight: false, bg: '#FFFBEF', accent: '#4ECDC4' },
            ].map((m) => (
              <div
                key={m.model}
                className="nb-card nb-card-hover p-8"
                style={{ background: m.bg }}
              >
                <div
                  className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2"
                  style={{ color: m.highlight ? '#FFD93D' : m.accent }}
                >
                  {m.provider}
                </div>
                <h4
                  className="text-2xl uppercase mb-8 leading-tight"
                  style={{
                    fontFamily: "'Big Shoulders Display', sans-serif",
                    fontWeight: 900,
                    color: m.highlight ? 'white' : '#1A1A1A',
                  }}
                >{m.model}</h4>
                <div
                  className="space-y-2 font-mono text-sm pt-5"
                  style={{ borderTop: `2px solid ${m.highlight ? 'rgba(255,255,255,0.2)' : '#1A1A1A20'}` }}
                >
                  {[['Input / 1M', m.input], ['Output / 1M', m.output], ['Context', m.ctx]].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span style={{ color: m.highlight ? 'rgba(255,255,255,0.6)' : '#1A1A1A60' }}>{k}</span>
                      <span className="font-bold" style={{ color: m.highlight ? 'white' : '#1A1A1A' }}>{v}</span>
                    </div>
                  ))}
                </div>
                {m.highlight && (
                  <div className="mt-5">
                    <span
                      className="nb-tag"
                      style={{ background: '#FFD93D', color: '#1A1A1A', borderColor: '#1A1A1A' }}
                    >
                      ★ Most Popular
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────── */}
      <section style={{ background: '#1A1A1A', borderBottom: '2.5px solid #1A1A1A' }} className="relative overflow-hidden">
        {/* dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        {/* accent squares */}
        <span className="absolute top-6 left-6 w-4 h-4 rounded" style={{ background: '#7C3AED' }} />
        <span className="absolute top-6 right-6 w-4 h-4 rounded" style={{ background: '#FFD93D' }} />
        <span className="absolute bottom-6 left-6 w-4 h-4 rounded" style={{ background: '#4ECDC4' }} />
        <span className="absolute bottom-6 right-6 w-4 h-4 rounded" style={{ background: '#FF6B6B' }} />

        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-20 text-center relative z-10">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#7C3AED' }}>
            Get Started Today
          </div>
          <h2
            className="uppercase leading-[0.88] mb-6"
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(56px, 10vw, 140px)',
              color: 'white',
            }}
          >
            Ready to Run?
          </h2>
          <p className="text-lg font-medium mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Connect wallet. Deposit USDC. Generate Key. Done.
          </p>
          <Link
            href="/dashboard"
            className="nb-btn nb-btn-yellow"
            style={{ fontSize: '1rem', padding: '0.875rem 2.5rem' }}
          >
            Launch Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
