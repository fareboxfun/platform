import React from 'react';
import { useGetUsageDaily, useGetUsageByModel, useGetUsage } from '@workspace/api-client-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/* ── provider colour map ──────────────────────── */
const PC: Record<string, string> = {
  Anthropic: '#D4845A',
  OpenAI:    '#10A37F',
  Google:    '#4285F4',
  xAI:       '#7C3AED',
  Groq:      '#F55036',
  DeepInfra: '#8B5CF6',
};
const COL_DEFAULT = '#7C3AED';

/* ── number formatters ────────────────────────── */
const fmtN   = (v: number) => new Intl.NumberFormat('en-US').format(v);
const fmt$   = (v: number) => `$${v.toFixed(5)}`;
const fmtShort = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};


export default function Usage() {
  const [days, setDays] = React.useState<7 | 30 | 90>(30);
  const { data: daily, isLoading: loadingD } = useGetUsageDaily({ days });
  const { data: byModel }                    = useGetUsageByModel({ days });
  const { data: events }                     = useGetUsage({ limit: 50 });

  /* processed chart data */
  const modelData = React.useMemo(() => {
    if (!byModel?.length) return [];
    return [...byModel]
      .map(m => ({
        ...m,
        totalTokens: m.totalInputTokens + m.totalOutputTokens,
        color: PC[m.provider] ?? COL_DEFAULT,
      }))
      .sort((a, b) => b.totalTokens - a.totalTokens);
  }, [byModel]);

  const totalTokens = React.useMemo(
    () => modelData.reduce((s, m) => s + m.totalTokens, 0),
    [modelData],
  );

  const hasData = modelData.length > 0;

  return (
    <div className="p-6 space-y-5 max-w-6xl pt-[58px]" style={{ background: '#FFFBEF', minHeight: '100vh' }}>

      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED] mb-1" style={{ fontSize: 10 }}>
            Account
          </div>
          <h1
            className="font-black uppercase"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, letterSpacing: '-0.01em' }}
          >
            Usage
          </h1>
        </div>

        {/* Day range toggle — pill tabs */}
        <div
          className="flex"
          style={{
            border: '2.5px solid #1A1A1A',
            borderRadius: 999,
            boxShadow: '3px 3px 0 #1A1A1A',
            overflow: 'hidden',
            background: 'white',
          }}
        >
          {([7, 30, 90] as const).map((d, idx) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '7px 18px',
                fontSize: 10,
                fontFamily: 'Space Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: days === d ? '#7C3AED' : 'transparent',
                color: days === d ? 'white' : 'rgba(26,26,26,0.5)',
                border: 'none',
                borderLeft: idx > 0 ? '2px solid #1A1A1A' : 'none',
                cursor: 'pointer',
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* ── USAGE BY MODEL ──────────────────────── */}
      <div
        style={{
          background: 'white',
          border: '2.5px solid #1A1A1A',
          borderRadius: 12,
          boxShadow: '4px 4px 0 #1A1A1A',
        }}
      >
        <div
          className="px-5 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '2px solid #1A1A1A' }}
        >
          <div>
            <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED]" style={{ fontSize: 9 }}>
              Breakdown
            </div>
            <span className="font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 18 }}>
              Usage By Model
            </span>
          </div>
          <span
            className="font-mono font-bold uppercase tracking-widest text-black/40"
            style={{
              fontSize: 9,
              border: '2px solid #1A1A1A',
              borderRadius: 999,
              boxShadow: '2px 2px 0 #1A1A1A',
              padding: '3px 10px',
              background: '#FFFBEF',
            }}
          >
            {days}D · Tokens
          </span>
        </div>

        <div className="p-5">
          {/* Big total */}
          <div className="mb-5">
            <div className="font-mono text-black/30 uppercase tracking-widest mb-0.5" style={{ fontSize: 10 }}>
              Total Tokens
            </div>
            <div
              className="font-black tracking-tight leading-none"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40 }}
            >
              {fmtN(totalTokens)}
            </div>
          </div>

          {/* Bar chart */}
          <div className="h-52 mb-4">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelData} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                  <XAxis dataKey="model" axisLine={false} tickLine={false} tick={false} />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tickFormatter={fmtShort}
                    tick={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fill: 'rgba(0,0,0,0.35)' }}
                    width={38}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{
                      border: '2px solid #1A1A1A',
                      borderRadius: 8,
                      background: '#fff',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 11,
                      boxShadow: '3px 3px 0 #1A1A1A',
                    }}
                    formatter={(v: number, _: string, props: any) => [
                      fmtN(v) + ' tokens',
                      props.payload.model,
                    ]}
                  />
                  <Bar dataKey="totalTokens" radius={[4, 4, 0, 0]}>
                    {modelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-full flex flex-col items-center justify-center gap-2"
                style={{ border: '2px dashed rgba(26,26,26,0.15)', borderRadius: 8 }}
              >
                <span style={{ fontSize: 28, opacity: 0.3 }}>📊</span>
                <span className="font-mono text-black/25 uppercase tracking-widest" style={{ fontSize: 10 }}>
                  No usage data yet
                </span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {hasData
              ? modelData.map(m => {
                  const pct = totalTokens > 0
                    ? ((m.totalTokens / totalTokens) * 100).toFixed(0)
                    : 0;
                  return (
                    <div key={m.model} className="flex items-center gap-1.5">
                      <span
                        style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: m.color, display: 'inline-block',
                          border: '1.5px solid #1A1A1A',
                          flexShrink: 0,
                        }}
                      />
                      <span className="font-mono text-black/55" style={{ fontSize: 10 }}>{m.model}</span>
                      <span className="font-mono font-bold text-black/30" style={{ fontSize: 10 }}>{pct}%</span>
                    </div>
                  );
                })
              : (
                  <span className="font-mono text-black/25 uppercase tracking-widest" style={{ fontSize: 10 }}>
                    No usage recorded yet
                  </span>
                )
            }
          </div>
        </div>
      </div>

      {/* ── SPEND OVER TIME ─────────────────────── */}
      <div
        style={{
          background: 'white',
          border: '2.5px solid #1A1A1A',
          borderRadius: 12,
          boxShadow: '4px 4px 0 #1A1A1A',
        }}
      >
        <div className="px-5 py-3" style={{ borderBottom: '2px solid #1A1A1A' }}>
          <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED]" style={{ fontSize: 9 }}>
            Timeline
          </div>
          <span className="font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 18 }}>
            Spend Over Time
          </span>
        </div>
        <div className="p-5">
          <div className="h-44">
            {loadingD ? (
              <div
                className="h-full flex items-center justify-center"
                style={{ border: '2px dashed rgba(26,26,26,0.15)', borderRadius: 8 }}
              >
                <span className="font-mono text-black/25" style={{ fontSize: 10 }}>Loading…</span>
              </div>
            ) : daily?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily} barSize={8}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={v =>
                      new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }
                    axisLine={false} tickLine={false}
                    tick={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fill: '#00000050' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `$${v}`}
                    tick={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fill: '#00000050' }}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{
                      border: '2px solid #1A1A1A',
                      borderRadius: 8,
                      background: '#fff',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 11,
                      boxShadow: '3px 3px 0 #1A1A1A',
                    }}
                    formatter={(v: number, name: string) =>
                      name === 'totalBilledUsd'
                        ? [`$${v.toFixed(5)}`, 'Spend']
                        : [fmtN(v), 'Requests']
                    }
                    labelFormatter={l => new Date(l).toLocaleDateString()}
                  />
                  <Bar dataKey="totalBilledUsd" radius={[4, 4, 0, 0]}>
                    {(daily ?? []).map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === (daily ?? []).length - 1 ? '#7C3AED' : '#FFD93D'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-full flex items-center justify-center"
                style={{ border: '2px dashed rgba(26,26,26,0.15)', borderRadius: 8 }}
              >
                <span className="font-mono text-black/25 uppercase tracking-widest" style={{ fontSize: 10 }}>
                  No data
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── EVENT LOG ───────────────────────────── */}
      <div
        style={{
          background: 'white',
          border: '2.5px solid #1A1A1A',
          borderRadius: 12,
          boxShadow: '4px 4px 0 #1A1A1A',
          overflow: 'hidden',
        }}
      >
        <div className="px-5 py-3" style={{ borderBottom: '2px solid #1A1A1A' }}>
          <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED]" style={{ fontSize: 9 }}>
            Requests
          </div>
          <span className="font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 18 }}>
            Event Log
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono whitespace-nowrap" style={{ fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#FFFBEF', borderBottom: '2px solid #1A1A1A' }}>
                {['Time', 'Model', 'In Tok', 'Out Tok', 'Cost', 'Latency', 'Status'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 font-bold uppercase tracking-widest text-black/40"
                    style={{ fontSize: 9 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events?.events?.length ? (
                events.events.map((e, idx) => (
                  <tr
                    key={e.id}
                    style={{
                      borderBottom: idx < events.events.length - 1 ? '1.5px solid rgba(26,26,26,0.07)' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = '#FFFBEF')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-3 text-black/35">
                      {new Date(e.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit', second: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3 font-bold" style={{ color: PC[e.provider ?? ''] ?? '#1A1A1A' }}>
                      {e.model}
                    </td>
                    <td className="px-5 py-3 text-black/45">{fmtN(e.inputTokens)}</td>
                    <td className="px-5 py-3 text-black/45">{fmtN(e.outputTokens)}</td>
                    <td className="px-5 py-3 font-bold" style={{ color: '#7C3AED' }}>{fmt$(e.billedUsd)}</td>
                    <td className="px-5 py-3 text-black/35">{e.latencyMs ? `${e.latencyMs}ms` : '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className="font-bold uppercase tracking-widest"
                        style={{
                          fontSize: 9,
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: '1.5px solid #1A1A1A',
                          boxShadow: '1.5px 1.5px 0 #1A1A1A',
                          background: e.status === 'success' ? '#6BCB77' : '#FF6B6B',
                          color: e.status === 'success' ? '#1A1A1A' : 'white',
                        }}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div
                      className="inline-block p-8"
                      style={{ border: '2px dashed rgba(26,26,26,0.15)', borderRadius: 10 }}
                    >
                      <span className="font-mono text-black/25 uppercase tracking-widest" style={{ fontSize: 10 }}>
                        No events recorded
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
