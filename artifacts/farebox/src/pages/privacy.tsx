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

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm font-mono" style={{ color: '#9CA3AF' }}>
              Last updated: July 2026
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
          <div style={{ border: BORDER, borderRadius: 14, boxShadow: SHADOW, background: '#FFFFFF', padding: '40px 44px' }}>

            <P>Farebox ("we", "us", "our") operates farebox.fun and api.farebox.fun. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data.</P>

            <H3>1. Data We Collect</H3>
            <P><strong>Account data:</strong> Solana wallet address (used as your account identifier). We do not collect email addresses unless you contact us or submit a skill.</P>
            <P><strong>Usage data:</strong> Request logs including model called, token counts, cost, latency, timestamp, and API key identifier. This data is used for billing and dashboard display.</P>
            <P><strong>Payment data:</strong> On-chain Solana transaction signatures for USDC deposits. We record the tx signature, amount, and timestamp. We do not have access to your private key.</P>
            <P><strong>Skill submissions:</strong> If you submit a skill, we collect your name, email, OpenAPI spec URL, and pricing — solely to review and onboard your skill.</P>
            <P><strong>Technical data:</strong> IP address, user agent, and request metadata for abuse prevention and security monitoring.</P>

            <H3>2. How We Use Your Data</H3>
            <P>We use collected data to: provide and operate the Farebox API gateway; compute and display billing and usage; prevent fraud and abuse; contact you about your account or skill submission; and improve the service.</P>
            <P>We do not sell your data. We do not use your data for advertising. We do not share your data with third parties except as necessary to operate the service (e.g., upstream LLM providers receive your requests — see section 4).</P>

            <H3>3. Data Retention</H3>
            <P>Usage events and ledger entries are retained for a minimum of 12 months for billing accuracy and audit purposes. Wallet addresses and API keys are retained for the life of your account. You may request deletion by contacting privacy@farebox.fun; note that ledger entries cannot be deleted (they are append-only by design for financial integrity).</P>

            <H3>4. Third-Party Providers</H3>
            <P>When you make a model request, the prompt and any context you include is sent to the upstream provider (OpenAI, Anthropic, Google, etc.) for inference. Each provider has its own privacy policy. Farebox acts as a routing proxy and does not retain prompt content — only token counts and metadata.</P>

            <H3>5. Cookies & Tracking</H3>
            <P>The farebox.fun web app uses a minimal session cookie to maintain your login state (wallet connection via Privy). We do not use third-party advertising or analytics cookies. We do not use Google Analytics or similar services.</P>

            <H3>6. Security</H3>
            <P>We apply industry-standard security practices including TLS encryption, hashed API key storage, and append-only financial records. See our <a href="/security" className="underline" style={{ color: PURPLE }}>Security page</a> for details.</P>

            <H3>7. Your Rights</H3>
            <P>Depending on your jurisdiction, you may have rights to access, correct, or delete your personal data. To exercise these rights, contact privacy@farebox.fun. We will respond within 30 days.</P>

            <H3>8. Changes</H3>
            <P>We may update this policy. Significant changes will be noted on this page with an updated date. Continued use of Farebox after changes constitutes acceptance.</P>

            <H3>9. Contact</H3>
            <P>Questions about this policy: <a href="mailto:privacy@farebox.fun" style={{ color: PURPLE }}>privacy@farebox.fun</a></P>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
