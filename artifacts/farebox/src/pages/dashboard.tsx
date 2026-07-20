import React from 'react';
import { useGetDashboardSummary, useGetUsageDaily, useGetUsageByModel, useGetUsage } from '@workspace/api-client-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'wouter';

const fmt$ = (v?: number) =>
  v === undefined ? '$0.00' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
const fmtN = (v?: number) =>
  v === undefined ? '0' : new Intl.NumberFormat('en-US').format(v);

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  bg: string;
  textColor?: string;
}

function StatCard({ label, value, sub, bg, textColor = '#1A1A1A' }: StatCardProps) {
  return (
    <div
      style={{
        background: bg,
        border: '2.5px solid #1A1A1A',
        borderRadius: 12,
        boxShadow: '4px 4px 0 #1A1A1A',
        padding: '20px 20px 16px',
      }}
    >
      <div
        className="font-mono font-bold uppercase tracking-widest mb-2"
        style={{ fontSize: 9, color: textColor === 'white' ? 'rgba(255,255,255,0.7)' : 'rgba(26,26,26,0.5)' }}
      >
        {label}
      </div>
      <div
        className="font-black leading-none"
        style={{
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontSize: 32,
          color: textColor,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="font-mono mt-1"
          style={{ fontSize: 9, color: textColor === 'white' ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,26,0.4)' }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: daily } = useGetUsageDaily({ days: 30 });
  const { data: byModel } = useGetUsageByModel({ days: 30 });
  const { data: events } = useGetUsage({ limit: 8 });

  return (
    <div className="p-6 space-y-6 max-w-6xl pt-[58px]" style={{ background: '#FFFBEF', minHeight: '100vh' }}>

      {/* Page title row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED] mb-1" style={{ fontSize: 10 }}>
            Gateway
          </div>
          <h1
            className="font-black uppercase"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, letterSpacing: '-0.01em' }}
          >
            Overview
          </h1>
        </div>
        <Link href="/dashboard/keys" className="nb-btn nb-btn-black">
          <span style={{ width: 6, height: 6, background: 'white', display: 'inline-block', borderRadius: 1 }} />
          Manage Keys
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Balance"
          value={isLoading ? '…' : fmt$(summary?.balanceUsd)}
          sub="USDC prepaid"
          bg="#FFD93D"
        />
        <StatCard
          label="Requests Today"
          value={isLoading ? '…' : fmtN(summary?.totalRequestsToday)}
          bg="#4ECDC4"
        />
        <StatCard
          label="Spend Today"
          value={isLoading ? '…' : fmt$(summary?.totalSpentToday)}
          bg="#7C3AED"
          textColor="white"
        />
        <StatCard
          label="Active Keys"
          value={isLoading ? '…' : (summary?.activeKeyCount?.toString() ?? '0')}
          bg="#6BCB77"
        />
      </div>

      {/* Chart + models */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 30-day spend chart */}
        <div
          className="lg:col-span-2"
          style={{
            background: 'white',
            border: '2.5px solid #1A1A1A',
            borderRadius: 12,
            boxShadow: '4px 4px 0 #1A1A1A',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '2px solid #1A1A1A' }}
          >
            <div>
              <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED]" style={{ fontSize: 9 }}>Chart</div>
              <span className="font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 16 }}>
                30-Day Spend
              </span>
            </div>
            <span className="font-mono text-black/30" style={{ fontSize: 9 }}>USD / per day</span>
          </div>
          <div className="p-5">
            <div className="h-48">
              {daily && daily.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} barSize={8}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      axisLine={false} tickLine={false}
                      tick={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fill: '#00000055' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false} tickLine={false}
                      tickFormatter={v => `$${v}`}
                      tick={{ fontFamily: 'Space Mono, monospace', fontSize: 9, fill: '#00000055' }}
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
                      formatter={(v: number) => [`$${v.toFixed(5)}`, 'Spend']}
                      labelFormatter={l => new Date(l).toLocaleDateString()}
                    />
                    <Bar dataKey="totalBilledUsd" radius={[4, 4, 0, 0]}>
                      {(daily ?? []).map((_, i) => (
                        <Cell key={i} fill={i === (daily ?? []).length - 1 ? '#7C3AED' : '#FFD93D'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="h-full flex items-center justify-center"
                  style={{ border: '2px dashed rgba(26,26,26,0.2)', borderRadius: 8 }}
                >
                  <span className="font-mono text-black/30 uppercase tracking-widest" style={{ fontSize: 10 }}>
                    No data yet
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top models */}
        <div
          style={{
            background: 'white',
            border: '2.5px solid #1A1A1A',
            borderRadius: 12,
            boxShadow: '4px 4px 0 #1A1A1A',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="px-5 py-3" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED]" style={{ fontSize: 9 }}>Models</div>
            <span className="font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 16 }}>
              Top Models · 30d
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {byModel && byModel.length > 0 ? byModel.slice(0, 6).map((m, idx) => (
              <div
                key={m.model}
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: idx < Math.min(byModel.length, 6) - 1 ? '1.5px solid rgba(26,26,26,0.08)' : 'none' }}
              >
                <div>
                  <div className="font-bold text-black/80 truncate" style={{ maxWidth: 110, fontSize: 11 }}>{m.model}</div>
                  <div className="font-mono text-black/30" style={{ fontSize: 9 }}>{fmtN(m.requestCount)} reqs</div>
                </div>
                <div className="font-mono font-black text-[#7C3AED]" style={{ fontSize: 12 }}>{fmt$(m.totalBilledUsd)}</div>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center py-12">
                <div
                  className="text-center p-6"
                  style={{ border: '2px dashed rgba(26,26,26,0.15)', borderRadius: 10 }}
                >
                  <span className="font-mono text-black/25" style={{ fontSize: 10 }}>No usage yet</span>
                </div>
              </div>
            )}
          </div>
          <div className="px-5 py-3" style={{ borderTop: '2px solid #1A1A1A' }}>
            <Link
              href="/dashboard/usage"
              className="font-mono font-bold uppercase tracking-widest text-[#7C3AED] hover:underline"
              style={{ fontSize: 10 }}
            >
              Full Usage Report →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent requests */}
      <div
        style={{
          background: 'white',
          border: '2.5px solid #1A1A1A',
          borderRadius: 12,
          boxShadow: '4px 4px 0 #1A1A1A',
          overflow: 'hidden',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '2px solid #1A1A1A' }}
        >
          <div>
            <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED]" style={{ fontSize: 9 }}>Activity</div>
            <span className="font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 16 }}>
              Recent Requests
            </span>
          </div>
          <Link
            href="/dashboard/usage"
            className="nb-btn nb-btn-outline nb-btn-sm"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono whitespace-nowrap" style={{ fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#FFFBEF', borderBottom: '2px solid #1A1A1A' }}>
                {['Time', 'Model', 'Tokens', 'Cost', 'Status'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 font-bold uppercase tracking-widest text-black/50"
                    style={{ fontSize: 9 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events?.events?.length ? events.events.map((e, idx) => (
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
                    {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-5 py-3 font-bold text-black/75">{e.model}</td>
                  <td className="px-5 py-3 text-black/50">{fmtN(e.inputTokens + e.outputTokens)}</td>
                  <td className="px-5 py-3 font-bold" style={{ color: '#7C3AED' }}>${e.billedUsd.toFixed(5)}</td>
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
              )) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div
                      className="inline-block text-center p-8"
                      style={{ border: '2px dashed rgba(26,26,26,0.15)', borderRadius: 10 }}
                    >
                      <span className="font-mono text-black/25 uppercase tracking-widest" style={{ fontSize: 10 }}>
                        No requests yet
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
