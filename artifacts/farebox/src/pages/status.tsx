import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Twitter, Github, Send, BookOpen } from 'lucide-react';

/* ── API URL ─────────────────────────────────────────── */
const API_BASE = (() => {
  if (typeof window === 'undefined') return 'https://api.farebox.fun';
  const h = window.location.hostname;
  if (h === 'farebox.fun' || h === 'www.farebox.fun' || h === 'stats.farebox.fun')
    return 'https://api.farebox.fun';
  return '/api-proxy';
})();

/* ── Types ───────────────────────────────────────────── */
interface ServiceHistory { day: string; status: string }
interface Service {
  id: string; name: string; tag: string; description: string; domain: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number; uptimePct: string;
  history: ServiceHistory[];
}
interface StatusData {
  overall: 'operational' | 'degraded' | 'down';
  checkedAt: string;
  services: Service[];
}

/* ── Color tokens ────────────────────────────────────── */
const STATUS_COLOR = {
  operational: '#4ADE80',   /* bright green */
  degraded:    '#FBBF24',   /* amber */
  down:        '#F87171',   /* red */
  nodata:      'rgba(255,255,255,0.08)',
} as const;

/* All text on dark bg — token map for readability */
const T = {
  white:   '#F8FAFC',   /* headings, primary values */
  bright:  '#CBD5E1',   /* service names, important labels */
  mid:     '#94A3B8',   /* secondary info, descriptions */
  muted:   '#64748B',   /* metadata, mono labels */
  dim:     '#475569',   /* dividers, very secondary */
} as const;

const STATUS_LABEL: Record<string, string> = {
  operational: 'OPERATIONAL',
  degraded:    'DEGRADED',
  down:        'DOWN',
};

/* ── Build 90-day bar array ──────────────────────────── */
function buildBars(history: ServiceHistory[]) {
  const map: Record<string, string> = {};
  for (const h of history) map[h.day] = h.status;
  const bars: { date: string; status: string }[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    bars.push({ date: key, status: map[key] ?? 'nodata' });
  }
  return bars;
}

/* ── Uptime bar chart ────────────────────────────────── */
function UptimeBar({ history }: { history: ServiceHistory[] }) {
  const bars = buildBars(history);
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 32 }}>
      {bars.map((b, i) => {
        const color =
          b.status === 'operational' ? STATUS_COLOR.operational
          : b.status === 'degraded'  ? STATUS_COLOR.degraded
          : b.status === 'down'      ? STATUS_COLOR.down
          : STATUS_COLOR.nodata;
        const h = b.status === 'nodata' ? 8 : b.status === 'operational' ? 32 : 20;
        return (
          <div
            key={i}
            title={`${b.date}: ${b.status}`}
            style={{ background: color, flex: 1, height: h, borderRadius: 2,
              transition: 'height 0.2s', opacity: b.status === 'nodata' ? 0.4 : 1 }}
          />
        );
      })}
    </div>
  );
}

/* ── Pulsing dot ─────────────────────────────────────── */
function Dot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
        style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
    </span>
  );
}

/* ── Live clock ──────────────────────────────────────── */
function Clock() {
  const [time, setTime] = useState(() => new Date().toUTCString().replace('GMT', 'UTC'));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toUTCString().replace('GMT', 'UTC')), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

