import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useGetBalance, useGetLedger, useCreateTopup, getGetBalanceQueryKey, getGetLedgerQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Check, ArrowUpRight, ArrowDownRight, Wallet, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { useWalletAuth } from '../lib/wallet';

/* ── helpers ─────────────────────────────── */
const USDC_PRESETS = [5, 20, 50, 100, 250, 500];

function fmtUsdc(v?: number) {
  if (v === undefined) return '0.00';
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function fmtUsd(v?: number) {
  if (v === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{
        padding: '6px',
        border: '2px solid #1A1A1A',
        borderRadius: 6,
        boxShadow: '2px 2px 0 #1A1A1A',
        background: 'white',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      title="Copy"
    >
      {copied
        ? <Check className="w-3.5 h-3.5" style={{ color: '#6BCB77' }} />
        : <Copy className="w-3.5 h-3.5 text-black/50" />}
    </button>
  );
}

/* ── page ────────────────────────────────── */
export default function Balance() {
  const { walletAddress } = useWalletAuth();
  const { data: balance, isLoading } = useGetBalance();
  const { data: ledger, isLoading: loadingLedger } = useGetLedger({ limit: 50 });
  const [amount, setAmount] = React.useState(20);
  const [session, setSession] = React.useState<any>(null);
  const create = useCreateTopup();
  const qc = useQueryClient();

  const handleTopup = () =>
    create.mutate({ data: { amountUsdc: amount } }, { onSuccess: setSession });

  const confirmPaid = () => {
    qc.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
    qc.invalidateQueries({ queryKey: getGetLedgerQueryKey() });
    setSession(null);
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl pt-[58px]" style={{ background: '#FFFBEF', minHeight: '100vh' }}>

      {/* ── Header ──────────────────────────── */}
      <div>
        <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED] mb-1" style={{ fontSize: 10 }}>
          Account
        </div>
        <h1
          className="font-black uppercase"
          style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, letterSpacing: '-0.01em' }}
        >
          Credits
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left col ───────────────────────── */}
        <div className="space-y-4">

          {/* Balance card */}
          <div
            style={{
              background: '#FFD93D',
              border: '2.5px solid #1A1A1A',
              borderRadius: 12,
              boxShadow: '4px 4px 0 #1A1A1A',
              padding: '20px',
            }}
          >
            <div className="font-mono font-bold uppercase tracking-widest text-black/50 mb-3" style={{ fontSize: 9 }}>
              Available Balance
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span
                className="font-black leading-none"
                style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 44, color: '#1A1A1A' }}
              >
                {isLoading ? '…' : fmtUsdc(balance?.balanceUsd)}
              </span>
              <span className="font-mono font-bold text-black/50 mb-2" style={{ fontSize: 12 }}>USDC</span>
            </div>

            <div
              className="grid grid-cols-2 gap-4 pt-4"
              style={{ borderTop: '2px solid rgba(26,26,26,0.2)' }}
            >
              <div>
                <div className="font-mono text-black/40 mb-0.5" style={{ fontSize: 9 }}>Total Funded</div>
                <div className="font-mono font-bold" style={{ fontSize: 13 }}>
                  {fmtUsdc(balance?.totalTopupUsd)}{' '}
                  <span className="text-black/35" style={{ fontSize: 9 }}>USDC</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-black/40 mb-0.5" style={{ fontSize: 9 }}>Total Spent</div>
                <div className="font-mono font-bold" style={{ fontSize: 13 }}>
                  {fmtUsdc(balance?.totalSpentUsd)}{' '}
                  <span className="text-black/35" style={{ fontSize: 9 }}>USDC</span>
                </div>
              </div>
            </div>

            {/* Connected wallet chip */}
            {walletAddress && (
              <div
                className="flex items-center gap-2 mt-3"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: '2px solid #1A1A1A',
                  borderRadius: 8,
                  padding: '8px 12px',
                }}
              >
                <Wallet className="w-3.5 h-3.5 text-black/60 shrink-0" />
                <span className="font-mono text-black/70 truncate" style={{ fontSize: 10 }}>{short(walletAddress)}</span>
                <span
                  className="ml-auto font-bold font-mono uppercase tracking-widest"
                  style={{
                    fontSize: 8,
                    padding: '2px 6px',
                    background: '#6BCB77',
                    border: '1.5px solid #1A1A1A',
                    borderRadius: 999,
                    boxShadow: '1.5px 1.5px 0 #1A1A1A',
                  }}
                >
                  Connected
                </span>
              </div>
            )}
          </div>

          {/* Top-up panel */}
          <div
            style={{
              background: 'white',
              border: '2.5px solid #1A1A1A',
              borderRadius: 12,
              boxShadow: '4px 4px 0 #1A1A1A',
              padding: '20px',
            }}
          >
            <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED] mb-1" style={{ fontSize: 9 }}>
              Top Up
            </div>
            <div
              className="font-black uppercase mb-4"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 18 }}
            >
              USDC on Solana
            </div>

            {session ? (
              /* ── Payment screen ── */
              <div className="space-y-4">
                {/* QR code */}
                <div
                  className="flex flex-col items-center gap-3"
                  style={{
                    background: '#FFFBEF',
                    border: '2px solid #1A1A1A',
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <QRCodeSVG
                    value={session.solanaPay}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                    imageSettings={{
                      src: '/favicon.svg',
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                  <div className="text-center">
                    <div className="font-mono text-black/30 mb-0.5" style={{ fontSize: 9 }}>Scan with any Solana wallet</div>
                    <div className="font-black leading-none" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 26 }}>
                      {session.payment.amountUsdc}{' '}
                      <span className="font-mono text-black/50" style={{ fontSize: 12 }}>USDC</span>
                    </div>
                  </div>
                </div>

                {/* Deposit address */}
                <div>
                  <div className="font-mono text-black/30 mb-1.5 uppercase tracking-widest" style={{ fontSize: 9 }}>
                    Deposit Address · Solana
                  </div>
                  <div
                    className="flex items-center gap-2"
                    style={{
                      border: '2px solid #1A1A1A',
                      borderRadius: 8,
                      background: '#FFFBEF',
                      padding: '8px 12px',
                    }}
                  >
                    <code className="flex-1 font-mono text-black/60 truncate" style={{ fontSize: 10 }}>
                      {session.depositAddress}
                    </code>
                    <CopyButton text={session.depositAddress} />
                  </div>
                  <div className="font-mono text-black/25 mt-1" style={{ fontSize: 8 }}>
                    USDC (SPL) · EPjFW…Dt1v
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="space-y-2">
                  <a
                    href={session.solanaPay}
                    className="nb-btn nb-btn-black w-full"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Wallet
                  </a>

                  <a
                    href={`https://phantom.app/ul/v1/send?to=${encodeURIComponent(session.depositAddress)}&amount=${session.payment.amountUsdc}&token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nb-btn nb-btn-outline w-full"
                  >
                    Open in Phantom
                  </a>

                  <button
                    onClick={confirmPaid}
                    className="w-full font-mono font-bold uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
                    style={{
                      fontSize: 9,
                      padding: '8px',
                      border: '2px dashed rgba(26,26,26,0.2)',
                      borderRadius: 8,
                    }}
                  >
                    Mark Paid (Dev / Testnet)
                  </button>

                  <button
                    onClick={() => setSession(null)}
                    className="w-full font-mono text-black/25 hover:text-black/50 uppercase tracking-widest transition-colors"
                    style={{ fontSize: 9, paddingTop: 4 }}
                  >
                    Cancel
                  </button>
                </div>

                {/* Awaiting confirmation */}
                <div
                  className="flex items-center gap-2"
                  style={{
                    border: '2px solid #FF9F43',
                    borderRadius: 8,
                    background: '#FFF8F0',
                    padding: '10px 12px',
                  }}
                >
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#FF9F43', display: 'inline-block', flexShrink: 0,
                      animation: 'pulse 2s infinite',
                    }}
                  />
                  <span className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: '#B36000' }}>
                    Awaiting on-chain confirmation · ~2s on Solana
                  </span>
                </div>
              </div>
            ) : (
              /* ── Amount selector ── */
              <div className="space-y-4">
                <div>
                  <div className="font-mono text-black/40 mb-2 uppercase tracking-widest" style={{ fontSize: 9 }}>
                    Select Amount
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {USDC_PRESETS.map(a => (
                      <button
                        key={a}
                        onClick={() => setAmount(a)}
                        style={{
                          padding: '10px 4px',
                          border: '2px solid #1A1A1A',
                          borderRadius: 8,
                          boxShadow: amount === a ? '3px 3px 0 #1A1A1A' : '2px 2px 0 #1A1A1A',
                          background: amount === a ? '#7C3AED' : 'white',
                          color: amount === a ? 'white' : '#1A1A1A',
                          cursor: 'pointer',
                          fontFamily: 'Space Mono, monospace',
                          fontWeight: 700,
                          fontSize: 13,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                          transition: 'all 0.08s ease',
                          transform: amount === a ? 'translate(-1px,-1px)' : 'none',
                        }}
                      >
                        <span>{a}</span>
                        <span style={{ fontSize: 8, fontWeight: 400, opacity: 0.6 }}>USDC</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <div>
                  <div className="font-mono text-black/40 mb-1.5 uppercase tracking-widest" style={{ fontSize: 9 }}>
                    Or Enter Custom
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={amount}
                      onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
                      className="nb-input"
                      style={{ paddingRight: 56 }}
                      placeholder="0"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-mono font-bold text-black/35"
                      style={{ fontSize: 10 }}
                    >
                      USDC
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleTopup}
                  disabled={create.isPending || amount < 1}
                  className="nb-btn nb-btn-primary w-full"
                  style={{ opacity: create.isPending || amount < 1 ? 0.5 : 1 }}
                >
                  {create.isPending
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating…</>
                    : <>Generate Deposit QR · {amount} USDC</>}
                </button>

                <div className="font-mono text-black/30 text-center leading-relaxed" style={{ fontSize: 9 }}>
                  Sends USDC on Solana to a dedicated deposit address.
                  <br />
                  1 USDC = $1.00 · no fees · no minimums
                </div>
              </div>
            )}
          </div>

          {/* Network info bar */}
          <div
            className="flex items-center justify-between"
            style={{
              border: '2px solid #1A1A1A',
              borderRadius: 10,
              background: 'white',
              padding: '10px 16px',
              boxShadow: '3px 3px 0 #1A1A1A',
            }}
          >
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#6BCB77', display: 'inline-block',
                  border: '1.5px solid #1A1A1A',
                }}
              />
              <span className="font-mono font-bold uppercase tracking-widest text-black/60" style={{ fontSize: 9 }}>
                Solana Mainnet
              </span>
            </div>
            <span className="font-mono text-black/30" style={{ fontSize: 9 }}>USDC · SPL Token</span>
          </div>
        </div>

        {/* ── Right col: Ledger ──────────────── */}
        <div
          className="lg:col-span-2 flex flex-col"
          style={{
            background: 'white',
            border: '2.5px solid #1A1A1A',
            borderRadius: 12,
            boxShadow: '4px 4px 0 #1A1A1A',
            maxHeight: 640,
          }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between shrink-0"
            style={{ borderBottom: '2px solid #1A1A1A' }}
          >
            <div>
              <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED]" style={{ fontSize: 9 }}>
                Ledger
              </div>
              <span className="font-black uppercase" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 18 }}>
                Transaction History
              </span>
            </div>
            <span
              className="font-mono font-bold text-black/40 uppercase tracking-widest"
              style={{
                fontSize: 9,
                border: '2px solid #1A1A1A',
                borderRadius: 999,
                boxShadow: '2px 2px 0 #1A1A1A',
                padding: '3px 10px',
                background: '#FFFBEF',
              }}
            >
              USDC · Solana
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left font-mono whitespace-nowrap" style={{ fontSize: 11 }}>
              <thead
                className="sticky top-0"
                style={{ background: '#FFFBEF', borderBottom: '2px solid #1A1A1A' }}
              >
                <tr>
                  {['Type', 'Date', 'Description', 'Amount (USDC)', 'Balance After', 'Tx'].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3 font-bold uppercase tracking-widest text-black/40"
                      style={{ fontSize: 9 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingLedger ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-black/25 font-mono" style={{ fontSize: 10 }}>
                      Loading…
                    </td>
                  </tr>
                ) : ledger?.entries?.length ? (
                  ledger.entries.map((e, idx) => (
                    <tr
                      key={e.id}
                      style={{
                        borderBottom: idx < ledger.entries.length - 1 ? '1.5px solid rgba(26,26,26,0.07)' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = '#FFFBEF')}
                      onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1 font-bold uppercase tracking-widest"
                          style={{
                            fontSize: 9,
                            padding: '3px 8px',
                            border: '1.5px solid #1A1A1A',
                            borderRadius: 6,
                            boxShadow: '1.5px 1.5px 0 #1A1A1A',
                            background: e.amountUsd >= 0 ? '#6BCB77' : '#FF6B6B',
                            color: e.amountUsd >= 0 ? '#1A1A1A' : 'white',
                          }}
                        >
                          {e.amountUsd >= 0
                            ? <ArrowUpRight className="w-3 h-3" />
                            : <ArrowDownRight className="w-3 h-3" />}
                          {e.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-black/35">
                        {new Date(e.createdAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric',
                          hour: 'numeric', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3 text-black/45 truncate" style={{ maxWidth: 160 }}>
                        {e.description || '—'}
                      </td>
                      <td className="px-5 py-3 font-bold" style={{ color: e.amountUsd >= 0 ? '#2d8a3e' : '#c0392b' }}>
                        {e.amountUsd > 0 ? '+' : ''}{fmtUsdc(e.amountUsd)}
                        <span className="font-normal text-black/30 ml-1" style={{ fontSize: 8 }}>USDC</span>
                      </td>
                      <td className="px-5 py-3 text-black/40">
                        {fmtUsdc(e.balanceAfter)}
                        <span className="text-black/25 ml-1" style={{ fontSize: 8 }}>USDC</span>
                      </td>
                      <td className="px-5 py-3">
                        {e.txSignature ? (
                          <a
                            href={`https://orbmarkets.io/tx/${e.txSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Helius Explorer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 8px',
                              border: '1.5px solid #1A1A1A',
                              borderRadius: 6,
                              boxShadow: '1.5px 1.5px 0 #1A1A1A',
                              background: '#FFFBEF',
                              fontSize: 9,
                              fontWeight: 700,
                              fontFamily: 'Space Mono, monospace',
                              textDecoration: 'none',
                              color: '#7C3AED',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                            }}
                            onMouseEnter={ev => { ev.currentTarget.style.background = '#FFD93D'; ev.currentTarget.style.color = '#1A1A1A'; }}
                            onMouseLeave={ev => { ev.currentTarget.style.background = '#FFFBEF'; ev.currentTarget.style.color = '#7C3AED'; }}
                          >
                            <Search style={{ width: 10, height: 10 }} />
                            Scan
                          </a>
                        ) : (
                          <span className="text-black/20 font-mono" style={{ fontSize: 9 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div
                        className="inline-block p-8"
                        style={{ border: '2px dashed rgba(26,26,26,0.15)', borderRadius: 10 }}
                      >
                        <div className="font-mono text-black/25 uppercase tracking-widest" style={{ fontSize: 10 }}>
                          No transactions yet
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
