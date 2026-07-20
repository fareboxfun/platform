import React from 'react';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';
import { Link } from 'wouter';
import { Logo } from '../components/logo';

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-10 sm:py-16 px-4 sm:px-8" style={{ borderBottom: '2.5px solid #1A1A1A' }}>
      {children}
    </section>
  );
}

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: '#FFFBEF', fontFamily: "'Space Grotesk', sans-serif" }}>
      <TopNav />
      <div className="pt-14">
        {/* Hero */}
        <div className="px-4 sm:px-8 py-10 sm:py-20" style={{ borderBottom: '2.5px solid #1A1A1A' }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#7C3AED' }}>About Farebox</div>
              <h1 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(32px, 8vw, 100px)', color: '#1A1A1A' }}>
                Every Request<br /><span style={{ color: '#7C3AED' }}>Pays Its Fare.</span>
              </h1>
              <p className="text-lg leading-relaxed max-w-xl" style={{ color: '#374151' }}>
                Farebox is a crypto-native LLM gateway with USDC-powered prepaid billing on Solana. One API key, every major AI model, metering you can actually audit.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              {/* NB-style logo box */}
              <div className="relative w-64 h-64 nb-card flex items-center justify-center"
                style={{ background: '#FFFBEF' }}>
                {/* Corner accents */}
                <span className="absolute top-3 left-3 w-5 h-5" style={{ background: '#7C3AED', borderRadius: 4 }} />
                <span className="absolute top-3 right-3 w-5 h-5" style={{ background: '#FFD93D', borderRadius: 4 }} />
                <span className="absolute bottom-3 left-3 w-5 h-5" style={{ background: '#4ECDC4', borderRadius: 4 }} />
                <span className="absolute bottom-3 right-3 w-5 h-5" style={{ background: '#FF6B6B', borderRadius: 4 }} />
                <Logo size={80} wordmark={false} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* The Problem */}
          <Section>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>The Problem</div>
            <h2 className="uppercase leading-none mb-10" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>Why Farebox Exists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: 'Multiple provider hell', body: 'Teams using multiple AI models juggle multiple provider accounts, keys, invoices, and dashboards. There\'s no unified view.', color: '#FF6B6B' },
                { title: 'Credit-card-first assumption', body: 'Paying for AI APIs assumes a human with a credit card. Millions of global developers and every autonomous agent don\'t fit that model.', color: '#FFD93D' },
                { title: 'Agents can\'t pay', body: 'AI agents are becoming API customers themselves, but they cannot sign up, pass KYC, or hold a card. They need machine-native payment rails.', color: '#4ECDC4' },
                { title: 'Trust deficit', body: 'Other crypto-native gateways ask users to paste raw wallet private keys into config files. Farebox never touches your private key.', color: '#7C3AED' },
              ].map(({ title, body, color }) => (
                <div key={title} className="nb-card p-6" style={{ background: 'white' }}>
                  <div className="w-8 h-8 flex items-center justify-center mb-4"
                    style={{ background: color + '22', border: `2.5px solid ${color}`, borderRadius: 10, boxShadow: `3px 3px 0 ${color}` }}>
                    <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-wide mb-2" style={{ color: '#1A1A1A' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* The Solution */}
          <Section>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>The Solution</div>
            <h2 className="uppercase leading-none mb-6" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>What We Built</h2>
            <p className="text-base mb-10 max-w-2xl leading-relaxed" style={{ color: '#374151' }}>A single OpenAI-compatible endpoint that routes to all major providers, meters every token from the provider's own usage payload, and bills a prepaid USDC ledger on Solana.</p>
            <div className="space-y-3">
              {[
                'Routes requests to Anthropic, OpenAI, Google, xAI, Groq, and open-source hosts.',
                'Meters every request from the provider\'s own usage payload, not our estimate.',
                'Charges a prepaid credit ledger funded with USDC on Solana (instant, final, borderless).',
                'Offers keyless pay-per-call via x402 for autonomous agents.',
                'Exposes everything on a transparent dashboard and a Usage API you can query programmatically.',
              ].map((s, i) => (
                <div key={s} className="flex gap-3 items-start text-sm nb-card-sm px-4 py-3" style={{ background: 'white' }}>
                  <span className="w-6 h-6 text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: '#6BCB77', border: '2px solid #1A1A1A', borderRadius: 6, boxShadow: '2px 2px 0 #1A1A1A' }}>
                    ✓
                  </span>
                  <span style={{ color: '#374151' }}>{s}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Target Users */}
          <Section>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>Audience</div>
            <h2 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>Who It's For</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm nb-card overflow-hidden">
                <thead>
                  <tr style={{ background: '#1A1A1A', color: 'white' }}>
                    <th className="text-left px-5 py-3 text-[10px] font-mono font-black uppercase tracking-widest">Segment</th>
                    <th className="text-left px-5 py-3 text-[10px] font-mono font-black uppercase tracking-widest">Need</th>
                    <th className="text-left px-5 py-3 text-[10px] font-mono font-black uppercase tracking-widest">Entry Point</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Global developers', 'One key, many models, pay in stablecoins', 'API + USDC top-up'],
                    ['Indie hackers & startups', 'Cost control, no per-provider billing overhead', 'API + Dashboard'],
                    ['Crypto-native users', 'AI access funded straight from a wallet', 'Chat Playground'],
                    ['AI agents / agent builders', 'Pay-per-call without an account', 'x402 lane + MCP server'],
                  ].map(([seg, need, entry], i) => (
                    <tr key={seg} style={{ borderBottom: i < 3 ? '1px solid #1A1A1A12' : 'none', background: i % 2 === 0 ? 'white' : '#FFFBEF' }}>
                      <td className="px-5 py-3 font-bold" style={{ color: '#1A1A1A' }}>{seg}</td>
                      <td className="px-5 py-3" style={{ color: '#6B7280' }}>{need}</td>
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: '#7C3AED' }}>{entry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Principles */}
          <Section>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>Core Values</div>
            <h2 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>Product Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Prepaid Only', body: 'Farebox never fronts provider costs for users. The ledger can never go negative by design.', color: '#7C3AED' },
                { title: 'Never Touch Private Keys', body: 'Humans sign in with wallet signatures. Agents use revocable API keys. Your private key never leaves your wallet.', color: '#FF6B6B' },
                { title: 'Meter Honestly', body: 'Usage numbers come from provider usage payloads and are exportable and auditable by the user.', color: '#4ECDC4' },
                { title: 'Privacy by Default', body: 'Prompt and response bodies are never stored. Only metadata: model, tokens, timestamps, cost.', color: '#FFD93D' },
                { title: 'Boringly Reliable Money', body: 'The ledger is append-only and idempotent. Billing bugs are treated as sev-1 incidents.', color: '#6BCB77' },
                { title: 'Honesty Over Cleverness', body: 'Never silently swap model families. Surface provider errors with the provider name. No hidden magic.', color: '#FF9F43' },
              ].map(({ title, body, color }, i) => (
                <div key={title} className="nb-card p-5 relative" style={{ background: 'white' }}>
                  {/* Colored accent top bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: color, borderRadius: '12px 12px 0 0' }} />
                  <span className="absolute top-4 right-4 text-[10px] font-mono font-black" style={{ color: '#1A1A1A30' }}>0{i + 1}</span>
                  <h3 className="text-sm font-black uppercase tracking-wide mb-3 mt-3 pr-6" style={{ color: '#1A1A1A' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Positioning */}
          <Section>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>Market</div>
            <h2 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>Positioning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="nb-card p-6" style={{ background: 'white' }}>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>vs. Traditional Gateways</div>
                <div className="text-sm font-bold mb-2 uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>(OpenRouter, LiteLLM Cloud)</div>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>Same core mechanics, but wallet-native onboarding, USDC settlement on Solana, and a first-class keyless agent lane. No credit card required.</p>
              </div>
              <div className="nb-card p-6" style={{ background: 'white' }}>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>vs. Other Crypto Gateways</div>
                <div className="text-sm font-bold mb-2 uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>(Various)</div>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>Farebox competes on trust: signature-based login only, private keys never exposed, an append-only auditable ledger, and honest exportable metering.</p>
              </div>
            </div>
          </Section>

          {/* Roadmap */}
          <Section id="roadmap">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>Timeline</div>
            <h2 className="uppercase leading-none mb-10" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>Roadmap</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  phase: 'Phase 1: MVP', timeline: '4–6 wks',
                  items: ['Gateway (3–4 flagship models)', 'SIWS login', 'API Keys', 'Prepaid USDC ledger', 'USDC top-ups on Solana', 'Basic dashboard (usage by model, balance)', 'Daily reconciliation job', 'Docs + quickstart'],
                  exit: '100 external users. Connect wallet → first call < 3 min. Reconciliation drift < 1%.',
                  active: true,
                  color: '#7C3AED',
                },
                {
                  phase: 'Phase 2: Trust & Breadth', timeline: 'Post-MVP',
                  items: ['Budget guardrails', 'Fallback routing', 'More models + embeddings', 'Chat Playground (compare mode)', 'x402 agent lane', 'MCP server', 'CSV export', 'Usage API + webhooks', 'CLI'],
                  exit: 'Paying retention > 40% M1. Agent-lane traffic measurable.',
                  active: false,
                  color: '#4ECDC4',
                },
                {
                  phase: 'Phase 3: Scale', timeline: 'Later',
                  items: ['Team / org accounts', 'USDC withdrawal', 'Fiat on-ramp partner', 'Agentic chat tools', 'Token ($FBOX), with legal counsel'],
                  exit: 'Meaningful third-party API share of traffic. Unit economics positive.',
                  active: false,
                  color: '#FF9F43',
                },
              ].map(p => (
                <div key={p.phase} className="nb-card overflow-hidden"
                  style={p.active ? { border: `2.5px solid ${p.color}`, boxShadow: `4px 4px 0 ${p.color}` } : { background: 'white' }}>
                  <div style={{ height: 4, background: p.color }} />
                  <div className="p-6">
                    <div className="text-[10px] font-mono font-black uppercase tracking-widest mb-1" style={{ color: p.color }}>{p.timeline}</div>
                    <h3 className="text-sm font-black uppercase tracking-wide mb-4" style={{ color: '#1A1A1A' }}>{p.phase}</h3>
                    <ul className="space-y-1.5 mb-5">
                      {p.items.map(item => (
                        <li key={item} className="flex gap-2 items-start text-xs" style={{ color: '#6B7280' }}>
                          <span className="shrink-0 mt-0.5" style={{ color: p.color }}>·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="text-[10px] font-mono pt-3 leading-relaxed" style={{ borderTop: `2px solid ${p.color}40`, color: p.color }}>
                      Exit: {p.exit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Security */}
          <Section id="security">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>Trust & Safety</div>
            <h2 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Provider keys only in secrets manager; rotated quarterly.',
                'API keys: 256-bit random, prefix sk-fbx-, stored as SHA-256, constant-time compare.',
                'Top-ups credited only after on-chain finality; tx_signature uniqueness prevents replay.',
                'Hot wallet holds small float; rest swept to multisig (Squads) on a schedule.',
                'TLS everywhere; HSTS; no CORS wildcard on authed endpoints.',
                'Rate limiting per key and per IP at the edge; stricter limits on auth endpoints.',
                'Ledger and usage tables: no destructive migrations, point-in-time recovery.',
                'Admin actions audited with actor, target, and reason.',
              ].map(r => (
                <div key={r} className="flex gap-3 items-start nb-card-sm px-4 py-3 text-sm" style={{ background: 'white' }}>
                  <span className="font-black shrink-0" style={{ color: '#7C3AED' }}>→</span>
                  <span style={{ color: '#374151' }}>{r}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Brand */}
          <Section>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>Brand</div>
            <h2 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>Naming & Brand</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { k: 'Product', v: 'Farebox', color: '#7C3AED' },
                { k: 'Tagline', v: 'Every request pays its fare.', color: '#4ECDC4' },
                { k: 'Domain', v: 'farebox.fun · farebox.dev', color: '#FFD93D' },
                { k: 'Ticker (Phase 3+)', v: '$FBOX', color: '#FF6B6B' },
              ].map(({ k, v, color }) => (
                <div key={k} className="nb-card p-5" style={{ background: 'white' }}>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>{k}</div>
                  <div className="font-black" style={{ color: '#1A1A1A' }}>{v}</div>
                  <div className="h-1 mt-3 rounded" style={{ background: color, width: '40%' }} />
                </div>
              ))}
            </div>
            <div className="nb-card p-5" style={{ background: 'white' }}>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Product Family</div>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Farebox Gateway', color: '#7C3AED' },
                  { name: 'Farebox Chat', color: '#4ECDC4' },
                  { name: 'Farebox MCP', color: '#FFD93D' },
                  { name: 'Farebox CLI', color: '#FF9F43' },
                ].map(({ name, color }) => (
                  <span key={name} className="font-black text-sm nb-badge" style={{ color, borderColor: color, background: color + '18' }}>{name}</span>
                ))}
              </div>
            </div>
          </Section>

          {/* Open Risks */}
          <Section>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-6" style={{ color: '#7C3AED' }}>Transparency</div>
            <h2 className="uppercase leading-none mb-8" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 48, color: '#1A1A1A' }}>Open Risks</h2>
            <div className="space-y-4">
              {[
                ['Provider ToS / Account Bans', 'The existential risk. Mitigated with compliance review, multiple provider accounts where permitted, and honest volume disclosure to providers.'],
                ['Treasury & Off-ramp', 'Revenue arrives in USDC but provider invoices are fiat. Maintain an off-ramp path and enough fiat float to cover ~2 months of provider bills.'],
                ['Stablecoin Risk', 'USDC depeg or issuer action is a tail risk. Keep float lean, sweep to multisig, don\'t hold what you don\'t need.'],
                ['Crowded Gateway Market', 'Differentiation must stay sharp: wallet-native onboarding, agent lane, no-private-key stance, honest metering. Execution speed matters.'],
                ['Regulatory', 'Crypto payments and potential money-transmission rules vary by jurisdiction. Get professional legal advice before scaling or launching any token.'],
              ].map(([title, body]) => (
                <div key={title as string} className="flex gap-5 items-start nb-card px-6 py-5" style={{ background: 'white' }}>
                  <span className="w-4 h-4 shrink-0 mt-1 flex items-center justify-center"
                    style={{ background: '#FFD93D', border: '2px solid #1A1A1A', borderRadius: 4, boxShadow: '2px 2px 0 #1A1A1A' }} />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wide mb-1" style={{ color: '#1A1A1A' }}>{title as string}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{body as string}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-mono mt-6" style={{ color: '#9CA3AF' }}>This page is internal documentation. Numbers marked ??? must be modeled, not assumed. Not legal advice.</p>
          </Section>
        </div>

        <Footer />
      </div>
    </div>
  );
}
