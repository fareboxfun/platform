import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Copy, Check, Eye, Brain, Leaf, Wrench, Zap, X, ArrowRight, Terminal } from 'lucide-react';

/* ─────────────────────────────────────────────────
   Shared model data — single source of truth
   All pricing verified July 2026. Includes 15% markup.
───────────────────────────────────────────────── */
export const MODELS = [
  // ── Anthropic ──────────────────────────────────────────────────────────
  { id: 'anthropic/claude-fable-5',          name: 'Claude Fable 5',     provider: 'Anthropic', description: 'Mythos-class Claude for autonomous knowledge work and long-horizon agentic tasks. 1M context.',      context: '1M',   input: 10.00, output: 50.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'anthropic/claude-opus-4.8',         name: 'Claude Opus 4.8',    provider: 'Anthropic', description: "Anthropic's most capable Opus. Best for deep research, complex analysis, and multi-step reasoning.", context: '1M',   input: 5.00,  output: 25.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'Most Capable' },
  { id: 'anthropic/claude-opus-4.7',         name: 'Claude Opus 4.7',    provider: 'Anthropic', description: 'Built for long-running async agentic tasks. Handles complex multi-step reasoning with 1M context.',  context: '1M',   input: 5.00,  output: 25.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'anthropic/claude-sonnet-5',         name: 'Claude Sonnet 5',    provider: 'Anthropic', description: 'Frontier performance at balanced cost. Best all-around Claude for production agentic workflows.',     context: '1M',   input: 2.00,  output: 10.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'Best Value' },
  { id: 'claude-opus-4-5',                   name: 'Claude Opus 4.5',    provider: 'Anthropic', description: 'Highly capable Claude for complex reasoning, research synthesis, and long-form tasks.',              context: '200k', input: 15.00, output: 75.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'claude-sonnet-4-5',                 name: 'Claude Sonnet 4.5',  provider: 'Anthropic', description: 'Balanced performance and speed. Reliable all-around Claude for production workloads.',               context: '200k', input: 3.00,  output: 15.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'claude-haiku-3-5',                  name: 'Claude Haiku 3.5',   provider: 'Anthropic', description: 'Fast and cost-efficient. Ideal for high-volume tasks, classification, and summaries.',               context: '200k', input: 0.80,  output: 4.00,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  // ── OpenAI ─────────────────────────────────────────────────────────────
  { id: 'openai/gpt-5.6-sol',                name: 'GPT-5.6 Sol',        provider: 'OpenAI',    description: 'Flagship GPT-5.6. Best quality for complex reasoning, coding, and production workflows.',            context: '1M',   input: 5.00,  output: 30.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'openai/gpt-5.6-terra',              name: 'GPT-5.6 Terra',      provider: 'OpenAI',    description: 'Balanced GPT-5.6. Strong reasoning and coding at mid-range cost. Best all-rounder in the family.',  context: '1M',   input: 2.50,  output: 15.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'openai/gpt-5.6-luna',               name: 'GPT-5.6 Luna',       provider: 'OpenAI',    description: 'Fast, cost-efficient GPT-5.6. Built for high-volume agentic loops and real-time applications.',      context: '1M',   input: 1.00,  output: 6.00,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'openai/gpt-4.1',                    name: 'GPT-4.1',            provider: 'OpenAI',    description: "OpenAI's latest GPT with improved instruction following, coding, and 1M context window.",            context: '1M',   input: 2.00,  output: 8.00,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'openai/gpt-4.1-mini',               name: 'GPT-4.1 Mini',       provider: 'OpenAI',    description: 'Fast and affordable GPT-4.1 variant. Best OpenAI model for high-throughput agentic pipelines.',      context: '1M',   input: 0.40,  output: 1.60,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'gpt-4o',                            name: 'GPT-4o',             provider: 'OpenAI',    description: 'OpenAI flagship multimodal model. Excellent at code, analysis, and structured output.',              context: '128k', input: 2.50,  output: 10.00, streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'gpt-4o-mini',                       name: 'GPT-4o Mini',        provider: 'OpenAI',    description: 'Small, fast, and affordable. Great for real-time chat and high-volume agentic loops.',               context: '128k', input: 0.15,  output: 0.60,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'gpt-o3',                            name: 'o3',                 provider: 'OpenAI',    description: 'Most powerful OpenAI reasoning model. Complex multi-step logic, math, and science.',                 context: '200k', input: 10.00, output: 40.00, streaming: false, tools: false, vision: false, reasoning: true,  openSource: false, badge: 'Reasoning' },
  { id: 'openai/o4-mini',                    name: 'o4 Mini',            provider: 'OpenAI',    description: 'Fast, affordable reasoning model from OpenAI. Near o3 quality at a fraction of the cost.',           context: '200k', input: 1.10,  output: 4.40,  streaming: true,  tools: false, vision: false, reasoning: true,  openSource: false },
  // ── Google ─────────────────────────────────────────────────────────────
  { id: 'google/gemini-2.5-pro',             name: 'Gemini 2.5 Pro',     provider: 'Google',    description: "Google's most capable Gemini with deep thinking mode and 1M context. Excellent for research.",       context: '1M',   input: 1.25,  output: 10.00, streaming: true,  tools: true,  vision: true,  reasoning: true,  openSource: false },
  { id: 'google/gemini-2.5-flash',           name: 'Gemini 2.5 Flash',   provider: 'Google',    description: 'Fast Gemini 2.5 with 1M context and vision. Great balance of speed and capability.',                context: '1M',   input: 0.30,  output: 2.50,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  { id: 'google/gemini-2.0-flash-001',       name: 'Gemini 2.0 Flash',   provider: 'Google',    description: 'Ultra-fast, ultra-cheap Gemini. Best for high-volume agentic loops and real-time tasks.',            context: '1M',   input: 0.10,  output: 0.40,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  // ── xAI ────────────────────────────────────────────────────────────────
  { id: 'x-ai/grok-4.5',                    name: 'Grok 4.5',           provider: 'xAI',       description: "xAI's smartest model. Frontier coding, STEM, and knowledge work with 500k context.",                context: '500k', input: 2.00,  output: 6.00,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false, badge: 'New' },
  { id: 'x-ai/grok-4.20',                   name: 'Grok 4.20',          provider: 'xAI',       description: 'Reasoning model with 2M context. Built for multi-agent workflows and long-context tasks.',           context: '2M',   input: 1.25,  output: 2.50,  streaming: true,  tools: true,  vision: true,  reasoning: true,  openSource: false },
  { id: 'x-ai/grok-4.3',                    name: 'Grok 4.3',           provider: 'xAI',       description: 'Balanced Grok model with 1M context. Strong performance across coding, analysis, and research.',     context: '1M',   input: 1.25,  output: 2.50,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: false },
  // ── Moonshot ───────────────────────────────────────────────────────────
  { id: 'moonshotai/kimi-k3',               name: 'Kimi K3',            provider: 'Moonshot',  description: 'Moonshot 2.8T open-weight multimodal reasoning model. Long-horizon coding and agentic tasks.',        context: '1M',   input: 3.00,  output: 15.00, streaming: true,  tools: true,  vision: true,  reasoning: true,  openSource: true,  badge: 'New' },
  { id: 'moonshotai/kimi-k2',               name: 'Kimi K2',            provider: 'Moonshot',  description: '1T-parameter MoE. Cost-efficient coding and reasoning for production workflows.',                     context: '131k', input: 0.15,  output: 2.50,  streaming: true,  tools: true,  vision: false, reasoning: false, openSource: false },
  // ── Meta ───────────────────────────────────────────────────────────────
  { id: 'meta/muse-spark-1.1',              name: 'Muse Spark 1.1',     provider: 'Meta',      description: 'Meta multimodal reasoning model for agentic tasks. Accepts text and image input with 1M context.',    context: '1M',   input: 1.25,  output: 4.25,  streaming: true,  tools: true,  vision: true,  reasoning: true,  openSource: false, badge: 'New' },
  { id: 'meta-llama/llama-4-scout',         name: 'Llama 4 Scout',      provider: 'Meta',      description: "Meta's open Llama 4 with 10M token context. Built for massive document and codebase analysis.",      context: '10M',  input: 0.11,  output: 0.34,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: true },
  { id: 'meta-llama/llama-4-maverick',      name: 'Llama 4 Maverick',   provider: 'Meta',      description: "Meta's balanced open Llama 4 model. Strong coding, reasoning, and instruction following.",           context: '1M',   input: 0.20,  output: 0.85,  streaming: true,  tools: true,  vision: true,  reasoning: false, openSource: true },
  { id: 'meta-llama/llama-3.3-70b-instruct',name: 'Llama 3.3 70B',     provider: 'Meta',      description: 'Proven open-source 70B model. Fast inference, great for agentic pipelines at very low cost.',        context: '131k', input: 0.13,  output: 0.40,  streaming: true,  tools: true,  vision: false, reasoning: false, openSource: true,  badge: 'Fastest' },
  // ── DeepSeek ───────────────────────────────────────────────────────────
  { id: 'deepseek/deepseek-v3-0324',        name: 'DeepSeek V3',        provider: 'DeepSeek',  description: "DeepSeek's frontier dense model. Near-SOTA coding and reasoning at extremely low cost.",             context: '64k',  input: 0.27,  output: 1.10,  streaming: true,  tools: true,  vision: false, reasoning: false, openSource: true },
  { id: 'deepseek/deepseek-r1-0528',        name: 'DeepSeek R1',        provider: 'DeepSeek',  description: 'Open-source reasoning model (May 2025). Competitive with o1 at a fraction of the cost.',            context: '163k', input: 0.50,  output: 2.15,  streaming: true,  tools: false, vision: false, reasoning: true,  openSource: true },
  // ── Mistral ────────────────────────────────────────────────────────────
  { id: 'mistralai/mistral-large-2411',     name: 'Mistral Large 2',    provider: 'Mistral',   description: "Mistral's flagship. Excellent multilingual, coding, and structured output. European-built.",         context: '128k', input: 3.00,  output: 9.00,  streaming: true,  tools: true,  vision: false, reasoning: false, openSource: false },
  // ── Alibaba ────────────────────────────────────────────────────────────
  { id: 'qwen/qwen2.5-72b-instruct',        name: 'Qwen 2.5 72B',       provider: 'Alibaba',   description: 'Alibaba open-source powerhouse. Outperforms many proprietary models on coding and math.',            context: '131k', input: 0.39,  output: 0.39,  streaming: true,  tools: true,  vision: false, reasoning: false, openSource: true },
  // ── Tencent ────────────────────────────────────────────────────────────
  { id: 'tencent/hy3',                      name: 'Hy3',                provider: 'Tencent',   description: '295B-parameter MoE from Tencent. 21B active params, 192 experts. Strong coding and multilingual.',   context: '262k', input: 0.20,  output: 0.80,  streaming: true,  tools: true,  vision: false, reasoning: false, openSource: false, badge: 'New' },
  // ── Cohere ─────────────────────────────────────────────────────────────
  { id: 'cohere/command-r-plus-08-2024',    name: 'Command R+',         provider: 'Cohere',    description: "Cohere's enterprise RAG model. Optimized for retrieval, grounded search, and multi-step tool use.",  context: '128k', input: 2.50,  output: 10.00, streaming: true,  tools: true,  vision: false, reasoning: false, openSource: false },
  // ── Perplexity ─────────────────────────────────────────────────────────
  { id: 'perplexity/sonar-pro',             name: 'Sonar Pro',          provider: 'Perplexity',description: 'Search-augmented LLM with real-time web access. Best for current events, research, and citations.',  context: '200k', input: 3.00,  output: 15.00, streaming: true,  tools: false, vision: false, reasoning: false, openSource: false, badge: 'Search' },
  // ── Microsoft ──────────────────────────────────────────────────────────
  { id: 'microsoft/phi-4',                  name: 'Phi-4',              provider: 'Microsoft', description: 'Ultra-compact model from Microsoft Research. Surprisingly strong reasoning for its tiny size.',       context: '16k',  input: 0.07,  output: 0.14,  streaming: true,  tools: false, vision: false, reasoning: false, openSource: true },
] as const;

export type Model = (typeof MODELS)[number] & { badge?: string };

const PROVIDERS = ['All', 'Anthropic', 'OpenAI', 'Google', 'xAI', 'Moonshot', 'Meta', 'DeepSeek', 'Mistral', 'Alibaba', 'Tencent', 'Cohere', 'Perplexity', 'Microsoft'];

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
function ModelCard({ model, onSelect }: { model: typeof MODELS[number] & { badge?: string }; onSelect: () => void }) {
  const pc = PROVIDER_COLOR[model.provider] ?? { bg: '#F5F5F5', border: '#9CA3AF', text: '#374151' };
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
          {/* Provider + badge pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
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
            {(model as any).badge && (
              <span
                className="text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5"
                style={{
                  background: '#FFFBEF',
                  color: '#7C3AED',
                  border: '1.5px solid #7C3AED',
                  borderRadius: 999,
                  boxShadow: '1.5px 1.5px 0 #7C3AED',
                }}
              >
                {(model as any).badge}
              </span>
            )}
          </div>

          {/* Capability icons with colored backgrounds */}
          <div className="flex items-center gap-1 shrink-0">
            {model.vision && (
              <span className="w-5 h-5 flex items-center justify-center" style={{ background: '#EAF3FF', border: '1.5px solid #74B9FF', borderRadius: 6 }} title="Vision">
                <Eye className="w-2.5 h-2.5" style={{ color: '#1A5FA8' }} />
              </span>
            )}
            {model.reasoning && (
              <span className="w-5 h-5 flex items-center justify-center" style={{ background: '#F3EEFF', border: '1.5px solid #7C3AED', borderRadius: 6 }} title="Reasoning">
                <Brain className="w-2.5 h-2.5" style={{ color: '#5B21B6' }} />
              </span>
            )}
            {model.openSource && (
              <span className="w-5 h-5 flex items-center justify-center" style={{ background: '#F0FFF0', border: '1.5px solid #6BCB77', borderRadius: 6 }} title="Open Source">
                <Leaf className="w-2.5 h-2.5" style={{ color: '#276B30' }} />
              </span>
            )}
            {model.tools && (
              <span className="w-5 h-5 flex items-center justify-center" style={{ background: '#FFFBEA', border: '1.5px solid #FFD93D', borderRadius: 6 }} title="Tool Use">
                <Wrench className="w-2.5 h-2.5" style={{ color: '#92610A' }} />
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
          {model.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="px-4 pb-3 pt-3 space-y-1.5" style={{ borderTop: '2px solid #1A1A1A' }}>
        {[
          { label: 'Input / 1M',  value: `$${model.input.toFixed(2)}` },
          { label: 'Output / 1M', value: `$${model.output.toFixed(2)}` },
          { label: 'Context',     value: model.context },
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
function ModelDrawer({ model, onClose }: { model: typeof MODELS[number] & { badge?: string }; onClose: () => void }) {
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
  const pc = PROVIDER_COLOR[model.provider] ?? { bg: '#F5F5F5', border: '#9CA3AF', text: '#374151' };

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
              {model.vision     && <CapTag label="Vision"      icon={<Eye    className="w-2.5 h-2.5" />} bgColor="#EAF3FF" textColor="#1A5FA8" />}
              {model.reasoning  && <CapTag label="Reasoning"   icon={<Brain  className="w-2.5 h-2.5" />} bgColor="#F3EEFF" textColor="#5B21B6" />}
              {model.tools      && <CapTag label="Tool Use"    icon={<Wrench className="w-2.5 h-2.5" />} bgColor="#FFFBEA" textColor="#92610A" />}
              {model.streaming  && <CapTag label="Streaming"   icon={<Zap    className="w-2.5 h-2.5" />} bgColor="#FFF0F8" textColor="#9D174D" />}
              {model.openSource && <CapTag label="Open Source" icon={<Leaf   className="w-2.5 h-2.5" />} bgColor="#F0FFF0" textColor="#276B30" />}
              <CapTag label={`${model.context} Context`} bgColor="#F5F5F5" textColor="#374151" />
            </div>
          </div>

          {/* Description */}
          <div className="px-5 py-4" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#7C3AED' }}>Description</div>
            <p className="text-[12px] leading-relaxed" style={{ color: '#374151', fontFamily: "'Space Grotesk', sans-serif" }}>{model.description}</p>
          </div>

          {/* Pricing */}
          <div className="px-5 py-4" style={{ borderBottom: '2px solid #1A1A1A' }}>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#7C3AED' }}>Pricing (incl. 15% markup)</div>
            <div>
              {[
                { label: 'Input',   value: `$${model.input.toFixed(2)}`,  sub: 'per 1M tokens' },
                { label: 'Output',  value: `$${model.output.toFixed(2)}`, sub: 'per 1M tokens' },
                { label: 'Context', value: model.context,                 sub: 'max window' },
              ].map(({ label, value, sub }, i, arr) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between py-2.5"
                  style={{ borderBottom: i < arr.length - 1 ? '2px solid #1A1A1A' : 'none' }}
                >
                  <span className="text-[11px] font-mono font-bold" style={{ color: '#374151' }}>{label}</span>
                  <div className="text-right">
                    <span className="text-[15px] font-mono font-black" style={{ color: '#1A1A1A' }}>{value}</span>
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
  const [provider, setProvider] = useState('All');
  const [selected, setSelected] = useState<(typeof MODELS[number] & { badge?: string }) | null>(null);

  const filtered = ([...MODELS] as Array<typeof MODELS[number] & { badge?: string }>).filter(m => {
    const q = search.toLowerCase();
    const matchProvider = provider === 'All' || m.provider === provider;
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
    return matchProvider && matchSearch;
  });

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
              {MODELS.length} models · 13 providers · all pricing includes 15% markup
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
          {PROVIDERS.map(p => {
            const isActive = provider === p;
            return (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className="px-3.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest transition-all"
                style={{
                  background:   isActive ? '#7C3AED' : 'white',
                  color:        isActive ? 'white'   : '#1A1A1A',
                  border:       '2px solid #1A1A1A',
                  borderRadius: 999,
                  boxShadow:    isActive ? '2px 2px 0 #1A1A1A' : '2px 2px 0 #1A1A1A',
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
          <span
            className="text-[10px] font-mono ml-1"
            style={{ color: '#9CA3AF' }}
          >
            {filtered.length} model{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
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
            <div
              className="text-[11px] font-mono font-bold uppercase tracking-widest"
              style={{ color: '#9CA3AF' }}
            >
              No models match "{search}"
            </div>
          </div>
        )}

        {/* Detail drawer */}
        {selected && (
          <ModelDrawer model={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}
