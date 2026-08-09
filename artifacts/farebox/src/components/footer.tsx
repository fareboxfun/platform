import React from 'react';
import { Link } from 'wouter';
import { Logo } from './logo';

const COL_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Models',      href: '/models'       },
      { label: 'Docs',        href: '/docs'          },
      { label: 'Status',      href: '/status'        },
      { label: 'Agent Skills',href: '/skill'         },
      { label: 'Compute',     href: '/compute'       },
      { label: 'Playground',  href: '/playground'    },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',        href: '/about'        },
      { label: 'Architecture', href: '/architecture' },
      { label: 'Roadmap',      href: '/roadmap'      },
      { label: 'MCP Server',   href: '/mcp'          },
      { label: 'x402 Lane',    href: '/x402'         },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy'  },
      { label: 'Terms',   href: '/terms'    },
      { label: 'Security',href: '/security' },
    ],
  },
  {
    heading: 'Social',
    links: [
      { label: 'X / Twitter', href: 'https://x.com/Farebox_',                          external: true },
      { label: 'GitHub',      href: 'https://github.com/fareboxfun',                  external: true },
      { label: 'NPM',         href: 'https://www.npmjs.com/package/farebox-mcp',      external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: '#1A1A1A', borderTop: '2.5px solid #1A1A1A' }}>
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-8">

        {/* Top row — logo + columns */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Logo size={32} wordmark={true} />
            </Link>
            <p className="text-xs font-mono uppercase tracking-widest leading-relaxed" style={{ color: '#4B5563' }}>
              The payment layer<br />for AI agents.<br />Pay the fare. Not the platform.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {COL_LINKS.map(col => (
              <div key={col.heading}>
                <div
                  className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] mb-4"
                  style={{ color: '#6B7280' }}
                >
                  {col.heading}
                </div>
                <ul className="space-y-2.5">
                  {col.links.map(({ label, href, external }: any) => (
                    <li key={label}>
                      {external ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold transition-colors"
                          style={{ color: '#9CA3AF' }}
                          onMouseOver={e => (e.currentTarget.style.color = '#FFD93D')}
                          onMouseOut={e  => (e.currentTarget.style.color = '#9CA3AF')}
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="text-xs font-semibold transition-colors"
                          style={{ color: '#9CA3AF' }}
                          onMouseOver={(e: any) => (e.currentTarget.style.color = '#FFD93D')}
                          onMouseOut={(e: any)  => (e.currentTarget.style.color = '#9CA3AF')}
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-6"
          style={{ borderTop: '1px solid #ffffff0c' }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#374151' }}>
            © {new Date().getFullYear()} Farebox. All rights reserved.
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#374151' }}>
            Built on Solana · Powered by USDC · x402 native
          </p>
        </div>
      </div>
    </footer>
  );
}