/* ── Skeleton card ───────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="border px-6 py-5 space-y-4 animate-pulse"
      style={{ background: '#0F0F0F', borderColor: '#ffffff0f' }}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-44 rounded" style={{ background: '#ffffff12' }} />
          <div className="h-3 w-60 rounded" style={{ background: '#ffffff08' }} />
        </div>
        <div className="h-5 w-24 rounded" style={{ background: '#ffffff0a' }} />
      </div>
      <div className="h-8 rounded" style={{ background: '#ffffff06' }} />
      <div className="flex justify-between">
        <div className="h-2.5 w-16 rounded" style={{ background: '#ffffff08' }} />
        <div className="h-2.5 w-16 rounded" style={{ background: '#ffffff08' }} />
        <div className="h-2.5 w-10 rounded" style={{ background: '#ffffff08' }} />
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function StatusPage() {
  const { data, isLoading, isFetching } = useQuery<StatusData>({
    queryKey: ['status'],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/status`);
      if (!r.ok) throw new Error('status fetch failed');
      return r.json();
    },
    refetchInterval: 60_000,
    staleTime:       30_000,
  });

  const overall      = data?.overall ?? 'operational';
  const overallColor = STATUS_COLOR[overall as keyof typeof STATUS_COLOR] ?? STATUS_COLOR.operational;

  const overallLabel =
    overall === 'operational' ? 'ALL SYSTEMS OPERATIONAL'
    : overall === 'degraded'  ? 'PARTIAL DEGRADATION'
    : 'SERVICE DISRUPTION';

  return (
    <div
      className="min-h-screen"
      style={{ background: '#080808', fontFamily: "'Space Grotesk', sans-serif", color: T.mid }}
    >

      {/* ── Social Sidebar ──────────────────────────────── */}
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
          { icon: Twitter,  label: 'X / Twitter', href: 'https://x.com/Farebox_' },
          { icon: Github,   label: 'GitHub',       href: 'https://github.com/fareboxfun' },
          { icon: Send,     label: 'Telegram',     href: '#' },
          { icon: BookOpen, label: 'Docs',         href: '/docs' },
        ].map(({ icon: Icon, label, href }, idx, arr) => (
          <a
            key={label}
            href={href}
            title={label}
            target={href !== '#' ? '_blank' : undefined}
            rel={href !== '#' ? 'noopener noreferrer' : undefined}
            className="w-10 h-10 flex items-center justify-center transition-colors"
            style={{ color: '#1A1A1A', borderBottom: idx < arr.length - 1 ? '2px solid #1A1A1A' : 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7C3AED'; (e.currentTarget as HTMLElement).style.background = '#F3F0FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#1A1A1A'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Icon className="w-4 h-4" />
          </a>
        ))}
      </aside>

      {/* ── Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 h-12 border-b"
        style={{ background: 'rgba(8,8,8,0.92)', borderColor: '#ffffff10', backdropFilter: 'blur(12px)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png" alt="Farebox"
            width={26} height={26}
            style={{ borderRadius: 6, border: '1.5px solid #ffffff25', display: 'block' }}
          />
          <span className="font-black tracking-tight uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 15, color: T.white }}>
            Farebox
          </span>
          <span
            className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase px-2 py-0.5 rounded-sm"
            style={{ background: '#7C3AED22', color: '#A78BFA', border: '1px solid #7C3AED40' }}
          >
            STATUS
          </span>
        </div>

        {/* Nav */}
        <div className="flex items-center gap-5">
          {isFetching && !isLoading && (
            <span className="text-[9px] font-mono uppercase tracking-widest animate-pulse" style={{ color: '#A78BFA' }}>
              Refreshing…
            </span>
          )}
          {[
            { label: 'JSON', href: `${API_BASE}/api/status`, external: true },
          ].map(({ label, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="text-[11px] font-mono font-semibold uppercase tracking-widest transition-colors"
              style={{ color: T.muted }}
              onMouseOver={e => (e.currentTarget.style.color = T.white)}
              onMouseOut={e  => (e.currentTarget.style.color = T.muted)}
            >
              {label}
            </a>
          ))}
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 py-10 space-y-3">

        {/* Overall status banner */}
        <div
          className="px-6 py-5 border"
          style={{
            background: isLoading ? '#0F0F0F' : `${overallColor}0D`,
            borderColor: isLoading ? '#ffffff0c' : `${overallColor}35`,
          }}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#7C3AED' }} />
              <span className="text-sm font-mono tracking-widest uppercase" style={{ color: T.muted }}>
                Checking systems…
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2.5">
                <Dot color={overallColor} />
                <span
                  className="font-black uppercase tracking-wide"
                  style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 20, color: overallColor }}
                >
                  {overallLabel}
                </span>
              </div>
              <div className="text-[11px] font-mono flex flex-wrap gap-x-3 gap-y-1" style={{ color: T.muted }}>
                <span>Updated <Clock /></span>
                <span style={{ color: T.dim }}>·</span>
                <span>Checks every 60s</span>
                <span style={{ color: T.dim }}>·</span>
                <span>Auto-refreshes every 60s</span>
              </div>
            </>
          )}
        </div>

        {/* Infrastructure label */}
        <div className="flex items-center gap-3 pt-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]" style={{ color: T.muted }}>
            Infrastructure
          </span>
          <div className="flex-1 h-px" style={{ background: '#ffffff10' }} />
        </div>

        {/* Service cards */}
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : data?.services.map((svc) => {
              const color = STATUS_COLOR[svc.status as keyof typeof STATUS_COLOR] ?? STATUS_COLOR.operational;
              return (
                <div
                  key={svc.id}
                  className="border px-6 py-5 transition-colors"
                  style={{ background: '#0F0F0F', borderColor: '#ffffff0f' }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#ffffff1a'; }}
                  onMouseOut={e  => { (e.currentTarget as HTMLDivElement).style.borderColor = '#ffffff0f'; }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-black uppercase tracking-wide"
                          style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 15, color: T.white }}
                        >
                          {svc.name}
                        </span>
                        <span
                          className="text-[8px] font-mono uppercase tracking-[0.2em] px-1.5 py-0.5"
                          style={{ color: T.muted, border: '1px solid #ffffff12' }}
                        >
                          {svc.tag}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono" style={{ color: T.mid }}>
                        <span style={{ color: T.bright }}>{svc.domain}</span>
                        <span style={{ color: T.dim }}> · </span>
                        {svc.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className="text-[9px] font-mono font-bold tracking-[0.18em] uppercase px-2.5 py-1"
                        style={{ color, border: `1.5px solid ${color}50`, background: `${color}12` }}
                      >
                        {STATUS_LABEL[svc.status]}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums font-semibold" style={{ color: T.mid }}>
                        {svc.latencyMs}ms
                      </span>
                    </div>
                  </div>

                  {/* Uptime bars */}
                  <UptimeBar history={svc.history} />

                  {/* Bar footer */}
                  <div className="flex justify-between mt-2 text-[10px] font-mono" style={{ color: T.muted }}>
                    <span>90 days ago</span>
                    <span className="tabular-nums font-semibold" style={{ color: T.bright }}>
                      {parseFloat(svc.uptimePct).toFixed(2)}% uptime
                    </span>
                    <span>Today</span>
                  </div>
                </div>
              );
            })
        }

        {/* Settlement layer label */}
        {!isLoading && (
          <div className="flex items-center gap-3 pt-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]" style={{ color: T.muted }}>
              Settlement Layer
            </span>
            <div className="flex-1 h-px" style={{ background: '#ffffff10' }} />
          </div>
        )}

        {/* Solana chain info */}
        {!isLoading && (
          <div className="border px-6 py-5" style={{ background: '#0F0F0F', borderColor: '#ffffff0f' }}>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Network',  value: 'Mainnet Beta' },
                { label: 'Asset',    value: 'USDC (SPL)'   },
                { label: 'Finality', value: '~400ms'       },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: T.muted }}>
                    {label}
                  </div>
                  <div className="text-[13px] font-mono font-bold" style={{ color: T.bright }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 pt-2 px-1 flex-wrap">
          {[
            { color: STATUS_COLOR.operational, label: 'Operational' },
            { color: STATUS_COLOR.degraded,    label: 'Degraded'    },
            { color: STATUS_COLOR.down,        label: 'Down'        },
            { color: STATUS_COLOR.nodata,      label: 'No data'     },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: color }} />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider" style={{ color: T.muted }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-6 border-t text-[10px] font-mono font-semibold uppercase tracking-widest"
          style={{ borderColor: '#ffffff0c', color: T.dim }}
        >
          <span>farebox.fun · Crypto-Native LLM Gateway</span>
          <span>Solana · USDC</span>
        </div>

      </main>
    </div>
  );
}
