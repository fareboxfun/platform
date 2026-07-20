import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import {
  Copy, Check, ArrowRight, ExternalLink, Zap, Globe, Lock,
  Terminal, Cpu, BookOpen, ChevronRight, TrendingUp, Users, Code2, Database,
  X, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';

/* ─────────────────────────────────────────────────
   API base
───────────────────────────────────────────────── */
const API_BASE = (() => {
  if (typeof window === 'undefined') return 'https://api.farebox.fun';
  const h = window.location.hostname;
  if (h === 'farebox.fun' || h === 'www.farebox.fun') return 'https://api.farebox.fun';
  return '/api-proxy';
})();

/* ─────────────────────────────────────────────────
   Skill submission modal
───────────────────────────────────────────────── */
const CATEGORIES = ['AI Tools', 'Data & Analytics', 'Finance', 'Productivity', 'Developer Tools', 'Other'];

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

function SubmitSkillModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', description: '', specUrl: '', category: 'AI Tools',
    pricePer1k: '', contactName: '', contactEmail: '',
  });
  const [state, setState] = useState<SubmitState>('idle');
  const [submissionId, setSubmissionId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/skills/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Submission failed');
      setSubmissionId(data.submissionId);
      setState('success');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Something went wrong');
      setState('error');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 13,
    fontFamily: "'Space Grotesk', sans-serif",
    background: '#FAFAFA', border: '2px solid #1A1A1A', borderRadius: 8,
    outline: 'none', color: '#1A1A1A',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: '#6B7280', marginBottom: 5, fontFamily: "'Space Mono', monospace",
  };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: '#FFFBEF', border: '2.5px solid #1A1A1A', borderRadius: 14, boxShadow: '6px 6px 0 #1A1A1A' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4" style={{ borderBottom: '2px solid #1A1A1A' }}>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.25em] mb-1" style={{ color: '#7C3AED' }}>
              Marketplace
            </div>
            <div className="font-black uppercase text-xl leading-tight" style={{ fontFamily: "'Archivo Black', sans-serif", color: '#1A1A1A' }}>
              Submit a Skill
            </div>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
              Goes live in ~24h · You earn 80% per call · No code changes needed
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 ml-4 mt-0.5 p-1.5 rounded-md transition-colors" style={{ color: '#9CA3AF' }}
            onMouseOver={e => (e.currentTarget.style.color = '#1A1A1A')}
            onMouseOut={e  => (e.currentTarget.style.color = '#9CA3AF')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success state */}
        {state === 'success' ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#6BCB77' }} />
            <div className="font-black uppercase text-xl mb-2" style={{ fontFamily: "'Archivo Black', sans-serif", color: '#1A1A1A' }}>
              Submission Received!
            </div>
            <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
              We'll review your skill and email you within 24 hours.
            </p>
            <div className="inline-block px-3 py-1.5 rounded-md text-xs font-mono" style={{ background: '#1A1A1A', color: '#FFD93D' }}>
              ID: {submissionId}
            </div>
            <div className="mt-8">
              <button onClick={onClose} className="nb-btn nb-btn-primary">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Row: name + category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Skill Name *</label>
                <input required value={form.name} onChange={set('name')} placeholder="e.g. PDF Summarizer"
                  style={inputStyle} maxLength={80} />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select required value={form.category} onChange={set('category')}
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea required value={form.description} onChange={set('description')}
                placeholder="What does your skill do? What inputs does it take?"
                rows={3} maxLength={500}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
              <div className="text-right text-[10px] font-mono mt-1" style={{ color: '#9CA3AF' }}>
                {form.description.length}/500
              </div>
            </div>

            {/* OpenAPI URL */}
            <div>
              <label style={labelStyle}>OpenAPI Spec URL *</label>
              <input required type="url" value={form.specUrl} onChange={set('specUrl')}
                placeholder="https://yourdomain.com/openapi.json" style={inputStyle} />
              <p className="text-[10px] font-mono mt-1" style={{ color: '#9CA3AF' }}>
                Must be a publicly accessible JSON or YAML URL
              </p>
            </div>

            {/* Price */}
            <div>
              <label style={labelStyle}>Price per 1,000 calls (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold" style={{ color: '#9CA3AF' }}>$</span>
                <input required value={form.pricePer1k} onChange={set('pricePer1k')}
                  placeholder="1.00" pattern="^\d+(\.\d{1,4})?$"
                  style={{ ...inputStyle, paddingLeft: 28 }} />
              </div>
              <p className="text-[10px] font-mono mt-1" style={{ color: '#9CA3AF' }}>
                You keep 80% · Farebox takes 20% · Billed in USDC on Solana
              </p>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input required value={form.contactName} onChange={set('contactName')}
                  placeholder="Alice" style={inputStyle} maxLength={100} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input required type="email" value={form.contactEmail} onChange={set('contactEmail')}
                  placeholder="you@example.com" style={inputStyle} />
              </div>
            </div>

            {/* Error */}
            {state === 'error' && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm" style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#EF4444' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1.5px solid #E5E7EB' }}>
              <button type="button" onClick={onClose} className="nb-btn nb-btn-outline" style={{ fontSize: 13 }}>
                Cancel
              </button>
              <button type="submit" disabled={state === 'loading'} className="nb-btn nb-btn-primary flex items-center gap-2">
                {state === 'loading'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <>Submit Skill <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Copy-to-clipboard hook
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
   Code block with copy
───────────────────────────────────────────────── */
function CodeBlock({ code, label, lang = 'json' }: { code: string; label?: string; lang?: string }) {
  const { copied, copy } = useCopy(code);
  return (
    <div style={{ background: '#1A1A1A', border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A', overflow: 'hidden' }}>
      {label && (
        <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #ffffff12' }}>
          <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#9CA3AF' }}>{label}</span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest transition-colors"
            style={{ color: copied ? '#7C3AED' : '#6B7280' }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      )}
      {!label && (
        <div className="flex justify-end px-4 py-2" style={{ borderBottom: '1px solid #ffffff12' }}>
          <button onClick={copy} className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest transition-colors"
            style={{ color: copied ? '#7C3AED' : '#6B7280' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      )}
      <pre className="px-5 py-4 overflow-x-auto text-[12px] font-mono leading-relaxed" style={{ color: '#E5E7EB' }}>
        {code}
      </pre>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Data
───────────────────────────────────────────────── */
const NATIVE_MODELS = [
  { id: 'anthropic/claude-fable-5',         name: 'claude-fable-5',      provider: 'Anthropic',  tags: ['Vision','Agentic'],        priceOut: '$57.50', priceIn: '$11.50', ctx: '1M',   badge: 'NEW' },
  { id: 'openai/gpt-5.6-sol',               name: 'gpt-5.6-sol',         provider: 'OpenAI',     tags: ['Vision','Code'],           priceOut: '$34.50', priceIn: '$5.75',  ctx: '1M',   badge: 'NEW' },
  { id: 'openai/gpt-5.6-terra',             name: 'gpt-5.6-terra',       provider: 'OpenAI',     tags: ['Vision','Balanced'],       priceOut: '$17.25', priceIn: '$2.88',  ctx: '1M',   badge: 'NEW' },
  { id: 'anthropic/claude-opus-4.8',        name: 'claude-opus-4.8',     provider: 'Anthropic',  tags: ['Vision','Research'],       priceOut: '$28.75', priceIn: '$5.75',  ctx: '1M',   badge: null  },
  { id: 'anthropic/claude-sonnet-5',        name: 'claude-sonnet-5',     provider: 'Anthropic',  tags: ['Vision','Fast'],           priceOut: '$11.50', priceIn: '$2.30',  ctx: '1M',   badge: null  },
  { id: 'google/gemini-2.5-pro',            name: 'gemini-2.5-pro',      provider: 'Google',     tags: ['Vision','Reasoning'],      priceOut: '$11.50', priceIn: '$1.44',  ctx: '1M',   badge: null  },
  { id: 'moonshotai/kimi-k3',               name: 'kimi-k3',             provider: 'Moonshot',   tags: ['Vision','Reasoning','OSS'],priceOut: '$17.25', priceIn: '$3.45',  ctx: '1M',   badge: 'NEW' },
  { id: 'x-ai/grok-4.5',                   name: 'grok-4.5',            provider: 'xAI',        tags: ['Vision','STEM'],           priceOut: '$6.90',  priceIn: '$2.30',  ctx: '500k', badge: 'NEW' },
  { id: 'x-ai/grok-4.20',                  name: 'grok-4.20',           provider: 'xAI',        tags: ['Vision','Reasoning'],      priceOut: '$2.88',  priceIn: '$1.44',  ctx: '2M',   badge: 'NEW' },
  { id: 'deepseek/deepseek-r1-0528',        name: 'deepseek-r1',         provider: 'DeepSeek',   tags: ['Reasoning','OSS'],         priceOut: '$2.47',  priceIn: '$0.58',  ctx: '163k', badge: null  },
  { id: 'meta-llama/llama-4-scout',         name: 'llama-4-scout',       provider: 'Meta',       tags: ['Vision','10M ctx','OSS'],  priceOut: '$0.39',  priceIn: '$0.13',  ctx: '10M',  badge: null  },
  { id: 'microsoft/phi-4',                 name: 'phi-4',               provider: 'Microsoft',  tags: ['Compact','OSS'],           priceOut: '$0.16',  priceIn: '$0.08',  ctx: '16k',  badge: null  },
];

const SKILL_ICONS: Record<string, React.ElementType> = {
  'summarize':    BookOpen,
  'translate':    Globe,
  'code-review':  Code2,
  'explain':      Cpu,
  'sentiment':    TrendingUp,
  'extract-data': Database,
  'draft-email':  Users,
  'fix-grammar':  CheckCircle2,
};

const PAYMENT_STEPS = [
  { n: '01', title: 'Agent calls any endpoint', body: 'Your agent sends a standard OpenAI-compatible request to api.farebox.fun/v1/chat/completions with no auth header.' },
  { n: '02', title: 'API responds 402', body: 'Farebox returns HTTP 402 Payment Required with the exact USDC amount for this request and a payment nonce.' },
  { n: '03', title: 'x402 SDK signs the payment', body: 'The x402 client library signs a Solana USDC microtransaction from the agent\'s wallet. Gas is sponsored — no SOL needed.' },
  { n: '04', title: 'Retry with payment proof', body: 'The agent retries the same request with an X-PAYMENT header containing the signed payment proof.' },
  { n: '05', title: 'LLM response returned', body: 'Farebox verifies the payment on-chain, routes to the model, and streams back the completion. No account, no invoice, no KYC.' },
];

const EARN_PATHS = [
  {
    icon: Code2,
    title: 'Skill Publisher',
    badge: 'OPEN',
    pct: '80%',
    label: 'per call, to you',
    desc: 'Publish any AI tool to the Farebox marketplace. Every agent that calls your skill pays you 80% in USDC, deposited weekly to your Solana wallet.',
    steps: ['Write an HTTP endpoint that does one thing well', 'Submit your skill spec (OpenAPI + pricing)', 'Farebox wraps it in x402 + MCP — goes live in 24h', 'Earn per call, forever — no rev-share cap'],
    accentColor: '#7C3AED',
  },
  {
    icon: Cpu,
    title: 'Relay Operator',
    badge: 'EARLY ACCESS',
    pct: '80%',
    label: 'of routing margin',
    desc: 'Run a Farebox relay node. Your node handles API routing for a slice of live traffic. Earn USDC per million tokens routed, auto-paid to your wallet.',
    steps: ['One curl command deploys the relay agent', 'Register your Solana wallet on-chain', 'Traffic routes to you based on latency + availability', 'Weekly USDC payout — no minimum threshold'],
    accentColor: '#4ECDC4',
  },
  {
    icon: Users,
    title: 'Affiliate',
    badge: 'OPEN',
    pct: '15%',
    label: 'of referred spend, 12mo',
    desc: 'Share your referral link. Every developer you bring to Farebox earns you 15% of their monthly API spend for 12 months — paid in USDC.',
    steps: ['Generate your referral link in the dashboard', 'Share with developers, founders, AI teams', 'Earn 15% of their Farebox spend automatically', 'No minimum, no cap — scales with your network'],
    accentColor: '#FF9F43',
  },
];

const MCP_CONFIG = `{
  "mcpServers": {
    "farebox": {
      "command": "npx",
      "args": ["-y", "farebox-mcp"],
      "env": {
        "FAREBOX_API_KEY": "sk-fbx-your-key-here"
      }
    }
  }
}`;

const MCP_X402_CONFIG = `{
  "mcpServers": {
    "farebox": {
      "command": "npx",
      "args": ["-y", "farebox-mcp"],
      "env": {
        "SVM_PRIVATE_KEY": "your-base58-solana-private-key"
      }
    }
  }
}`;

const CURL_EXAMPLE = `# Step 1 — Call any model. Gets 402 if no auth:
curl https://api.farebox.fun/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"anthropic/claude-sonnet-5","messages":[{"role":"user","content":"Hello"}]}'

# → HTTP 402 + {"x402":"1.0","amount":"0.000012","currency":"USDC","network":"solana"}

# Step 2 — Sign with any x402 client, then retry:
curl https://api.farebox.fun/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <signed-x402-proof>" \\
  -d '{"model":"anthropic/claude-sonnet-5","messages":[{"role":"user","content":"Hello"}]}'

# → { "choices": [{ "message": { "content": "Hello! How can I help?" } }] }`;

const PUBLISH_SPEC = `# Your skill is just an HTTP endpoint:
POST https://your-api.com/my-skill

# → Returns JSON. We handle:
#   x402 payment wrapping
#   MCP tool registration  
#   Rate limiting + billing
#   Payout to your Solana wallet

# Minimal OpenAPI + pricing spec:
{
  "skill_id": "my-awesome-skill",
  "endpoint": "https://your-api.com/my-skill",
  "price_usd": 0.010,
  "description": "One thing your skill does extremely well"
}`;

const COLLAB_TARGETS = [
  { name: 'Hyre Network', domain: 'DeFi Data', desc: 'Publish their 13 DeFi tools as Farebox community skills — instant x402 monetization for existing API.' },
  { name: 'Pyth Network', domain: 'Price Oracles', desc: 'Real-time Solana price feeds + TVL data as a callable Farebox skill — $0.002/call.' },
  { name: 'io.net', domain: 'GPU Compute', desc: 'Decentralized GPU inference routed through Farebox — pay-per-token in USDC from distributed nodes.' },
  { name: 'Nansen', domain: 'Wallet Intel', desc: 'On-chain analytics — wallet scoring, smart money tracking — as per-call agent tools.' },
  { name: 'DeFiLlama', domain: 'DeFi Data', desc: 'TVL, yields, protocol data — all as machine-callable Farebox skills with x402 micropayments.' },
  { name: 'Colosseum', domain: 'Grants', desc: 'Solana accelerator for Farebox-native projects — grants, mentorship, token backing.' },
];

/* ─────────────────────────────────────────────────
   Tag chip
───────────────────────────────────────────────── */
function Tag({ label }: { label: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    Vision:    { bg: '#C3B1E122', color: '#6B3AED' },
    Reasoning: { bg: '#74B9FF22', color: '#1A5FAA' },
    OSS:       { bg: '#6BCB7722', color: '#1A6630' },
    Agentic:   { bg: '#FFD93D22', color: '#996600' },
    Code:      { bg: '#FF6B6B22', color: '#AA2222' },
    Fast:      { bg: '#4ECDC422', color: '#1A8080' },
    Balanced:  { bg: '#C3B1E122', color: '#6B3AED' },
    Research:  { bg: '#C3B1E122', color: '#6B3AED' },
    STEM:      { bg: '#FF6B6B22', color: '#AA2222' },
    Compact:   { bg: '#9CA3AF22', color: '#374151' },
    '10M ctx': { bg: '#7C3AED22', color: '#5B1AAA' },
  };
  const c = colors[label] || { bg: '#1A1A1A08', color: '#374151' };
  return (
    <span className="nb-tag" style={{ background: c.bg, color: c.color, borderColor: c.color + '60' }}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────── */
interface LiveSkill { id: string; name: string; description: string; category: string; defaultModel: string; priceMultiplier: number; }

export default function SkillPage() {
  const [showAllModels, setShowAllModels] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const visibleModels = showAllModels ? NATIVE_MODELS : NATIVE_MODELS.slice(0, 8);

  const [liveSkills, setLiveSkills] = useState<LiveSkill[]>([]);
  const [trySkill, setTrySkill] = useState<LiveSkill | null>(null);
  const [tryInput, setTryInput] = useState('');
  const [tryKey, setTryKey] = useState('');
  const [tryResult, setTryResult] = useState('');
  const [tryLoading, setTryLoading] = useState(false);
  const [tryError, setTryError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/v1/skills`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.data)) setLiveSkills(d.data); })
      .catch(() => {});
  }, []);

  const runTrial = async () => {
    if (!trySkill || !tryInput.trim() || !tryKey.trim()) return;
    setTryLoading(true); setTryResult(''); setTryError('');
    try {
      const r = await fetch(`${API_BASE}/v1/skills/${trySkill.id}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tryKey}` },
        body: JSON.stringify({ input: tryInput, stream: false }),
      });
      const data = await r.json();
      if (!r.ok) setTryError(data.error?.message || 'Request failed');
      else setTryResult(data.output || '');
    } catch { setTryError('Network error'); }
    finally { setTryLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFBEF', fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
      {showSubmitModal && <SubmitSkillModal onClose={() => setShowSubmitModal(false)} />}

      {/* ── Try Skill Modal ── */}
      {trySkill && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setTrySkill(null)}>
          <div style={{ background: '#FFFBEF', border: '2.5px solid #1A1A1A', borderRadius: 16, boxShadow: '6px 6px 0 #1A1A1A', width: '100%', maxWidth: 540, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7C3AED', marginBottom: 4 }}>— Try Skill</div>
                <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#1A1A1A', margin: 0 }}>{trySkill.name}</h2>
                <code style={{ fontSize: 10, color: '#9CA3AF' }}>/v1/skills/{trySkill.id}/call</code>
              </div>
              <button onClick={() => setTrySkill(null)} style={{ background: 'none', border: '2px solid #1A1A1A', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontWeight: 900, fontSize: 14 }}>✕</button>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9, fontFamily: 'monospace', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6B7280', marginBottom: 6 }}>Input Text</label>
              <textarea value={tryInput} onChange={e => setTryInput(e.target.value)} rows={4}
                placeholder={`Paste the text you want to ${trySkill.name.toLowerCase()}…`}
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #1A1A1A', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9, fontFamily: 'monospace', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6B7280', marginBottom: 6 }}>
                API Key <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(from dashboard)</span>
              </label>
              <input value={tryKey} onChange={e => setTryKey(e.target.value)} type="password" placeholder="sk-..."
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #1A1A1A', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setTrySkill(null)} className="nb-btn nb-btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={runTrial} disabled={tryLoading || !tryInput.trim() || !tryKey.trim()} className="nb-btn nb-btn-primary" style={{ flex: 2 }}>
                {tryLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</> : <>Run <Zap className="w-4 h-4" /></>}
              </button>
            </div>
            {tryError && <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '2px solid #FCA5A5', borderRadius: 8, fontSize: 12, color: '#991B1B', fontFamily: 'monospace' }}>{tryError}</div>}
            {tryResult && (
              <div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#065F46', marginBottom: 6 }}>✓ Result</div>
                <pre style={{ background: '#1A1A1A', color: '#E5E7EB', padding: '14px 16px', borderRadius: 10, fontSize: 12, overflowX: 'auto', maxHeight: 280, overflowY: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{tryResult}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      <TopNav />

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em]" style={{ color: '#7C3AED' }}>Agents</span>
          <ChevronRight className="w-3 h-3" style={{ color: '#9CA3AF' }} />
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em]" style={{ color: '#374151' }}>Skills</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          <div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>
              — Agent Skills
            </div>
            <h1 className="font-black uppercase leading-none mb-6"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 'clamp(40px,6vw,72px)', color: '#1A1A1A' }}>
              Give your agent<br />
              <span style={{ color: '#7C3AED' }}>Farebox</span> skills
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#4B5563', maxWidth: 480 }}>
              Plug 36 frontier models <em>and</em> a growing open marketplace of community AI tools into
              Claude, Cursor, or any agent framework. Your agent pays per token in USDC on Solana —
              no accounts, no invoices, pure machine-native payments via x402.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3">
              {[
                { v: '36', l: 'Models', color: '#7C3AED' },
                { v: 'Open', l: 'Marketplace', color: '#4ECDC4' },
                { v: 'x402', l: 'Native', color: '#FFD93D' },
                { v: 'USDC', l: 'Solana', color: '#6BCB77' },
              ].map(({ v, l, color }) => (
                <div key={l} className="px-3 py-2"
                  style={{ background: 'white', border: '2.5px solid #1A1A1A', borderRadius: 10, boxShadow: '3px 3px 0 #1A1A1A' }}>
                  <div className="text-xs font-mono font-black uppercase tracking-widest" style={{ color }}>{v}</div>
                  <div className="text-[8px] font-mono uppercase tracking-widest mt-0.5" style={{ color: '#9CA3AF' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live stat panel */}
          <div className="nb-card overflow-hidden">
            <div className="px-5 py-3" style={{ borderBottom: '2px solid #1A1A1A', background: '#1A1A1A' }}>
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em]" style={{ color: '#9CA3AF' }}>
                Farebox Platform
              </span>
            </div>
            {[
              { label: 'Callable models',    value: '36',          unit: 'across 14 providers' },
              { label: 'Payment protocol',   value: 'x402',        unit: 'alpha live · /.well-known/x402' },
              { label: 'MCP server',         value: 'Beta',        unit: 'farebox-mcp · npx farebox-mcp' },
              { label: 'Min cost per call',  value: '$0.000013',   unit: 'USDC  (llama-4-scout, 100 tokens)' },
              { label: 'Built-in skills',    value: '8',           unit: 'summarize · translate · code-review · more' },
              { label: 'Relay network',      value: 'Alpha',       unit: 'register a node · earn 80% margin' },
            ].map(({ label, value, unit }, i) => (
              <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-3"
                style={{ borderBottom: i < 5 ? '1px solid #1A1A1A12' : 'none' }}>
                <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{label}</span>
                <div className="text-right">
                  <span className="text-sm font-mono font-black" style={{ color: '#1A1A1A' }}>{value}</span>
                  <span className="text-[9px] font-mono ml-1.5" style={{ color: '#9CA3AF' }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Integration Paths ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-[9px] font-mono font-black uppercase tracking-[0.3em] mb-6" style={{ color: '#9CA3AF' }}>
          — 3 ways to integrate
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              badgeLabel: 'RECOMMENDED',
              badgeStyle: { background: '#7C3AED', color: 'white', border: '1.5px solid #1A1A1A', borderRadius: 6, boxShadow: '1.5px 1.5px 0 #1A1A1A' },
              title: 'MCP SERVER',
              desc: 'One config block in Claude Desktop, Cursor, or any MCP client. All 36 models + community skills appear as tools automatically — npx, no clone, no build.',
              cta: 'SET UP MCP',
              href: '#mcp',
              icon: Cpu,
              accentColor: '#7C3AED',
            },
            {
              badgeLabel: 'ANY LANGUAGE',
              badgeStyle: { background: '#74B9FF', color: '#1A1A1A', border: '1.5px solid #1A1A1A', borderRadius: 6, boxShadow: '1.5px 1.5px 0 #1A1A1A' },
              title: 'HTTP + x402',
              desc: 'Standard OpenAI-compatible HTTP. Call any model, catch the 402, sign the USDC micropayment with the x402 SDK, retry. Full OpenAPI spec available.',
              cta: 'SEE THE FLOW',
              href: '#x402',
              icon: Terminal,
              accentColor: '#74B9FF',
            },
            {
              badgeLabel: 'HIGH VOLUME',
              badgeStyle: { background: '#6BCB77', color: '#1A1A1A', border: '1.5px solid #1A1A1A', borderRadius: 6, boxShadow: '1.5px 1.5px 0 #1A1A1A' },
              title: 'API KEY',
              desc: 'Generate a prepaid API key with a daily spend cap. Best for production workloads where per-request signing overhead matters. 36 models, same endpoint.',
              cta: 'CREATE KEY',
              href: '/dashboard/keys',
              icon: Lock,
              accentColor: '#6BCB77',
            },
          ].map(({ badgeLabel, badgeStyle, title, desc, cta, href, icon: Icon, accentColor }) => (
            <div key={title} className="nb-card nb-card-hover p-6 flex flex-col">
              <div className="mb-4">
                <span className="text-[8px] font-mono font-black uppercase tracking-[0.25em] px-2 py-1" style={badgeStyle}>
                  {badgeLabel}
                </span>
              </div>
              <div className="w-10 h-10 flex items-center justify-center mb-4"
                style={{ background: accentColor + '22', border: `2px solid ${accentColor}`, borderRadius: 10 }}>
                <Icon className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <div className="font-black uppercase tracking-wide mb-3"
                style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 20, color: '#1A1A1A' }}>
                {title}
              </div>
              <p className="text-xs leading-relaxed flex-1 mb-6" style={{ color: '#6B7280' }}>{desc}</p>
              <a href={href}
                className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-widest"
                style={{ color: accentColor }}>
                {cta} <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── MCP Setup ───────────────────────────────────── */}
      <section id="mcp" style={{ borderTop: '2.5px solid #1A1A1A', background: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-[9px] font-mono font-black uppercase tracking-[0.3em] mb-2" style={{ color: '#7C3AED' }}>
            MCP Server
          </div>
          <h2 className="font-black uppercase mb-2 leading-none"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40, color: '#1A1A1A' }}>
            One block. 36 models + skills.
          </h2>
          <p className="text-sm mb-10" style={{ color: '#6B7280', maxWidth: 560 }}>
            Add this to <code className="font-mono text-xs px-1.5 py-0.5" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 4 }}>claude_desktop_config.json</code> (Claude Desktop)
            or <code className="font-mono text-xs px-1.5 py-0.5" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 4 }}>~/.cursor/mcp.json</code> (Cursor) and restart.
            All models appear as tools automatically.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-3" style={{ color: '#374151' }}>
                With API key (recommended for production)
              </div>
              <CodeBlock code={MCP_CONFIG} label="claude_desktop_config.json / mcp.json" />
              <div className="mt-3 text-[10px] font-mono" style={{ color: '#6B7280' }}>
                Or run directly:{' '}
                <code className="font-mono px-1.5 py-0.5 text-[10px]" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 4 }}>
                  FAREBOX_API_KEY=sk-fbx-... npx -y farebox-mcp
                </code>
              </div>
            </div>

            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-3" style={{ color: '#374151' }}>
                x402 keyless mode (wallet pays per call)
              </div>
              <CodeBlock code={MCP_X402_CONFIG} label="claude_desktop_config.json / mcp.json" />
              <div className="mt-3 text-[10px] font-mono" style={{ color: '#6B7280' }}>
                Omit both keys for preview mode — tools return 402 payment requirements only.
              </div>
            </div>
          </div>

          {/* Security + notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="nb-card-sm px-5 py-4">
              <div className="text-[9px] font-mono font-black uppercase tracking-widest mb-2" style={{ color: '#1A1A1A' }}>
                🔒 Security
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                Your private key <em>never</em> leaves your machine. It only signs x402 USDC micropayments locally.
                Fund a dedicated agent wallet with a small USDC balance — never your main wallet.
              </p>
            </div>
            <div className="nb-card-sm px-5 py-4">
              <div className="text-[9px] font-mono font-black uppercase tracking-widest mb-2" style={{ color: '#1A1A1A' }}>
                ⚡ Preview Mode
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                Run farebox-mcp with no key at all — tools still load and return the 402 payment
                requirement instead of data. Explore the full model catalog before funding a wallet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6 flex-wrap">
            <a href="https://www.npmjs.com/package/farebox-mcp" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors hover:text-primary"
              style={{ color: '#6B7280' }}>
              farebox-mcp on NPM <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://api.farebox.fun/openapi.json" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors hover:text-primary"
              style={{ color: '#6B7280' }}>
              OpenAPI Spec <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Models Catalog ──────────────────────────────── */}
      <section id="catalog" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: '#7C3AED' }}>
              Native Skills
            </div>
            <h2 className="font-black uppercase leading-none"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, color: '#1A1A1A' }}>
              36 frontier models as callable tools
            </h2>
          </div>
          <Link href="/models"
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors hover:text-primary shrink-0"
            style={{ color: '#6B7280' }}>
            View all 36 models <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Table */}
        <div className="nb-card overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr style={{ background: '#1A1A1A', color: 'white' }}>
                {['Skill / Model ID', 'Provider', 'Capabilities', 'In /1M', 'Out /1M', 'Ctx'].map(h => (
                  <th key={h} className="px-5 py-3 text-[8px] font-bold uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleModels.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: i < visibleModels.length - 1 ? '1px solid #1A1A1A12' : 'none', background: i % 2 === 0 ? 'white' : '#FFFBEF' }}>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] font-black" style={{ color: '#1A1A1A' }}>{m.name}</code>
                      {m.badge && (
                        <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5"
                          style={{ background: '#FFD93D', color: '#1A1A1A', border: '1px solid #1A1A1A', borderRadius: 4, boxShadow: '1px 1px 0 #1A1A1A' }}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-[10px]" style={{ color: '#6B7280' }}>{m.provider}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.tags.map(t => <Tag key={t} label={t} />)}
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap tabular-nums" style={{ color: '#374151' }}>{m.priceIn}</td>
                  <td className="px-5 py-3 whitespace-nowrap font-black tabular-nums" style={{ color: '#1A1A1A' }}>{m.priceOut}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-[10px]" style={{ color: '#9CA3AF' }}>{m.ctx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!showAllModels && (
          <button
            onClick={() => setShowAllModels(true)}
            className="nb-btn nb-btn-outline nb-btn-sm mt-4">
            Show remaining {NATIVE_MODELS.length - 8} models <ChevronRight className="w-3 h-3" />
          </button>
        )}

        <p className="mt-4 text-[10px] font-mono" style={{ color: '#9CA3AF' }}>
          Prices are USD per 1M tokens including Farebox's 15% transparent markup. Farebox billed = Provider cost × 1.15. Minimum call cost ≈ $0.000013.
        </p>
      </section>

      {/* ── Built-in Skills Marketplace ────────────────── */}
      <section style={{ borderTop: '2.5px solid #1A1A1A', borderBottom: '2.5px solid #1A1A1A', background: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-4 flex-wrap gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: '#7C3AED' }}>
                Built-in Skills · Open Marketplace
              </div>
              <h2 className="font-black uppercase leading-none"
                style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, color: '#1A1A1A' }}>
                Any tool. Any builder. One protocol.
              </h2>
            </div>
            <span className="flex items-center gap-1.5 text-[8px] font-mono font-black uppercase tracking-widest px-3 py-1.5 nb-badge"
              style={{ background: '#4ADE8020', color: '#065F46', borderColor: '#4ADE80' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ADE80' }} />
              Beta · {liveSkills.length > 0 ? liveSkills.length : 8} Skills Live
            </span>
          </div>

          <p className="text-sm mb-10 leading-relaxed" style={{ color: '#6B7280', maxWidth: 560 }}>
            Call any built-in skill over REST or MCP — pass <code className="font-mono text-xs px-1.5 py-0.5" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 4 }}>input</code> text,
            get structured AI output. Bills per token. Community marketplace opens to publishers in Q3 2026.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {liveSkills.map((skill) => {
              const Icon = SKILL_ICONS[skill.id] || Zap;
              return (
                <div key={skill.id} className="nb-card nb-card-hover p-5 relative overflow-hidden">
                  {/* LIVE badge */}
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 text-[7px] font-mono font-black uppercase tracking-widest px-2 py-0.5"
                      style={{ background: '#4ADE8020', color: '#065F46', border: '1.5px solid #4ADE80', borderRadius: 6, boxShadow: '1.5px 1.5px 0 #065F46' }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: '#4ADE80' }} /> LIVE
                    </span>
                  </div>

                  <div className="w-8 h-8 flex items-center justify-center mb-3"
                    style={{ background: '#7C3AED22', border: '2px solid #7C3AED', borderRadius: 8 }}>
                    <Icon className="w-4 h-4" style={{ color: '#7C3AED' }} />
                  </div>

                  <code className="text-[11px] font-mono font-black block mb-1" style={{ color: '#1A1A1A' }}>
                    /v1/skills/{skill.id}/call
                  </code>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="nb-tag" style={{ color: '#6B7280' }}>{skill.category}</span>
                    <span className="text-[8px] font-mono" style={{ color: '#9CA3AF' }}>via {skill.defaultModel}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed mb-4" style={{ color: '#6B7280' }}>{skill.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-black" style={{ color: '#1A1A1A' }}>×{skill.priceMultiplier}</span>
                      <span className="text-[9px] font-mono ml-1" style={{ color: '#9CA3AF' }}>model rate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setTrySkill(skill); setTryInput(''); setTryResult(''); setTryError(''); }}
                        className="nb-tag"
                        style={{ background: '#7C3AED18', color: '#7C3AED', borderColor: '#7C3AED50', cursor: 'pointer', padding: '3px 10px' }}
                      >
                        Try <Zap className="w-3 h-3 inline ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {liveSkills.length === 0 && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="nb-card p-5 animate-pulse">
                <div className="w-8 h-8 rounded-lg mb-3" style={{ background: '#1A1A1A10' }} />
                <div className="h-3 rounded mb-2" style={{ background: '#1A1A1A10', width: '60%' }} />
                <div className="h-2 rounded mb-1" style={{ background: '#1A1A1A08', width: '80%' }} />
                <div className="h-2 rounded" style={{ background: '#1A1A1A08', width: '50%' }} />
              </div>
            ))}
          </div>

          {/* Publish CTA */}
          <div className="nb-card p-6 flex items-center justify-between flex-wrap gap-4" style={{ background: '#FFFBEF' }}>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: '#7C3AED' }}>
                Publish Your Skill
              </div>
              <div className="font-black uppercase text-lg" style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
                Got a useful AI tool? Put it on the marketplace. Earn 80% per call.
              </div>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Submit your OpenAPI spec + pricing → Farebox wraps it in x402 + MCP → goes live in 24h.
              </p>
            </div>
            <button onClick={() => setShowSubmitModal(true)} className="nb-btn nb-btn-primary">
              Submit a Skill <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── HTTP + x402 Flow ────────────────────────────── */}
      <section id="x402" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: '#74B9FF' }}>
          HTTP + x402
        </div>
        <h2 className="font-black uppercase mb-2 leading-none"
          style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, color: '#1A1A1A' }}>
          Any language. No account. Pure machine payments.
        </h2>
        <p className="text-sm mb-10" style={{ color: '#6B7280', maxWidth: 520 }}>
          Every endpoint on <code className="font-mono text-xs px-1.5 py-0.5" style={{ background: '#1A1A1A', color: '#E5E7EB', borderRadius: 4 }}>api.farebox.fun/v1</code> accepts x402.
          The 402 response carries payment requirements — any x402 client library signs and retries automatically.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CodeBlock code={CURL_EXAMPLE} label="TERMINAL" lang="bash" />

          <div className="space-y-3">
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] mb-4" style={{ color: '#374151' }}>
              How payment works
            </div>
            {PAYMENT_STEPS.map(({ n, title, body }) => (
              <div key={n} className="flex gap-4 p-4 nb-card-sm">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center font-black text-xs"
                  style={{ background: '#7C3AED', color: 'white', fontFamily: 'monospace', borderRadius: 8, border: '2px solid #1A1A1A', boxShadow: '2px 2px 0 #1A1A1A', flexShrink: 0 }}>
                  {n.slice(1)}
                </div>
                <div>
                  <div className="font-black text-xs uppercase tracking-wide mb-1"
                    style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
                    {title}
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 pt-2">
              <a href="https://github.com/coinbase/x402" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest hover:text-primary transition-colors"
                style={{ color: '#6B7280' }}>
                x402 SDK on GitHub <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://api.farebox.fun/openapi.json" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest hover:text-primary transition-colors"
                style={{ color: '#6B7280' }}>
                OpenAPI Spec <ExternalLink className="w-3 h-3" />
              </a>
              <Link href="/playground"
                className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest hover:text-primary transition-colors"
                style={{ color: '#6B7280' }}>
                Try in Playground <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Earn ────────────────────────────────────────── */}
      <section style={{ borderTop: '2.5px solid #1A1A1A', background: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: '#6BCB77' }}>
            Earn with Farebox
          </div>
          <h2 className="font-black uppercase mb-2 leading-none"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40, color: '#1A1A1A' }}>
            3 ways to earn USDC<br />from the agent economy
          </h2>
          <p className="text-sm mb-12" style={{ color: '#6B7280', maxWidth: 520 }}>
            Farebox is a protocol. You can extract value from it as a publisher, as an operator,
            or as an affiliate — all paid in USDC, weekly, to your Solana wallet.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {EARN_PATHS.map(({ icon: Icon, title, badge, pct, label, desc, steps, accentColor }) => (
              <div key={title} className="nb-card overflow-hidden">
                {/* Colored accent top bar */}
                <div style={{ height: 6, background: accentColor }} />
                {/* Header */}
                <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '2px solid #1A1A1A' }}>
                  <div className="w-9 h-9 flex items-center justify-center"
                    style={{ background: accentColor + '22', border: `2px solid ${accentColor}`, borderRadius: 8 }}>
                    <Icon className="w-4 h-4" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <div className="font-black uppercase text-sm tracking-wide"
                      style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
                      {title}
                    </div>
                    <span className="text-[7px] font-mono uppercase tracking-widest"
                      style={{ color: badge === 'OPEN' ? '#6BCB77' : '#FF9F43' }}>
                      {badge}
                    </span>
                  </div>
                </div>

                {/* Big % */}
                <div className="px-5 py-4" style={{ borderBottom: '2px solid #1A1A1A', background: accentColor + '12' }}>
                  <span className="font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 48, color: accentColor }}>
                    {pct}
                  </span>
                  <div className="text-[9px] font-mono uppercase tracking-widest mt-0.5" style={{ color: '#9CA3AF' }}>
                    {label}
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <p className="text-[10px] leading-relaxed mb-4" style={{ color: '#6B7280' }}>{desc}</p>
                  <ul className="space-y-1.5">
                    {steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="shrink-0 w-4 h-4 mt-0.5 flex items-center justify-center text-[8px] font-black"
                          style={{ background: accentColor, color: 'white', borderRadius: 4, border: '1.5px solid #1A1A1A' }}>
                          {i + 1}
                        </span>
                        <span className="text-[10px] leading-relaxed" style={{ color: '#374151' }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue split visual */}
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] mb-4" style={{ color: '#374151' }}>
              Where the money goes — Skill Publisher model
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { pct: '80%', label: 'To the Publisher', sub: 'you, the skill author', bg: '#7C3AED', textColor: 'white' },
                { pct: '15%', label: 'Farebox Protocol', sub: 'routing, infra, security', bg: 'white', textColor: '#1A1A1A' },
                { pct: '5%',  label: 'Buyback & Burn', sub: 'deflationary mechanic', bg: 'white', textColor: '#1A1A1A' },
              ].map(({ pct, label, sub, bg, textColor }) => (
                <div key={label} className="nb-card px-6 py-5"
                  style={{ background: bg, borderColor: '#1A1A1A' }}>
                  <div className="font-black mb-1"
                    style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 44, color: textColor }}>
                    {pct}
                  </div>
                  <div className="font-black uppercase text-xs tracking-wide mb-0.5"
                    style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: textColor === 'white' ? 'rgba(255,255,255,0.9)' : '#374151' }}>
                    {label}
                  </div>
                  <div className="text-[9px] font-mono"
                    style={{ color: textColor === 'white' ? 'rgba(255,255,255,0.6)' : '#9CA3AF' }}>
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How to Publish a Skill ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: '#7C3AED' }}>
          Publish a Skill
        </div>
        <h2 className="font-black uppercase mb-2 leading-none"
          style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, color: '#1A1A1A' }}>
          Your API → Farebox skill → earn per call
        </h2>
        <p className="text-sm mb-10" style={{ color: '#6B7280', maxWidth: 520 }}>
          Build any HTTP endpoint. Submit a minimal spec. Farebox handles x402 wrapping, MCP registration,
          rate limiting, billing, and weekly USDC payouts — you just serve the data.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CodeBlock code={PUBLISH_SPEC} label="skill-spec.json / OpenAPI fragment" lang="json" />
          <div className="space-y-4">
            {[
              { n: '01', title: 'Build your endpoint', body: 'Any language, any cloud. Your endpoint receives a JSON body and returns JSON. Stateless. One thing, done well.' },
              { n: '02', title: 'Submit skill spec', body: 'Send us your OpenAPI fragment + pricing ($0.001–$0.100/call recommended). Review takes < 24h. We check for safety and quality.' },
              { n: '03', title: 'Farebox wraps it', body: 'We deploy an x402 payment proxy in front of your endpoint, register it as an MCP tool in farebox-mcp, and add it to the catalog.' },
              { n: '04', title: 'Agents discover + pay', body: 'Any agent using farebox-mcp or the HTTP API can call your skill. USDC flows from their wallet to yours — 80% cut, no middleman invoice.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="nb-card-sm flex gap-4 p-4">
                <div className="shrink-0 font-black text-2xl leading-none mt-1"
                  style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#7C3AED' }}>
                  {n}
                </div>
                <div>
                  <div className="font-black uppercase text-sm mb-1"
                    style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
                    {title}
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ecosystem / Collaboration ───────────────────── */}
      <section style={{ borderTop: '2.5px solid #1A1A1A', background: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: '#7C3AED' }}>
            Ecosystem
          </div>
          <h2 className="font-black uppercase mb-2 leading-none"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 40, color: '#1A1A1A' }}>
            Built to collaborate<br />with the biggest builders
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: '#6B7280', maxWidth: 560 }}>
            Farebox is a protocol layer — not a walled garden. DeFi data providers, GPU networks,
            oracle protocols, and AI frameworks can integrate as skill publishers or leverage Farebox
            as their LLM payment infrastructure. We actively pursue partnerships and co-incentives.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {COLLAB_TARGETS.map(({ name, domain, desc }) => (
              <div key={name} className="nb-card nb-card-hover p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-black uppercase text-sm"
                    style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
                    {name}
                  </div>
                  <span className="shrink-0 nb-tag" style={{ color: '#7C3AED', background: '#7C3AED18', borderColor: '#7C3AED50' }}>
                    {domain}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: '#6B7280' }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap gap-4">
            <a href="mailto:partnerships@farebox.fun" className="nb-btn nb-btn-black">
              Partner with Farebox <ArrowRight className="w-4 h-4" />
            </a>
            <button onClick={() => setShowSubmitModal(true)} className="nb-btn nb-btn-outline">
              Submit Your Skill <Code2 className="w-4 h-4" />
            </button>
            <Link href="/about#roadmap" className="nb-btn nb-btn-outline">
              View Roadmap <BookOpen className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
