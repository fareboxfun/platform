import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Logo } from './logo';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { useWalletAuth } from '../lib/wallet';

const PRIMARY_LINKS = [
  { label: 'Home',      href: '/'          },
  { label: 'Models',    href: '/models'    },
  { label: 'Compute',   href: '/compute'   },
  { label: 'Dashboard', href: '/dashboard' },
];

const MORE_LINKS = [
  { label: 'Agent Skills', href: '/skill',        desc: 'MCP + x402 + open marketplace' },
  { label: 'Architecture', href: '/architecture', desc: 'System design & data model'    },
  { label: 'About',        href: '/about',        desc: 'Mission, positioning & team'   },
  { label: 'Playground',   href: '/playground',   desc: 'Test any model live'           },
  { label: 'MCP Server',   href: '/mcp',          desc: 'Install in Claude / Cursor'    },
  { label: 'CLI',          href: '/docs#cli',     desc: 'fbx keys, balance, usage'      },
  { label: 'x402 Lane',    href: '/x402',         desc: 'Keyless agent payments'        },
  { label: 'Roadmap',      href: '/roadmap',      desc: 'Phase 1 → 3 milestones'        },
  { label: 'Security',     href: '/security',     desc: 'Key hashing & privacy'         },
];

const MOBILE_GROUPS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home',       href: '/'          },
      { label: 'Models',     href: '/models'    },
      { label: 'Compute',    href: '/compute'   },
      { label: 'Playground', href: '/playground'},
    ],
  },
  {
    heading: 'Integrate',
    links: [
      { label: 'Docs',         href: '/docs'          },
      { label: 'Agent Skills', href: '/skill'         },
      { label: 'MCP Server',   href: '/mcp'           },
      { label: 'x402 Lane',    href: '/x402'          },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',        href: '/about'        },
      { label: 'Architecture', href: '/architecture' },
      { label: 'Roadmap',      href: '/roadmap'      },
      { label: 'Status',       href: '/status'       },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy',   href: '/privacy'  },
      { label: 'Terms',     href: '/terms'    },
      { label: 'Security',  href: '/security' },
    ],
  },
];

