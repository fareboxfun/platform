import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import { Search, Zap, Wrench, ArrowRight, Globe } from 'lucide-react';
import { useListModels } from '@workspace/api-client-react';
import type { Model } from '@workspace/api-client-react';

const API_BASE = 'https://api.farebox.fun';

/* ── helper: format context window number ──────── */
function fmtContext(n: number | null | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/* ── provider colors ────────────────────────────── */
const PROVIDER_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Anthropic:  { bg: '#FF6B6B20', color: '#CC3A2A', border: '#FF6B6B55' },
  OpenAI:     { bg: '#4ECDC420', color: '#1A7A74', border: '#4ECDC455' },
  Google:     { bg: '#74B9FF20', color: '#1A5FA8', border: '#74B9FF55' },
  xAI:        { bg: '#7C3AED20', color: '#5B21B6', border: '#7C3AED55' },
  Moonshot:   { bg: '#8B5CF620', color: '#5B21B6', border: '#8B5CF655' },
  Meta:       { bg: '#74B9FF20', color: '#1A5FA8', border: '#74B9FF55' },
  DeepSeek:   { bg: '#EC489920', color: '#9D174D', border: '#EC489955' },
  Mistral:    { bg: '#FFD93D20', color: '#92610A', border: '#FFD93D55' },
  Alibaba:    { bg: '#FF6B6B20', color: '#CC3A2A', border: '#FF6B6B55' },
  Tencent:    { bg: '#4ECDC420', color: '#1A7A74', border: '#4ECDC455' },
  Cohere:     { bg: '#FF9F4320', color: '#A85B0A', border: '#FF9F4355' },
  Perplexity: { bg: '#6BCB7720', color: '#276B30', border: '#6BCB7755' },
  Microsoft:  { bg: '#74B9FF22', color: '#003A8C', border: '#74B9FF55' },
};
const PC_DEFAULT = { bg: '#7C3AED18', color: '#7C3AED', border: '#7C3AED40' };

