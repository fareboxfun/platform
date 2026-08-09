import React, { useState } from 'react';
import { Link } from 'wouter';
import { Search, Copy, Check, Wrench, Zap, X, ArrowRight, Terminal } from 'lucide-react';
import { useListModels } from '@workspace/api-client-react';
import type { Model } from '@workspace/api-client-react';

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */
function fmtContext(n: number | null | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/* ─────────────────────────────────────────────────
   Provider accent colours — NB palette
───────────────────────────────────────────────── */
const PROVIDER_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  Anthropic:  { bg: '#FFF0EC', border: '#FF6B6B', text: '#CC3A2A' },
  OpenAI:     { bg: '#E8FAF8', border: '#4ECDC4', text: '#1A7A74' },
  Google:     { bg: '#EAF3FF', border: '#74B9FF', text: '#1A5FA8' },
  xAI:        { bg: '#F3EEFF', border: '#7C3AED', text: '#5B21B6' },
  Moonshot:   { bg: '#F5F0FF', border: '#8B5CF6', text: '#5B21B6' },
  Meta:       { bg: '#E8F6FF', border: '#74B9FF', text: '#1A5FA8' },
  DeepSeek:   { bg: '#FFF0F8', border: '#EC4899', text: '#9D174D' },
  Mistral:    { bg: '#FFFBEA', border: '#FFD93D', text: '#92610A' },
  Alibaba:    { bg: '#FFF0F0', border: '#FF6B6B', text: '#CC3A2A' },
  Tencent:    { bg: '#E8FAF9', border: '#4ECDC4', text: '#1A7A74' },
  Cohere:     { bg: '#FFF5EC', border: '#FF9F43', text: '#A85B0A' },
  Perplexity: { bg: '#F0FFF0', border: '#6BCB77', text: '#276B30' },
  Microsoft:  { bg: '#F5F5F5', border: '#9CA3AF', text: '#374151' },
};
const PC_DEFAULT = { bg: '#F5F5F5', border: '#9CA3AF', text: '#374151' };