export function TopNav() {
  const [moreOpen,   setMoreOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location]   = useLocation();
  const dropRef = useRef<HTMLDivElement>(null);

  /* Close desktop dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close both menus on route change */
  useEffect(() => { setMoreOpen(false); setMobileOpen(false); }, [location]);

  /* Lock body scroll while mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === '/' ? location === '/' : location.startsWith(href.split('#')[0]);

  const moreActive = MORE_LINKS.some(l => isActive(l.href.split('#')[0]));
  const { ready, authenticated, login, walletShort } = useWalletAuth();

  return (
    <>
      {/* ── Fixed top bar ─────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
        style={{ background: '#FFFBEF', borderBottom: '2.5px solid #1A1A1A' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-5 h-[58px] flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo size={28} />
          </Link>

          {/* ── Desktop nav pills ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
            {PRIMARY_LINKS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-1.5 text-[11px] font-black uppercase tracking-wide rounded-full transition-all duration-100"
                  style={{
                    border: '2px solid #1A1A1A',
                    background: active ? '#7C3AED' : 'white',
                    color: active ? 'white' : '#1A1A1A',
                    boxShadow: '3px 3px 0 #1A1A1A',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.transform = 'translate(-1px,-1px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 0 #1A1A1A';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.transform = '';
                      (e.currentTarget as HTMLElement).style.boxShadow = '3px 3px 0 #1A1A1A';
                    }
                  }}
                >
                  {label}
                </Link>
              );
            })}

            {/* MORE dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setMoreOpen(v => !v)}
                className="flex items-center gap-1 px-4 py-1.5 text-[11px] font-black uppercase tracking-wide rounded-full transition-all duration-100"
                style={{
                  border: '2px solid #1A1A1A',
                  background: moreActive || moreOpen ? '#7C3AED' : 'white',
                  color: moreActive || moreOpen ? 'white' : '#1A1A1A',
                  boxShadow: '3px 3px 0 #1A1A1A',
                }}
              >
                More <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div
                  className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-68 overflow-hidden z-50"
                  style={{
                    background: 'white',
                    border: '2.5px solid #1A1A1A',
                    borderRadius: 14,
                    boxShadow: '6px 6px 0 #1A1A1A',
                    minWidth: 260,
                  }}
                >
                  <div
                    className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"
                    style={{ border: '2.5px solid #1A1A1A', borderBottom: 'none', borderRight: 'none' }}
                  />
                  <div className="py-2">
                    {MORE_LINKS.map(({ label, href, desc }) => {
                      const basePath = href.split('#')[0];
                      const active = isActive(basePath);
                      return (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-start gap-3 px-4 py-2.5 transition-colors group"
                          style={{ background: active ? '#FFD93D18' : undefined }}
                          onMouseEnter={e => {
                            if (!active) (e.currentTarget as HTMLElement).style.background = '#FFFBEF';
                          }}
                          onMouseLeave={e => {
                            if (!active) (e.currentTarget as HTMLElement).style.background = '';
                          }}
                        >
                          <ChevronRight
                            className="w-3 h-3 mt-0.5 shrink-0"
                            style={{ color: active ? '#7C3AED' : '#1A1A1A50' }}
                          />
                          <div>
                            <div
                              className="text-[11px] font-black uppercase tracking-wide"
                              style={{ color: active ? '#7C3AED' : '#1A1A1A' }}
                            >
                              {label}
                            </div>
                            <div className="text-[10px] mt-0.5" style={{ color: '#1A1A1A60' }}>{desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile spacer */}
          <div className="md:hidden flex-1" />

          {/* ── Hamburger (mobile only) ───────────────────────────── */}
          <button
            className="md:hidden shrink-0 flex items-center justify-center w-9 h-9 transition-all active:scale-95"
            style={{
              border: '2.5px solid #1A1A1A',
              borderRadius: 8,
              background: mobileOpen ? '#1A1A1A' : 'white',
              boxShadow: '3px 3px 0 #1A1A1A',
              color: mobileOpen ? 'white' : '#1A1A1A',
            }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* ── CTA button ────────────────────────────────────────── */}
          {authenticated ? (
            <Link
              href="/dashboard"
              className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-[11px] font-black uppercase tracking-wide rounded-lg transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px]"
              style={{
                background: '#FFD93D',
                color: '#1A1A1A',
                border: '2.5px solid #1A1A1A',
                boxShadow: '4px 4px 0 #1A1A1A',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translate(-2px,-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0 #1A1A1A';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0 #1A1A1A';
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="hidden sm:inline">{walletShort ?? 'Dashboard'}</span>
              <span className="sm:hidden">App</span>
            </Link>
          ) : (
            <button
              onClick={login}
              disabled={!ready}
              className="shrink-0 flex items-center gap-1.5 px-3 sm:px-5 py-1.5 text-[11px] font-black uppercase tracking-wide rounded-lg transition-all duration-100 disabled:opacity-50"
              style={{
                background: '#FFD93D',
                color: '#1A1A1A',
                border: '2.5px solid #1A1A1A',
                boxShadow: '4px 4px 0 #1A1A1A',
              }}
              onMouseEnter={e => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translate(-2px,-2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0 #1A1A1A';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '4px 4px 0 #1A1A1A';
              }}
            >
              Connect <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile full-screen overlay ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col md:hidden"
          style={{ background: '#1A1A1A', overflowY: 'auto' }}
        >
          {/* Header row */}
          <div
            className="flex items-center justify-between px-5 h-[58px] shrink-0"
            style={{ borderBottom: '1px solid #ffffff10' }}
          >
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Logo size={26} wordmark={true} />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-8 h-8"
              style={{ color: '#9CA3AF', border: '1.5px solid #ffffff20', borderRadius: 8, background: '#ffffff08' }}
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation groups */}
          <div className="flex-1 px-5 py-6 space-y-7">
            {MOBILE_GROUPS.map(({ heading, links }) => (
              <div key={heading}>
                <div
                  className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] mb-3"
                  style={{ color: '#4B5563' }}
                >
                  {heading}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {links.map(({ label, href }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 text-[11px] font-black uppercase tracking-wide transition-all active:scale-95"
                        style={{
                          border: `2px solid ${active ? '#7C3AED' : '#ffffff12'}`,
                          borderRadius: 10,
                          background: active ? '#7C3AED' : '#ffffff06',
                          color: active ? 'white' : '#D1D5DB',
                          boxShadow: active ? '3px 3px 0 #7C3AED50' : 'none',
                        }}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="px-5 pb-8 pt-4 shrink-0" style={{ borderTop: '1px solid #ffffff10' }}>
            {authenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-black uppercase tracking-wide transition-all active:translate-y-[2px]"
                style={{
                  background: '#FFD93D', color: '#1A1A1A',
                  border: '2.5px solid #FFD93D', borderRadius: 12,
                  boxShadow: '4px 4px 0 #FFD93D50',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {walletShort ?? 'Open Dashboard'}
              </Link>
            ) : (
              <button
                onClick={() => { login(); setMobileOpen(false); }}
                className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-black uppercase tracking-wide transition-all active:translate-y-[2px]"
                style={{
                  background: '#FFD93D', color: '#1A1A1A',
                  border: '2.5px solid #FFD93D', borderRadius: 12,
                  boxShadow: '4px 4px 0 #FFD93D50',
                }}
              >
                Connect Wallet <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