export default function ModelsPage() {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());

  /* Fetch models from DB — single source of truth for all data */
  const { data: models, isLoading, isError } = useListModels();

  /* Fetch live IDs from gateway for "LIVE" badge */
  useEffect(() => {
    fetch(`${API_BASE}/v1/models`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.data)) {
          setLiveIds(new Set(d.data.map((m: { id: string }) => m.id)));
        }
      })
      .catch(() => {});
  }, []);

  const providers = React.useMemo(() => {
    if (!models?.length) return ['All'];
    const unique = Array.from(new Set(models.map(m => m.provider))).sort();
    return ['All', ...unique];
  }, [models]);

  const filtered = React.useMemo((): Model[] => {
    if (!models) return [];
    return models.filter(m => {
      const matchProvider = providerFilter === 'All' || m.provider === providerFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || (m.description ?? '').toLowerCase().includes(q);
      return matchProvider && matchSearch;
    });
  }, [models, search, providerFilter]);

  return (
    <div className="min-h-screen" style={{ background: '#FFFBEF', fontFamily: "'Space Grotesk', sans-serif" }}>
      <TopNav />

      <div className="pt-14">
        {/* Header */}
        <div className="px-4 sm:px-8 py-10 sm:py-16" style={{ background: '#FFFBEF', borderBottom: '2.5px solid #1A1A1A' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>
              — Supported Models
            </div>
            <h1 className="uppercase leading-none mb-4" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(32px, 8vw, 112px)', color: '#1A1A1A' }}>
              Every Frontier<br /><span style={{ color: '#7C3AED' }}>Model.</span>
            </h1>
            <p className="text-lg max-w-2xl mt-6" style={{ color: '#374151' }}>
              One API key, one balance, one endpoint. All prices include Farebox's transparent markup; you always see exactly what you pay.
            </p>
          </div>
        </div>

        {/* Pricing note */}
        <div className="hidden md:block px-8 py-4" style={{ background: 'white', borderBottom: '2px solid #1A1A1A' }}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 text-xs font-mono" style={{ color: '#6B7280' }}>
            <span>All prices in USD per 1M tokens</span>
            <span className="w-px h-4" style={{ background: '#1A1A1A30' }} />
            <span>Billed = Provider cost × (1 + markup%)</span>
            <span className="w-px h-4" style={{ background: '#1A1A1A30' }} />
            <span>Balance funded 1:1 with USDC on Solana</span>
            <span className="w-px h-4" style={{ background: '#1A1A1A30' }} />
            <span className="font-bold" style={{ color: '#7C3AED' }}>
              {isLoading ? '…' : `${models?.length ?? 0} models live`}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-8 py-4 sm:py-5" style={{ background: '#FFFBEF', borderBottom: '2px solid #1A1A1A' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">

            {/* Search */}
            <div className="relative w-full sm:flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search models..."
                className="nb-input pl-9 w-full"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
            </div>

            {/* Mobile: compact select dropdown */}
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="md:hidden w-full"
              style={{
                border: '2.5px solid #1A1A1A',
                borderRadius: 10,
                padding: '10px 14px',
                background: providerFilter !== 'All' ? '#7C3AED' : 'white',
                color: providerFilter !== 'All' ? 'white' : '#1A1A1A',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '3px 3px 0 #1A1A1A',
                cursor: 'pointer',
              }}
            >
              {providers.map(p => (
                <option key={p} value={p} style={{ background: 'white', color: '#1A1A1A' }}>{p}</option>
              ))}
            </select>

            {/* Desktop: chip pills */}
            <div className="hidden md:flex flex-wrap gap-2">
              {providers.map(p => (
                <button
                  key={p}
                  onClick={() => setProviderFilter(p)}
                  className="nb-badge"
                  style={providerFilter === p
                    ? { background: '#7C3AED', color: 'white', borderColor: '#7C3AED', boxShadow: '2px 2px 0 #1A1A1A' }
                    : { background: 'white', color: '#1A1A1A', cursor: 'pointer' }
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Models grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    border: '2.5px solid #1A1A1A',
                    borderRadius: 12,
                    boxShadow: '4px 4px 0 #1A1A1A',
                    height: 240,
                    opacity: 0.3 + (i % 3) * 0.1,
                  }}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="text-center py-20 font-mono" style={{ color: '#FF6B6B' }}>
              Failed to load model catalog — please refresh
            </div>
          )}

          {/* Grid */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filtered.map(m => {
                const providerColor = PROVIDER_COLORS[m.provider] || PC_DEFAULT;
                return (
                  <div
                    key={m.id}
                    className="nb-card nb-card-hover p-6 relative group"
                  >
                    {/* header */}
                    <div className="mb-4">
                      <span
                        className="inline-block text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 mb-2"
                        style={{ background: providerColor.bg, color: providerColor.color, border: `1.5px solid ${providerColor.border}`, borderRadius: 999 }}
                      >
                        {m.provider}
                      </span>
                      <h3 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>{m.name}</h3>
                      <p className="text-sm mt-2 leading-relaxed" style={{ color: '#6B7280' }}>{m.description ?? '—'}</p>
                    </div>

                    {/* capabilities */}
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                      <span className="nb-tag" style={{ color: '#6B7280' }}>{fmtContext(m.contextWindow)} CTX</span>
                      {m.supportsStreaming && (
                        <span className="nb-tag flex items-center gap-1" style={{ background: '#6BCB7720', borderColor: '#6BCB77', color: '#1A6630' }}>
                          <Zap className="w-3 h-3" />Streaming
                        </span>
                      )}
                      {m.supportsTools && (
                        <span className="nb-tag flex items-center gap-1" style={{ background: '#74B9FF20', borderColor: '#74B9FF', color: '#1A5FAA' }}>
                          <Wrench className="w-3 h-3" />Tools
                        </span>
                      )}
                    </div>

                    {/* pricing grid */}
                    <div className="grid grid-cols-2 gap-3 pt-4" style={{ borderTop: '2px solid #1A1A1A' }}>
                      <div>
                        <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>Provider Cost</div>
                        <div className="font-mono text-sm">
                          <div className="flex justify-between">
                            <span style={{ color: '#9CA3AF' }}>In/1M</span>
                            <span className="font-bold" style={{ color: '#1A1A1A' }}>${m.inputPerMtokUsd.toFixed(3)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: '#9CA3AF' }}>Out/1M</span>
                            <span className="font-bold" style={{ color: '#1A1A1A' }}>${m.outputPerMtokUsd.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-2" style={{ background: '#7C3AED12', border: '2px solid #7C3AED', borderRadius: 8 }}>
                        <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: '#7C3AED' }}>Billed via Farebox</div>
                        <div className="font-mono text-sm">
                          <div className="flex justify-between">
                            <span style={{ color: '#9CA3AF' }}>In/1M</span>
                            <span className="font-bold" style={{ color: '#7C3AED' }}>${m.billedInputPerMtokUsd.toFixed(3)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: '#9CA3AF' }}>Out/1M</span>
                            <span className="font-bold" style={{ color: '#7C3AED' }}>${m.billedOutputPerMtokUsd.toFixed(3)}</span>
                          </div>
                        </div>
                        <div className="text-[9px] font-mono mt-1" style={{ color: '#9CA3AF' }}>+{m.markupPct ?? 15}% markup</div>
                      </div>
                    </div>

                    {/* model id + live badge */}
                    <div className="mt-4 flex items-center justify-between">
                      <code className="text-[11px] font-mono px-2 py-1" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 6 }}>{m.id}</code>
                      <div className="flex items-center gap-2">
                        {liveIds.has(m.id) && (
                          <span className="flex items-center gap-1 text-[9px] font-mono font-bold" style={{ color: '#4ADE80' }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ADE80' }} />LIVE
                          </span>
                        )}
                        <Link href="/dashboard" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#7C3AED' }}>
                          Use <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="text-center py-20 font-mono" style={{ color: '#9CA3AF' }}>No models match your filter.</div>
          )}

          {/* More coming */}
          <div className="mt-12 p-8 text-center nb-card" style={{ background: '#FFFBEF', borderStyle: 'dashed' }}>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: '#7C3AED' }}>Coming in Phase 2</div>
            <p className="text-sm max-w-lg mx-auto" style={{ color: '#6B7280' }}>
              Embeddings (<code className="font-mono">text-embedding-3-*</code>, <code className="font-mono">voyage-*</code>), image generation (DALL·E 3, Stable Diffusion), and more open-source models via Groq and DeepInfra.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
