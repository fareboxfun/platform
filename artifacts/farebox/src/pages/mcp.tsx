import React, { useState } from 'react';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import { Copy, Check, Terminal, Zap, Globe, Lock, Cpu } from 'lucide-react';

const BORDER = '2.5px solid #1A1A1A';
const SHADOW = '4px 4px 0 #1A1A1A';
const PURPLE = '#7C3AED';
const YELLOW = '#FFD93D';
const CREAM  = '#FFFBEF';

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

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const { copied, copy } = useCopy(code);
  return (
    <div style={{ background: '#1A1A1A', border: BORDER, borderRadius: 12, boxShadow: SHADOW, overflow: 'hidden' }}>
      {label && (
        <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #ffffff12' }}>
          <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#9CA3AF' }}>{label}</span>
          <button onClick={copy} className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest"
            style={{ color: copied ? PURPLE : '#6B7280' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="px-5 py-4 overflow-x-auto text-xs leading-relaxed"
        style={{ fontFamily: "'Space Mono', monospace", color: '#D1FAE5' }}>{code}</pre>
    </div>
  );
}

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "farebox": {
      "command": "npx",
      "args": ["-y", "farebox-mcp"],
      "env": {
        "FAREBOX_API_KEY": "fb_live_your_key_here"
      }
    }
  }
}`;

const CURSOR_CONFIG = `// .cursor/mcp.json
{
  "mcpServers": {
    "farebox": {
      "command": "npx",
      "args": ["-y", "farebox-mcp"],
      "env": {
        "FAREBOX_API_KEY": "fb_live_your_key_here"
      }
    }
  }
}`;

const TOOLS = [
  { name: 'farebox_chat',       desc: 'Send a chat completion request to any model via Farebox. Supports streaming.', tag: 'LLM' },
  { name: 'farebox_list_models',desc: 'List all available models with pricing and provider info.',                    tag: 'Catalog' },
  { name: 'farebox_get_balance', desc: 'Check current USDC credit balance on the active API key.',                   tag: 'Billing' },
  { name: 'farebox_get_usage',   desc: 'Retrieve token usage and cost breakdown for recent requests.',               tag: 'Analytics' },
  { name: 'farebox_call_skill',  desc: 'Call a community skill from the marketplace. Billed per call.',             tag: 'Marketplace' },
];

export default function McpPage() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
      <TopNav />
      <div className="pt-14">

        {/* Hero */}
        <div className="px-4 sm:px-8 py-10 sm:py-16" style={{ borderBottom: BORDER }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4" style={{ color: PURPLE }}>
              — Model Context Protocol
            </div>
            <h1 className="uppercase leading-none mb-4"
              style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(28px, 7vw, 96px)', letterSpacing: '-0.02em' }}>
              MCP Server
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: '#6B7280' }}>
              Connect Claude Desktop, Cursor, or any MCP-compatible agent to all 36+ Farebox models and marketplace skills in two config lines. Payments happen automatically in USDC.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">

          {/* How it works */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>
                How It Works
              </h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Terminal className="w-5 h-5" />, step: '01', title: 'Install', body: 'Add farebox-mcp via npx — no global install needed. Runs directly from the npm registry.' },
                { icon: <Lock className="w-5 h-5" />,     step: '02', title: 'Authenticate', body: 'Set your FAREBOX_API_KEY in the MCP config env block.' },
                { icon: <Globe className="w-5 h-5" />,    step: '03', title: 'Connect', body: 'Claude Desktop or Cursor detects the server on next launch.' },
                { icon: <Zap className="w-5 h-5" />,      step: '04', title: 'Run & Pay', body: 'Every model call is billed per token in USDC. No invoices.' },
              ].map(({ icon, step, title, body }) => (
                <div key={step} style={{ border: BORDER, borderRadius: 12, boxShadow: '3px 3px 0 #1A1A1A', background: '#FFFFFF', padding: '20px' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div style={{ color: PURPLE }}>{icon}</div>
                    <span className="text-[9px] font-mono font-bold" style={{ color: '#D1D5DB' }}>{step}</span>
                  </div>
                  <div className="font-black uppercase text-sm mb-1" style={{ fontFamily: "'Archivo Black', sans-serif" }}>{title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Claude Desktop */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>
                Claude Desktop
              </h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              Edit <code className="font-mono text-xs px-1.5 py-0.5 rounded-sm" style={{ background: '#1A1A1A', color: '#FFD93D' }}>~/Library/Application Support/Claude/claude_desktop_config.json</code> on macOS or the equivalent on Windows.
            </p>
            <CodeBlock code={CLAUDE_CONFIG} label="claude_desktop_config.json" />
          </section>

          {/* Cursor */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>
                Cursor
              </h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <CodeBlock code={CURSOR_CONFIG} label=".cursor/mcp.json" />
          </section>

          {/* Available tools */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>
                Available Tools
              </h2>
              <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
            </div>
            <div style={{ border: BORDER, borderRadius: 12, boxShadow: SHADOW, background: '#FFFFFF', overflow: 'hidden' }}>
              {TOOLS.map((t, i) => (
                <div key={t.name} className="flex items-start gap-4 px-6 py-4"
                  style={{ borderBottom: i < TOOLS.length - 1 ? '2px solid #F3F4F6' : 'none' }}>
                  <div className="shrink-0">
                    <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5"
                      style={{ background: `${PURPLE}15`, color: PURPLE, border: `1.5px solid ${PURPLE}40`, borderRadius: 6 }}>
                      {t.tag}
                    </span>
                  </div>
                  <div>
                    <code className="text-sm font-mono font-bold block mb-1" style={{ color: '#1A1A1A' }}>{t.name}</code>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="nb-card p-8 flex items-center justify-between flex-wrap gap-4" style={{ background: '#1A1A1A' }}>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] mb-2" style={{ color: YELLOW }}>Get started in 60 seconds</div>
              <div className="font-black uppercase text-xl" style={{ fontFamily: "'Archivo Black', sans-serif", color: 'white' }}>
                Get your API key and start calling models.
              </div>
            </div>
            <a href="/dashboard" className="nb-btn nb-btn-primary">Get API Key →</a>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