/* ─────────────────────────────────────────────────
   Copy hook
───────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────
   Capability tag chips — NB style
───────────────────────────────────────────────── */
function CapTag({ label, icon, bgColor, textColor }: { label: string; icon?: React.ReactNode; bgColor: string; textColor: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5"
      style={{
        background: bgColor,
        color: textColor,
        border: `1.5px solid ${textColor}`,
        borderRadius: 6,
        boxShadow: `1.5px 1.5px 0 ${textColor}`,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────
   Model card — NB style
───────────────────────────────────────────────── */
function ModelCard({ model, onSelect }: { model: Model; onSelect: () => void }) {
  const pc = PROVIDER_COLOR[model.provider] ?? PC_DEFAULT;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left w-full flex flex-col"
      style={{
        background: 'white',
        border: '2.5px solid #1A1A1A',
        borderRadius: 12,
        boxShadow: hovered ? '6px 6px 0 #1A1A1A' : '4px 4px 0 #1A1A1A',
        transform: hovered ? 'translate(-2px, -2px)' : 'translate(0, 0)',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '2px solid #1A1A1A' }}>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          {/* Provider pill */}
          <span
            className="text-[9px] font-mono font-black uppercase tracking-[0.15em] px-2 py-0.5"
            style={{
              background: pc.bg,
              color: pc.text,
              border: `1.5px solid ${pc.border}`,
              borderRadius: 999,
              boxShadow: `1.5px 1.5px 0 ${pc.border}`,
            }}
          >
            {model.provider}
          </span>

          {/* Capability icons */}
          <div className="flex items-center gap-1 shrink-0">
            {model.supportsTools && (
              <span className="w-5 h-5 flex items-center justify-center" style={{ background: '#FFFBEA', border: '1.5px solid #FFD93D', borderRadius: 6 }} title="Tool Use">
                <Wrench className="w-2.5 h-2.5" style={{ color: '#92610A' }} />
              </span>
            )}
            {model.supportsStreaming && (
              <span className="w-5 h-5 flex items-center justify-center" style={{ background: '#FFF0F8', border: '1.5px solid #EC4899', borderRadius: 6 }} title="Streaming">
                <Zap className="w-2.5 h-2.5" style={{ color: '#9D174D' }} />
              </span>
            )}
          </div>
        </div>

        <div
          className="font-black text-[17px] uppercase tracking-tight leading-tight mb-1"
          style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}
        >
          {model.name}
        </div>
        <code className="text-[9px] font-mono" style={{ color: '#9CA3AF' }}>{model.id}</code>
      </div>

      {/* Description */}
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: '#6B7280', fontFamily: "'Space Grotesk', sans-serif" }}>
          {model.description ?? 'No description available.'}
        </p>
      </div>

      {/* Pricing */}
      <div className="px-4 pb-3 pt-3 space-y-1.5" style={{ borderTop: '2px solid #1A1A1A' }}>
        {[
          { label: 'Input / 1M',  value: `$${model.billedInputPerMtokUsd.toFixed(2)}` },
          { label: 'Output / 1M', value: `$${model.billedOutputPerMtokUsd.toFixed(2)}` },
          { label: 'Context',     value: fmtContext(model.contextWindow) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-baseline">
            <span className="text-[9px] font-mono" style={{ color: '#9CA3AF' }}>{label}</span>
            <span className="text-[11px] font-mono font-black" style={{ color: '#1A1A1A' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4" style={{ borderTop: '1px dashed #1A1A1A20' }}>
        <div
          className="flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-widest pt-3 transition-colors"
          style={{ color: '#7C3AED' }}
        >
          Try in Playground <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────
   Detail Drawer — NB style
───────────────────────────────────────────────── */
function ModelDrawer({ model, onClose }: { model: Model; onClose: () => void }) {
  const { copied: idCopied, copy: copyId } = useCopy(model.id);
  const snippet = `curl https://api.farebox.fun/v1/chat/completions \\
  -H "Authorization: Bearer sk-fbx-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "messages": [{"role":"user","content":"Hello!"}],
    "stream": true
  }'`;
  const { copied: snipCopied, copy: copySnip } = useCopy(snippet);
  const pc = PROVIDER_COLOR[model.provider] ?? PC_DEFAULT;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] flex flex-col overflow-hidden"
        style={{
          background: 'white',
          borderLeft: '2.5px solid #1A1A1A',
          boxShadow: '-6px 0 0 #1A1A1A',
        }}
      >
        {/* Panel header */}
        <div className="px-5 py-4 shrink-0 flex items-start justify-between gap-3" style={{ borderBottom: '2.5px solid #1A1A1A' }}>
          <div>
            <span
              className="text-[9px] font-mono font-black uppercase tracking-[0.15em] px-2.5 py-0.5 mb-2.5 inline-block"
              style={{
                background: pc.bg,
                color: pc.text,
                border: `1.5px solid ${pc.border}`,
                borderRadius: 999,
                boxShadow: `1.5px 1.5px 0 ${pc.border}`,
              }}
            >
              {model.provider}
            </span>
            <div
              className="font-black uppercase text-2xl leading-tight"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}
            >
              {model.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center transition-all"
            style={{
              border: '2px solid #1A1A1A',
              borderRadius: 8,
              boxShadow: '2px 2px 0 #1A1A1A',
              background: 'white',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-1px,-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 #1A1A1A';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0,0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0 #1A1A1A';
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Model ID */}
          <div className="px-5 py-4" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#7C3AED' }}>Model ID</div>
            <div
              className="flex items-center gap-2 px-3 py-2.5"
              style={{
                background: '#FFFBEF',
                border: '2px solid #1A1A1A',
                borderRadius: 8,
              }}
            >
              <code className="text-[11px] font-mono flex-1 truncate" style={{ color: '#1A1A1A' }}>{model.id}</code>
              <button
                onClick={copyId}
                className="shrink-0 flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors"
                style={{ color: idCopied ? '#7C3AED' : '#9CA3AF' }}
              >
                {idCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {idCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Capabilities */}
          <div className="px-5 py-4" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#7C3AED' }}>Capabilities</div>
            <div className="flex flex-wrap gap-1.5">
              {model.supportsTools    && <CapTag label="Tool Use"  icon={<Wrench className="w-2.5 h-2.5" />} bgColor="#FFFBEA" textColor="#92610A" />}
              {model.supportsStreaming && <CapTag label="Streaming" icon={<Zap    className="w-2.5 h-2.5" />} bgColor="#FFF0F8" textColor="#9D174D" />}
              <CapTag label={`${fmtContext(model.contextWindow)} Context`} bgColor="#F5F5F5" textColor="#374151" />
            </div>
          </div>

          {/* Description */}
          <div className="px-5 py-4" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#7C3AED' }}>Description</div>
            <p className="text-[12px] leading-relaxed" style={{ color: '#374151', fontFamily: "'Space Grotesk', sans-serif" }}>
              {model.description ?? 'No description available.'}
            </p>
          </div>

          {/* Pricing */}
          <div className="px-5 py-4" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#7C3AED' }}>
              Pricing (incl. {model.markupPct ?? 15}% markup)
            </div>
            <div>
              {[
                { label: 'Provider Input',   value: `$${model.inputPerMtokUsd.toFixed(3)}`,       sub: 'per 1M tokens' },
                { label: 'Provider Output',  value: `$${model.outputPerMtokUsd.toFixed(3)}`,      sub: 'per 1M tokens' },
                { label: 'Billed Input',     value: `$${model.billedInputPerMtokUsd.toFixed(3)}`, sub: 'per 1M tokens' },
                { label: 'Billed Output',    value: `$${model.billedOutputPerMtokUsd.toFixed(3)}`,sub: 'per 1M tokens' },
                { label: 'Context',          value: fmtContext(model.contextWindow),              sub: 'max window' },
              ].map(({ label, value, sub }, i, arr) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between py-2.5"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(26,26,26,0.1)' : 'none' }}
                >
                  <span className="text-[11px] font-mono font-bold" style={{ color: '#374151' }}>{label}</span>
                  <div className="text-right">
                    <span className="text-[15px] font-mono font-black" style={{ color: label.startsWith('Billed') ? '#7C3AED' : '#1A1A1A' }}>{value}</span>
                    <span className="text-[9px] font-mono ml-1.5" style={{ color: '#9CA3AF' }}>{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick start */}
          <div className="px-5 py-4" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em]" style={{ color: '#7C3AED' }}>
                Quick Start
              </div>
              <button
                onClick={copySnip}
                className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors px-2.5 py-1"
                style={{
                  color: snipCopied ? '#7C3AED' : '#6B7280',
                  border: `1.5px solid ${snipCopied ? '#7C3AED' : '#1A1A1A'}`,
                  borderRadius: 6,
                  boxShadow: `1.5px 1.5px 0 ${snipCopied ? '#7C3AED' : '#1A1A1A'}`,
                  background: 'white',
                }}
              >
                {snipCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {snipCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div
              style={{
                background: '#1A1A1A',
                border: '2px solid #1A1A1A',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid #ffffff15' }}>
                <Terminal className="w-3 h-3" style={{ color: '#6BCB77' }} />
                <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#6BCB77' }}>curl</span>
              </div>
              <pre className="px-4 py-3 text-[10px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all" style={{ color: '#E5E7EB' }}>
                {snippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="px-5 py-4 flex gap-3 shrink-0" style={{ borderTop: '2.5px solid #1A1A1A', background: '#FFFBEF' }}>
          <Link
            href={`/playground?model=${encodeURIComponent(model.id)}`}
            onClick={onClose}
            className="nb-btn nb-btn-primary flex-1 flex items-center justify-center gap-2"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 13 }}
          >
            Open in Playground <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/skill"
            onClick={onClose}
            className="nb-btn nb-btn-outline flex items-center justify-center gap-1.5 px-5"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 11 }}
          >
            MCP
          </Link>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────── */
export default function Models() {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [selected, setSelected] = useState<Model | null>(null);

  const { data: models, isLoading, isError } = useListModels();

  const providers = React.useMemo(() => {
    if (!models?.length) return ['All'];
    const unique = Array.from(new Set(models.map(m => m.provider))).sort();
    return ['All', ...unique];
  }, [models]);

  const filtered = React.useMemo(() => {
    if (!models) return [];
    return models.filter(m => {
      const q = search.toLowerCase();
      const matchProvider = providerFilter === 'All' || m.provider === providerFilter;
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
      return matchProvider && matchSearch;
    });
  }, [models, search, providerFilter]);

  return (
    <div className="min-h-screen" style={{ background: '#FFFBEF', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="p-6 max-w-7xl mx-auto space-y-8">

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <div>
            <div
              className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-1"
              style={{ color: '#7C3AED' }}
            >
              — Catalog
            </div>
            <h1
              className="text-5xl font-black uppercase leading-none"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A', letterSpacing: '-0.02em' }}
            >
              Model Catalog
            </h1>
            <p className="text-[11px] font-mono mt-2" style={{ color: '#9CA3AF' }}>
              {isLoading ? 'Loading…' : isError ? 'Failed to load' : `${models?.length ?? 0} models · ${providers.length - 1} providers · all pricing includes markup`}
            </p>
          </div>

          {/* Search */}
          <div className="relative shrink-0 w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="nb-input pl-9"
              style={{ fontFamily: "'Space Mono', monospace" }}
            />
          </div>
        </div>

        {/* Provider filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {providers.map(p => {
            const isActive = providerFilter === p;
            return (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                className="px-3.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest transition-all"
                style={{
                  background:   isActive ? '#7C3AED' : 'white',
                  color:        isActive ? 'white'   : '#1A1A1A',
                  border:       '2px solid #1A1A1A',
                  borderRadius: 999,
                  boxShadow:    '2px 2px 0 #1A1A1A',
                  transform:    isActive ? 'translate(-1px, -1px)' : 'translate(0,0)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-1px,-1px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 #1A1A1A';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0,0)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0 #1A1A1A';
                  }
                }}
              >
                {p}
              </button>
            );
          })}
          <span className="text-[10px] font-mono ml-1" style={{ color: '#9CA3AF' }}>
            {isLoading ? '…' : `${filtered.length} model${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: 'white',
                  border: '2.5px solid #1A1A1A',
                  borderRadius: 12,
                  boxShadow: '4px 4px 0 #1A1A1A',
                  height: 220,
                  opacity: 0.4,
                }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div
            className="py-20 text-center"
            style={{
              background: 'white',
              border: '2.5px solid #FF6B6B',
              borderRadius: 12,
              boxShadow: '4px 4px 0 #1A1A1A',
            }}
          >
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest" style={{ color: '#FF6B6B' }}>
              Failed to load model catalog
            </div>
            <p className="text-[10px] font-mono mt-2" style={{ color: '#9CA3AF' }}>Check your connection and try refreshing</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && (
          filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(m => (
                <ModelCard key={m.id} model={m} onSelect={() => setSelected(m)} />
              ))}
            </div>
          ) : (
            <div
              className="py-20 text-center"
              style={{
                background: 'white',
                border: '2.5px solid #1A1A1A',
                borderRadius: 12,
                boxShadow: '4px 4px 0 #1A1A1A',
              }}
            >
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
                No models match "{search || providerFilter}"
              </div>
            </div>
          )
        )}

        {/* Detail drawer */}
        {selected && (
          <ModelDrawer model={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}
