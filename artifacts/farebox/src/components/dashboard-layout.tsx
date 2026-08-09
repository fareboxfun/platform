import React from 'react';
import { Link, useLocation } from 'wouter';
import { useWalletAuth as usePrivyAuth } from '../lib/wallet';
import { Logo } from './logo';

const NAV = [
  {
    group: 'Gateway',
    color: '#7C3AED',
    items: [
      { href: '/dashboard',  label: 'Overview',         live: true },
      { href: '/playground', label: 'Playground',       live: true },
    ],
  },
  {
    group: 'Account',
    color: '#FF6B6B',
    items: [
      { href: '/dashboard/keys',    label: 'API Keys', live: true  },
      { href: '/dashboard/balance', label: 'Credits',  live: true  },
      { href: '/dashboard/usage',   label: 'Usage',    live: true  },
    ],
  },
  {
    group: 'Catalog',
    color: '#4ECDC4',
    items: [
      { href: '/dashboard/models', label: 'Models', live: true  },
    ],
  },
  {
    group: 'Network',
    color: '#FF9F43',
    items: [
      { href: '/compute', label: 'Compute / Earn', live: true  },
      { href: '/status',  label: 'Status',         live: true  },
    ],
  },
  {
    group: 'Resources',
    color: '#FFD93D',
    items: [
      { href: '/skill', label: 'Agent Skills', live: true  },
      { href: '/docs',  label: 'Docs',         live: true  },
      { href: '/',      label: 'Main Site',    live: true  },
    ],
  },
];

const CRUMBS: Record<string, string[]> = {
  '/dashboard':         ['Overview'],
  '/dashboard/keys':    ['Account', 'API Keys'],
  '/dashboard/balance': ['Account', 'Credits'],
  '/dashboard/usage':   ['Account', 'Usage'],
  '/dashboard/models':  ['Catalog', 'Models'],
  '/models':            ['Catalog', 'Model Catalog'],
  '/playground':        ['Gateway', 'Playground'],
  '/compute':           ['Network', 'Compute / Earn'],
  '/status':            ['Network', 'Status'],
  '/skill':             ['Resources', 'Agent Skills'],
  '/docs':              ['Resources', 'Docs'],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { ready, authenticated, login, logout, walletShort, walletAddress } = usePrivyAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const crumbs = CRUMBS[location] ?? ['Console'];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#FFFBEF' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          flex flex-col shrink-0
          fixed inset-y-0 left-0 z-50
          transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:inset-auto
        `}
        style={{
          width: 200,
          background: '#FFFBEF',
          borderRight: '2.5px solid #1A1A1A',
        }}
      >
        {/* Branding */}
        <div
          className="px-4 pt-4 pb-3 flex flex-col gap-1"
          style={{ borderBottom: '2px solid #1A1A1A' }}
        >
          <Logo size={26} wordmark={true} />
          <div className="text-[8px] font-mono font-black tracking-[0.22em] uppercase pl-[34px]" style={{ color: '#1A1A1A55' }}>
            Console
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map(({ group, color, items }) => (
            <div key={group} className="mb-4">
              {/* Group label */}
              <div
                className="px-2 mb-1.5 text-[8.5px] font-black uppercase tracking-[0.22em] flex items-center gap-1.5"
                style={{ color: '#1A1A1A80' }}
              >
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: color, border: '1.5px solid #1A1A1A' }} />
                {group}
              </div>

              {items.map(({ href, label, live }) => {
                const active = location === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-[7px] mb-0.5 text-[11px] font-bold rounded-lg transition-all duration-100"
                    style={{
                      background: active ? '#FFD93D' : 'transparent',
                      color: active ? '#1A1A1A' : '#1A1A1A75',
                      border: active ? '2px solid #1A1A1A' : '2px solid transparent',
                      boxShadow: active ? '2px 2px 0 #1A1A1A' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'white';
                        (e.currentTarget as HTMLElement).style.color = '#1A1A1A';
                        (e.currentTarget as HTMLElement).style.border = '2px solid #1A1A1A40';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#1A1A1A75';
                        (e.currentTarget as HTMLElement).style.border = '2px solid transparent';
                      }
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-sm shrink-0"
                      style={{ background: active ? '#1A1A1A' : '#1A1A1A30' }}
                    />
                    <span className="flex-1 truncate">{label}</span>
                    {live && (
                      <span
                        className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ background: '#6BCB77', color: '#1A1A1A', border: '1.5px solid #1A1A1A' }}
                      >
                        Live
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Wallet / bottom */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: '2px solid #1A1A1A' }}>
          {authenticated ? (
            <div className="space-y-2">
              <div
                className="p-2.5 rounded-lg"
                style={{ background: 'white', border: '2px solid #1A1A1A', boxShadow: '2px 2px 0 #1A1A1A' }}
              >
                <div className="text-[8px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#1A1A1A60' }}>
                  Wallet
                </div>
                <div className="font-mono text-[10px] truncate font-bold" style={{ color: '#1A1A1A' }}>
                  {walletShort ?? walletAddress ?? '—'}
                </div>
              </div>
              <button
                onClick={() => logout().then(() => window.location.reload())}
                className="w-full text-[10px] font-black uppercase tracking-wider py-1.5 rounded-lg transition-all duration-100"
                style={{
                  background: 'white',
                  color: '#FF6B6B',
                  border: '2px solid #FF6B6B',
                  boxShadow: '2px 2px 0 #1A1A1A',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#FF6B6B';
                  (e.currentTarget as HTMLElement).style.color = 'white';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'white';
                  (e.currentTarget as HTMLElement).style.color = '#FF6B6B';
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              disabled={!ready}
              className="w-full py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all duration-100 disabled:opacity-50"
              style={{
                background: '#7C3AED',
                color: 'white',
                border: '2px solid #1A1A1A',
                boxShadow: '3px 3px 0 #1A1A1A',
              }}
              onMouseEnter={e => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translate(-1px,-1px)';
                  e.currentTarget.style.boxShadow = '5px 5px 0 #1A1A1A';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '3px 3px 0 #1A1A1A';
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen" style={{ background: '#FFFBEF' }}>

        {/* Top header bar */}
        <header
          className="h-10 shrink-0 flex items-center justify-between px-5"
          style={{ borderBottom: '2px solid #1A1A1A', background: 'white' }}
        >
          {/* Mobile menu + breadcrumb */}
          <div className="flex items-center gap-2">
            <button
              className="md:hidden mr-1"
              onClick={() => setMobileOpen(true)}
              style={{ color: '#1A1A1A70' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <nav className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider" style={{ color: '#1A1A1A50' }}>
              <span className="font-bold" style={{ color: '#1A1A1A70' }}>Farebox Console</span>
              {crumbs.map((c, i) => (
                <React.Fragment key={c}>
                  <span style={{ color: '#1A1A1A30' }}>/</span>
                  <span
                    className={i === crumbs.length - 1 ? 'font-black' : ''}
                    style={{ color: i === crumbs.length - 1 ? '#1A1A1A' : '#1A1A1A50' }}
                  >
                    {c}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Status pill */}
          <div
            className="flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: '#6BCB7720', border: '1.5px solid #1A1A1A', color: '#1A1A1A80', boxShadow: '1px 1px 0 #1A1A1A' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#6BCB77]" />
            All Systems Live
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
