import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { TopNav } from '../components/top-nav';
import { Logo } from '../components/logo';
import { Footer } from '../components/footer';
import { Search, Zap, Wrench, ArrowRight, Eye, Brain, Leaf, Globe } from 'lucide-react';

// vision=supports image input, reasoning=chain-of-thought/thinking mode, openSource=weights public
// All pricing verified from OpenRouter API — July 2026
const MODELS = [
  // ── Anthropic ──────────────────────────────────────────────────────────────
  { id: 'anthropic/claude-fable-5',              name: 'Claude Fable 5',      provider: 'Anthropic',  description: 'Mythos-class Claude for autonomous knowledge work and long-horizon agentic tasks. 1M context.',       context: '1M',    input: 10.00, output: 50.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'anthropic/claude-opus-4.8',             name: 'Claude Opus 4.8',     provider: 'Anthropic',  description: "Anthropic's most capable Opus. Best for deep research, complex analysis, and multi-step reasoning.",  context: '1M',    input: 5.00,  output: 25.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'Most Capable' },
  { id: 'anthropic/claude-opus-4.7',             name: 'Claude Opus 4.7',     provider: 'Anthropic',  description: 'Built for long-running async agentic tasks. Handles complex multi-step reasoning with 1M context.',   context: '1M',    input: 5.00,  output: 25.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'anthropic/claude-sonnet-5',             name: 'Claude Sonnet 5',     provider: 'Anthropic',  description: 'Frontier performance at balanced cost. Best all-around Claude for production agentic workflows.',      context: '1M',    input: 2.00,  output: 10.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'Best Value' },
  { id: 'claude-opus-4-5',                       name: 'Claude Opus 4.5',     provider: 'Anthropic',  description: 'Highly capable Claude for complex reasoning, research synthesis, and long-form tasks.',               context: '200k',  input: 15.00, output: 75.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'claude-sonnet-4-5',                     name: 'Claude Sonnet 4.5',   provider: 'Anthropic',  description: 'Balanced performance and speed. Reliable all-around Claude for production workloads.',                context: '200k',  input: 3.00,  output: 15.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'claude-haiku-3-5',                      name: 'Claude Haiku 3.5',    provider: 'Anthropic',  description: 'Fast and cost-efficient. Ideal for high-volume tasks, classification, and summaries.',                context: '200k',  input: 0.80,  output: 4.00,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  // ── OpenAI ─────────────────────────────────────────────────────────────────
  { id: 'openai/gpt-5.6-sol',                    name: 'GPT-5.6 Sol',         provider: 'OpenAI',     description: 'Flagship GPT-5.6. Best quality for complex reasoning, coding, and production workflows.',             context: '1M',    input: 5.00,  output: 30.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'openai/gpt-5.6-terra',                  name: 'GPT-5.6 Terra',       provider: 'OpenAI',     description: 'Balanced GPT-5.6. Strong reasoning and coding at mid-range cost. Best all-rounder in the family.',   context: '1M',    input: 2.50,  output: 15.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'openai/gpt-5.6-luna',                   name: 'GPT-5.6 Luna',        provider: 'OpenAI',     description: 'Fast, cost-efficient GPT-5.6. Built for high-volume agentic loops and real-time applications.',       context: '1M',    input: 1.00,  output: 6.00,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'openai/gpt-4.1',                        name: 'GPT-4.1',             provider: 'OpenAI',     description: "OpenAI's latest GPT with improved instruction following, coding, and 1M context window.",             context: '1M',    input: 2.00,  output: 8.00,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'openai/gpt-4.1-mini',                   name: 'GPT-4.1 Mini',        provider: 'OpenAI',     description: 'Fast and affordable GPT-4.1 variant. Best OpenAI model for high-throughput agentic pipelines.',       context: '1M',    input: 0.40,  output: 1.60,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'gpt-4o',                                name: 'GPT-4o',              provider: 'OpenAI',     description: 'OpenAI flagship multimodal model. Excellent at code, analysis, and structured output.',               context: '128k',  input: 2.50,  output: 10.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'gpt-4o-mini',                           name: 'GPT-4o Mini',         provider: 'OpenAI',     description: 'Small, fast, and affordable. Great for real-time chat and high-volume agentic loops.',                context: '128k',  input: 0.15,  output: 0.60,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'gpt-o3',                                name: 'o3',                  provider: 'OpenAI',     description: 'Most powerful OpenAI reasoning model. Complex multi-step logic, math, and science.',                  context: '200k',  input: 10.00, output: 40.00,  markup: 15, streaming: false, tools: false, vision: false, reasoning: true,  openSource: false, badge: 'Reasoning' },
  { id: 'openai/o4-mini',                        name: 'o4 Mini',             provider: 'OpenAI',     description: 'Fast, affordable reasoning model from OpenAI. Near o3 quality at a fraction of the cost.',            context: '200k',  input: 1.10,  output: 4.40,   markup: 15, streaming: true,  tools: false, vision: false, reasoning: true,  openSource: false },
  // ── Google ─────────────────────────────────────────────────────────────────
  { id: 'google/gemini-2.5-pro',                 name: 'Gemini 2.5 Pro',      provider: 'Google',     description: "Google's most capable Gemini with deep thinking mode and 1M context. Excellent for research.",        context: '1M',    input: 1.25,  output: 10.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: true,  openSource: false },
  { id: 'google/gemini-2.5-flash',               name: 'Gemini 2.5 Flash',    provider: 'Google',     description: 'Fast Gemini 2.5 with 1M context and vision. Great balance of speed and capability.',                 context: '1M',    input: 0.30,  output: 2.50,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'google/gemini-2.0-flash-001',           name: 'Gemini 2.0 Flash',    provider: 'Google',     description: 'Ultra-fast, ultra-cheap Gemini. Best for high-volume agentic loops and real-time tasks.',             context: '1M',    input: 0.10,  output: 0.40,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  // ── xAI ────────────────────────────────────────────────────────────────────
  { id: 'x-ai/grok-4.5',                         name: 'Grok 4.5',            provider: 'xAI',        description: "SpaceXAI's smartest model. Frontier coding, STEM, and knowledge work with 500k context.",             context: '500k',  input: 2.00,  output: 6.00,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'x-ai/grok-4.20',                        name: 'Grok 4.20',           provider: 'xAI',        description: 'Reasoning model with 2M context. Built for multi-agent workflows and long-context tasks.',            context: '2M',    input: 1.25,  output: 2.50,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: true,  openSource: false },
  { id: 'x-ai/grok-4.3',                         name: 'Grok 4.3',            provider: 'xAI',        description: 'Balanced Grok model with 1M context. Strong performance across coding, analysis, and research.',      context: '1M',    input: 1.25,  output: 2.50,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  // ── Moonshot AI ────────────────────────────────────────────────────────────
  { id: 'moonshotai/kimi-k3',                    name: 'Kimi K3',             provider: 'Moonshot',   description: 'Moonshot 2.8T open-weight multimodal reasoning model. Long-horizon coding and agentic tasks.',         context: '1M',    input: 3.00,  output: 15.00,  markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: true,  openSource: true,  badge: 'New' },
  { id: 'moonshotai/kimi-k2',                    name: 'Kimi K2',             provider: 'Moonshot',   description: '1T-parameter MoE. Cost-efficient coding and reasoning for production workflows.',                      context: '131k',  input: 0.15,  output: 2.50,   markup: 15, streaming: true,  tools: true,  vision: false, reasoning: false, openSource: false },
  // ── Meta ───────────────────────────────────────────────────────────────────
  { id: 'meta/muse-spark-1.1',                   name: 'Muse Spark 1.1',      provider: 'Meta',       description: 'Meta multimodal reasoning model for agentic tasks. Accepts text and image input with 1M context.',     context: '1M',    input: 1.25,  output: 4.25,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: true,  openSource: false, badge: 'New' },
  { id: 'meta-llama/llama-4-scout',              name: 'Llama 4 Scout',       provider: 'Meta',       description: "Meta's open Llama 4 with 10M token context. Built for massive document and codebase analysis.",       context: '10M',   input: 0.11,  output: 0.34,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: true },
  { id: 'meta-llama/llama-4-maverick',           name: 'Llama 4 Maverick',    provider: 'Meta',       description: "Meta's balanced open Llama 4 model. Strong coding, reasoning, and instruction following.",            context: '1M',    input: 0.20,  output: 0.85,   markup: 15, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: true },
  { id: 'meta-llama/llama-3.3-70b-instruct',     name: 'Llama 3.3 70B',       provider: 'Meta',       description: 'Proven open-source 70B model. Fast inference, great for agentic pipelines at very low cost.',         context: '131k',  input: 0.13,  output: 0.40,   markup: 15, streaming: true,  tools: true,  vision: false, reasoning: false, openSource: true,  badge: 'Fastest' },
  // ── DeepSeek ───────────────────────────────────────────────────────────────
  { id: 'deepseek/deepseek-v3-0324',             name: 'DeepSeek V3',         provider: 'DeepSeek',   description: "DeepSeek's frontier dense model. Near-SOTA coding and reasoning at extremely low cost.",              context: '64k',   input: 0.27,  output: 1.10,   markup: 15, streaming: true,  tools: true,  vision: false, reasoning: false, openSource: true },
  { id: 'deepseek/deepseek-r1-0528',             name: 'DeepSeek R1',         provider: 'DeepSeek',   description: 'Open-source reasoning model (May 2025). Competitive with o1 at a fraction of the cost.',             context: '163k',  input: 0.50,  output: 2.15,   markup: 15, streaming: true,  tools: false, vision: false, reasoning: true,  openSource: true },
  // ── Mistral ────────────────────────────────────────────────────────────────
  { id: 'mistralai/mistral-large-2411',          name: 'Mistral Large 2',     provider: 'Mistral',    description: "Mistral's flagship. Excellent multilingual, coding, and structured output. European-built.",          context: '128k',  input: 3.00,  output: 9.00,   markup: 15, streaming: true,  tools: true,  vision: false, reasoning: false, openSource: false },
  // ── Alibaba ────────────────────────────────────────────────────────────────
  { id: 'qwen/qwen2.5-72b-instruct',             name: 'Qwen 2.5 72B',        provider: 'Alibaba',    description: 'Alibaba open-source powerhouse. Outperforms many proprietary models on coding and math.',             context: '131k',  input: 0.39,  output: 0.39,   markup: 15, streaming: true,  tools: true,  vision: false, reasoning: false, openSource: true },
  // ── Tencent ────────────────────────────────────────────────────────────────
  { id: 'tencent/hy3',                           name: 'Hy3',                 provider: 'Tencent',    description: '295B-parameter MoE from Tencent. 21B active params, 192 experts. Strong coding and multilingual.',    context: '262k',  input: 0.20,  output: 0.80,   markup: 15, streaming: true,  tools: true,  vision: false, reasoning: false, openSource: false, badge: 'New' },
  // ── Cohere ─────────────────────────────────────────────────────────────────
  { id: 'cohere/command-r-plus-08-2024',         name: 'Command R+',          provider: 'Cohere',     description: "Cohere's enterprise RAG model. Optimized for retrieval, grounded search, and multi-step tool use.",   context: '128k',  input: 2.50,  output: 10.00,  markup: 15, streaming: true,  tools: true,  vision: false, reasoning: false, openSource: false },
  // ── Perplexity ─────────────────────────────────────────────────────────────
  { id: 'perplexity/sonar-pro',                  name: 'Sonar Pro',           provider: 'Perplexity', description: 'Search-augmented LLM with real-time web access. Best for current events, research, and citations.',   context: '200k',  input: 3.00,  output: 15.00,  markup: 15, streaming: true,  tools: false, vision: false, reasoning: false, openSource: false, badge: 'Search' },
  // ── Microsoft ──────────────────────────────────────────────────────────────
  { id: 'microsoft/phi-4',                       name: 'Phi-4',               provider: 'Microsoft',  description: 'Ultra-compact model from Microsoft Research. Surprisingly strong reasoning for its tiny size.',        context: '16k',   input: 0.07,  output: 0.14,   markup: 15, streaming: true,  tools: false, vision: false, reasoning: false, openSource: true },
];

const API_BASE = (() => {
  if (typeof window === 'undefined') return 'https://api.farebox.fun';
  const h = window.location.hostname;
  if (h === 'farebox.fun' || h === 'www.farebox.fun') return 'https://api.farebox.fun';
  return '/api-proxy';
})();

const PROVIDERS = ['All', 'Anthropic', 'OpenAI', 'Google', 'xAI', 'Moonshot', 'DeepSeek', 'Meta', 'Mistral', 'Alibaba', 'Tencent', 'Cohere', 'Perplexity', 'Microsoft'];

// Provider accent colors for badges
const PROVIDER_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Anthropic:  { bg: '#FF6B6B22', color: '#CC2222', border: '#FF6B6B55' },
  OpenAI:     { bg: '#4ECDC422', color: '#1A8080', border: '#4ECDC455' },
  Google:     { bg: '#74B9FF22', color: '#1A5FAA', border: '#74B9FF55' },
  xAI:        { bg: '#1A1A1A15', color: '#1A1A1A', border: '#1A1A1A40' },
  Moonshot:   { bg: '#C3B1E122', color: '#6B3AED', border: '#C3B1E155' },
  DeepSeek:   { bg: '#FF9F4322', color: '#CC5500', border: '#FF9F4355' },
  Meta:       { bg: '#74B9FF22', color: '#003A8C', border: '#74B9FF55' },
  Mistral:    { bg: '#FFB8D922', color: '#AA2266', border: '#FFB8D955' },
  Alibaba:    { bg: '#FF6B6B22', color: '#AA1100', border: '#FF6B6B55' },
  Tencent:    { bg: '#4ECDC422', color: '#006666', border: '#4ECDC455' },
  Cohere:     { bg: '#6BCB7722', color: '#1A6630', border: '#6BCB7755' },
  Perplexity: { bg: '#7C3AED22', color: '#5B1AAA', border: '#7C3AED55' },
  Microsoft:  { bg: '#74B9FF22', color: '#003A8C', border: '#74B9FF55' },
};

export default function ModelsPage() {
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('All');
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());

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

  const filtered = MODELS.filter(m => {
    const matchProvider = provider === 'All' || m.provider === provider;
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    return matchProvider && matchSearch;
  });

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
              One API key, one balance, one endpoint. All prices include Farebox's transparent markup; you always see exactly what you pay. Provider cost + markup is listed for every model.
            </p>
          </div>
        </div>

        {/* Pricing note — desktop only */}
        <div className="hidden md:block px-8 py-4" style={{ background: 'white', borderBottom: '2px solid #1A1A1A' }}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 text-xs font-mono" style={{ color: '#6B7280' }}>
            <span>All prices in USD per 1M tokens</span>
            <span className="w-px h-4" style={{ background: '#1A1A1A30' }} />
            <span>Farebox billed = Provider cost × (1 + markup%)</span>
            <span className="w-px h-4" style={{ background: '#1A1A1A30' }} />
            <span>Balance funded 1:1 with USDC on Solana</span>
            <span className="w-px h-4" style={{ background: '#1A1A1A30' }} />
            <span className="font-bold" style={{ color: '#7C3AED' }}>Default markup: 15–20%</span>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-8 py-4 sm:py-5" style={{ background: '#FFFBEF', borderBottom: '2px solid #1A1A1A' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">

            {/* Search — full width on mobile, capped on desktop */}
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
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="md:hidden w-full"
              style={{
                border: '2.5px solid #1A1A1A',
                borderRadius: 10,
                padding: '10px 14px',
                background: provider !== 'All' ? '#7C3AED' : 'white',
                color: provider !== 'All' ? 'white' : '#1A1A1A',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '3px 3px 0 #1A1A1A',
                cursor: 'pointer',
              }}
            >
              {PROVIDERS.map(p => (
                <option key={p} value={p} style={{ background: 'white', color: '#1A1A1A' }}>{p}</option>
              ))}
            </select>

            {/* Desktop: chip pills */}
            <div className="hidden md:flex flex-wrap gap-2">
              {PROVIDERS.map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className="nb-badge"
                  style={provider === p
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
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map(m => {
              const billedIn = +(m.input * (1 + m.markup / 100)).toFixed(3);
              const billedOut = +(m.output * (1 + m.markup / 100)).toFixed(3);
              const providerColor = PROVIDER_COLORS[m.provider] || { bg: '#7C3AED18', color: '#7C3AED', border: '#7C3AED40' };
              return (
                <div
                  key={m.id}
                  className="nb-card nb-card-hover p-6 relative group"
                >
                  {/* badge */}
                  {m.badge && (
                    <span
                      className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
                      style={{ background: '#FFD93D', color: '#1A1A1A', border: '1.5px solid #1A1A1A', borderRadius: 6, boxShadow: '1.5px 1.5px 0 #1A1A1A' }}
                    >
                      {m.badge}
                    </span>
                  )}
                  {/* header */}
                  <div className="mb-4">
                    <span
                      className="inline-block text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 mb-2"
                      style={{ background: providerColor.bg, color: providerColor.color, border: `1.5px solid ${providerColor.border}`, borderRadius: 999 }}
                    >
                      {m.provider}
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>{m.name}</h3>
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: '#6B7280' }}>{m.description}</p>
                  </div>
                  {/* capabilities */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="nb-tag" style={{ color: '#6B7280' }}>{m.context} CTX</span>
                    {m.streaming && (
                      <span className="nb-tag flex items-center gap-1" style={{ background: '#6BCB7720', borderColor: '#6BCB77', color: '#1A6630' }}>
                        <Zap className="w-3 h-3" />Streaming
                      </span>
                    )}
                    {m.tools && (
                      <span className="nb-tag flex items-center gap-1" style={{ background: '#74B9FF20', borderColor: '#74B9FF', color: '#1A5FAA' }}>
                        <Wrench className="w-3 h-3" />Tools
                      </span>
                    )}
                    {m.vision && (
                      <span className="nb-tag flex items-center gap-1" style={{ background: '#C3B1E120', borderColor: '#C3B1E1', color: '#6B3AED' }}>
                        <Eye className="w-3 h-3" />Vision
                      </span>
                    )}
                    {m.reasoning && (
                      <span className="nb-tag flex items-center gap-1" style={{ background: '#FF9F4320', borderColor: '#FF9F43', color: '#CC5500' }}>
                        <Brain className="w-3 h-3" />Reasoning
                      </span>
                    )}
                    {m.openSource && (
                      <span className="nb-tag flex items-center gap-1" style={{ background: '#4ECDC420', borderColor: '#4ECDC4', color: '#1A8080' }}>
                        <Leaf className="w-3 h-3" />Open Source
                      </span>
                    )}
                  </div>
                  {/* pricing grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4" style={{ borderTop: '2px solid #1A1A1A' }}>
                    <div>
                      <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>Provider Cost</div>
                      <div className="font-mono text-sm">
                        <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>In/1M</span><span className="font-bold" style={{ color: '#1A1A1A' }}>${m.input.toFixed(3)}</span></div>
                        <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Out/1M</span><span className="font-bold" style={{ color: '#1A1A1A' }}>${m.output.toFixed(3)}</span></div>
                      </div>
                    </div>
                    <div className="px-3 py-2" style={{ background: '#7C3AED12', border: '2px solid #7C3AED', borderRadius: 8 }}>
                      <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: '#7C3AED' }}>Billed via Farebox</div>
                      <div className="font-mono text-sm">
                        <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>In/1M</span><span className="font-bold" style={{ color: '#7C3AED' }}>${billedIn}</span></div>
                        <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Out/1M</span><span className="font-bold" style={{ color: '#7C3AED' }}>${billedOut}</span></div>
                      </div>
                      <div className="text-[9px] font-mono mt-1" style={{ color: '#9CA3AF' }}>+{m.markup}% markup</div>
                    </div>
                  </div>
                  {/* model id */}
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

          {filtered.length === 0 && (
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
