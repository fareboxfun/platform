import React from 'react';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import { Shield, Lock, Eye, AlertTriangle, Key, Database } from 'lucide-react';

const BORDER = '2.5px solid #1A1A1A';
const SHADOW = '4px 4px 0 #1A1A1A';
const PURPLE = '#7C3AED';
const CREAM  = '#FFFBEF';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>{title}</h2>
        <div className="flex-1 h-[2.5px]" style={{ background: '#1A1A1A' }} />
      </div>
      {children}
    </section>
  );
}

export default function SecurityPage() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
      <TopNav />
      <div className="pt-14">

        {/* Hero */}
        <div className="px-4 sm:px-8 py-10 sm:py-16" style={{ borderBottom: BORDER }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4" style={{ color: PURPLE }}>
              — Security
            </div>
            <h1 className="uppercase leading-none mb-4"
              style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(28px, 8vw, 100px)', letterSpacing: '-0.02em' }}>
              Security
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: '#6B7280' }}>
              How Farebox protects your keys, funds, and data. We operate on a zero-trust, append-only ledger model with on-chain settlement.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-10 sm:space-y-14">

          {/* Practices grid */}
          <Section title="Security Practices">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  icon: <Key className="w-5 h-5" />,
                  title: 'API Key Hashing',
                  body: 'API keys are stored as bcrypt hashes with a random salt. The raw key is only shown once at creation time and never stored. Comparison is constant-time to prevent timing attacks.',
                },
                {
                  icon: <Lock className="w-5 h-5" />,
                  title: 'TLS Everywhere',
                  body: 'All traffic between clients, the Farebox gateway, and upstream providers is encrypted with TLS 1.3. No plaintext connections are accepted.',
                },
                {
                  icon: <Database className="w-5 h-5" />,
                  title: 'Append-Only Ledger',
                  body: "Credit balances are computed from an append-only ledger table. No row is ever updated or deleted — corrections are new adjustment entries. Balance = SUM(ledger) at all times.",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  title: 'Double-Spend Protection',
                  body: 'Every on-chain USDC deposit is indexed by its unique Solana transaction signature. The same tx_signature cannot credit a balance twice — enforced at the DB level.',
                },
                {
                  icon: <Eye className="w-5 h-5" />,
                  title: 'No Private Key Custody',
                  body: "Farebox never holds your Solana private key. In the x402 lane, signing happens in your client. In the dashboard, you push funds from your own wallet.",
                },
                {
                  icon: <AlertTriangle className="w-5 h-5" />,
                  title: 'Pre-flight Balance Check',
                  body: 'Every request is rejected with 402 if your balance is below the estimated max cost before the provider is ever called. Negative balances are structurally impossible.',
                },
              ].map(({ icon, title, body }) => (
                <div key={title} style={{ border: BORDER, borderRadius: 12, boxShadow: '3px 3px 0 #1A1A1A', background: '#FFFFFF', padding: '20px' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{ color: PURPLE }}>{icon}</div>
                    <div className="font-black uppercase text-sm" style={{ fontFamily: "'Archivo Black', sans-serif" }}>{title}</div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Responsible disclosure */}
          <Section title="Responsible Disclosure">
            <div style={{ border: BORDER, borderRadius: 12, boxShadow: SHADOW, background: '#FFFFFF', padding: '28px 32px' }}>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>
                If you discover a security vulnerability in Farebox, please report it to us before disclosing it publicly. We take all security reports seriously and will respond within 72 hours.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  ['Contact',  'security@farebox.fun'],
                  ['PGP Key',  'Available on request'],
                  ['Scope',    'api.farebox.fun, farebox.fun, farebox-mcp npm package'],
                  ['Response', 'Acknowledgment within 72 hours, fix timeline within 14 days for critical issues'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 items-start text-sm">
                    <span className="font-mono font-bold shrink-0 w-24" style={{ color: PURPLE }}>{k}</span>
                    <span style={{ color: '#6B7280' }}>{v}</span>
                  </div>
                ))}
              </div>
              <a href="mailto:security@farebox.fun"
                className="nb-btn nb-btn-primary inline-flex">
                Report a Vulnerability →
              </a>
            </div>
          </Section>

          {/* Out of scope */}
          <Section title="Out of Scope">
            <div style={{ border: BORDER, borderRadius: 10, boxShadow: '2px 2px 0 #1A1A1A', background: '#FFFFFF', padding: '20px 24px' }}>
              <ul className="space-y-2 text-sm" style={{ color: '#6B7280' }}>
                {[
                  'Rate limiting and DoS attacks against public endpoints',
                  'Issues requiring physical access to our infrastructure',
                  'Social engineering attacks against Farebox employees',
                  'Vulnerabilities in third-party providers (OpenAI, Anthropic, etc.)',
                  'Self-XSS or issues that require the victim to be an attacker',
                ].map(item => (
                  <li key={item} className="flex gap-2 items-start">
                    <span className="font-mono shrink-0" style={{ color: '#D1D5DB' }}>×</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* Audit status */}
          <Section title="Audit Status">
            <div className="flex gap-4 flex-wrap">
              {[
                { item: 'Smart Contracts',   status: 'N/A — no on-chain contracts used',  color: '#9CA3AF' },
                { item: 'API Server',         status: 'Internal audit — Q3 2026 target',   color: '#F59E0B' },
                { item: 'Dependency Audit',   status: 'Ongoing via pnpm audit',            color: '#22C55E' },
              ].map(({ item, status, color }) => (
                <div key={item} style={{ border: BORDER, borderRadius: 8, boxShadow: '2px 2px 0 #1A1A1A', background: '#FFFFFF', padding: '14px 18px', flex: '1 1 200px' }}>
                  <div className="text-xs font-black uppercase mb-1" style={{ fontFamily: "'Archivo Black', sans-serif" }}>{item}</div>
                  <div className="text-[11px] font-mono" style={{ color }}>{status}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Footer />
      </div>
    </div>
  );
}
