import React from 'react';
import { TopNav } from '../components/top-nav';
import { Footer } from '../components/footer';

const BORDER = '2.5px solid #1A1A1A';
const SHADOW = '4px 4px 0 #1A1A1A';
const PURPLE = '#7C3AED';
const CREAM  = '#FFFBEF';

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>{children}</p>;
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-black uppercase text-base mb-3 mt-6"
      style={{ fontFamily: "'Archivo Black', sans-serif", color: '#1A1A1A' }}>
      {children}
    </h3>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}>
      <TopNav />
      <div className="pt-14">

        {/* Hero */}
        <div className="px-4 sm:px-8 py-10 sm:py-16" style={{ borderBottom: BORDER }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4" style={{ color: PURPLE }}>
              — Legal
            </div>
            <h1 className="uppercase leading-none mb-4"
              style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(28px, 7vw, 90px)', letterSpacing: '-0.02em' }}>
              Terms of Service
            </h1>
            <p className="text-sm font-mono" style={{ color: '#9CA3AF' }}>
              Last updated: July 2026
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
          <div style={{ border: BORDER, borderRadius: 14, boxShadow: SHADOW, background: '#FFFFFF', padding: '40px 44px' }}>

            <P>These Terms of Service ("Terms") govern your use of Farebox (farebox.fun, api.farebox.fun, farebox-mcp). By using Farebox, you agree to these Terms.</P>

            <H3>1. Service Description</H3>
            <P>Farebox is a crypto-native LLM gateway that routes requests to third-party AI model providers and bills per token in USDC on Solana. We are a routing and billing layer — not an AI provider ourselves.</P>

            <H3>2. Eligibility</H3>
            <P>You must be at least 18 years old and legally able to enter contracts in your jurisdiction to use Farebox. Use of the service for automated agents acting on your behalf is permitted and encouraged.</P>

            <H3>3. API Keys & Account Security</H3>
            <P>You are responsible for keeping your API keys secure. Do not share keys or commit them to public repositories. Farebox is not liable for unauthorized charges resulting from compromised keys. If you believe a key has been compromised, revoke it immediately from the dashboard.</P>

            <H3>4. Payments & Credits</H3>
            <P>Farebox operates on a prepaid credit system. Credits are purchased by depositing USDC to your wallet-specific address on Solana. Credits are non-refundable except where required by law or at our discretion for service errors. Credits have no monetary value outside the Farebox platform.</P>
            <P>Prices are quoted in USD but settled in USDC. Exchange rate risk is minimal as USDC is pegged 1:1 to USD. We reserve the right to change pricing with 14 days' notice.</P>

            <H3>5. Acceptable Use</H3>
            <P>You may not use Farebox to: generate illegal content; attempt to circumvent rate limits or security measures; resell API access without written permission; submit fraudulent USDC transactions; or violate the terms of any upstream provider (OpenAI, Anthropic, etc.).</P>
            <P>Automated use, bots, and agent frameworks are permitted and a core use case. High-volume use that degrades service for other users may be rate-limited.</P>

            <H3>6. Skill Marketplace</H3>
            <P>Skills published on the Farebox marketplace must comply with our content policy and the applicable upstream provider terms. You retain ownership of your skill code. By publishing, you grant Farebox a license to host, route, and monetize your skill. Revenue is distributed at 80% to the skill publisher, 20% to Farebox, settled in USDC.</P>

            <H3>7. Service Availability</H3>
            <P>Farebox is provided "as-is" with no uptime guarantee at this stage. We aim for high availability but upstream provider outages, Solana network congestion, or Farebox maintenance may cause interruptions. Check <a href="/status" style={{ color: PURPLE }}>status.farebox.fun</a> for live status.</P>

            <H3>8. Limitation of Liability</H3>
            <P>To the maximum extent permitted by law, Farebox is not liable for indirect, incidental, or consequential damages including lost profits. Our total liability for any claim is limited to the credits in your account at the time of the incident.</P>

            <H3>9. Termination</H3>
            <P>We may suspend or terminate accounts that violate these Terms. You may close your account at any time — unused credits will be refunded where technically feasible.</P>

            <H3>10. Changes</H3>
            <P>We may update these Terms. Continued use after changes constitutes acceptance. Significant changes will be communicated with 14 days' notice.</P>

            <H3>11. Governing Law</H3>
            <P>These Terms are governed by the laws of the jurisdiction in which Farebox is incorporated. Disputes will be resolved through binding arbitration unless prohibited by local law.</P>

            <H3>12. Contact</H3>
            <P>Legal inquiries: <a href="mailto:legal@farebox.fun" style={{ color: PURPLE }}>legal@farebox.fun</a></P>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
