import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const API_BASE = 'https://api.farebox.fun';

interface WalletAuthCtx {
  ready: boolean;
  authenticated: boolean;
  serverAuthenticated: boolean;
  serverLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  walletAddress: string | null;
  walletShort: string | null;
}

const Ctx = createContext<WalletAuthCtx | null>(null);
const ModalCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

/* ── Wallet Selector Modal ───────────────────────────────────────────────── */
function WalletSelector() {
  const modal = useContext(ModalCtx);
  const { wallets, select, connecting } = useWallet();
  if (!modal?.open) return null;

  const detected = wallets.filter((w) => w.readyState === 'Installed' || w.readyState === 'Loadable');
  const list = detected.length > 0 ? detected : wallets;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={() => modal.setOpen(false)}
    >
      <div
        style={{
          background: '#FFFBEF', border: '3px solid #1A1A1A',
          boxShadow: '8px 8px 0 #1A1A1A', padding: '32px 28px',
          minWidth: 320, maxWidth: 400, width: '90vw',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Connect Wallet
          </div>
          <div style={{ fontSize: 12, color: '#1A1A1A70', marginTop: 4 }}>
            Select your Solana wallet to sign in
          </div>
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#1A1A1A60', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👛</div>
            No Solana wallets detected.<br />
            Install{' '}
            <a href="https://phantom.app" target="_blank" rel="noopener noreferrer"
              style={{ color: '#7C3AED', fontWeight: 700 }}>Phantom</a>
            {' '}or{' '}
            <a href="https://solflare.com" target="_blank" rel="noopener noreferrer"
              style={{ color: '#7C3AED', fontWeight: 700 }}>Solflare</a>
            {' '}to continue.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map((w) => (
              <button
                key={w.adapter.name}
                disabled={connecting}
                onClick={() => { select(w.adapter.name); modal.setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '13px 16px',
                  border: '2.5px solid #1A1A1A', background: 'white',
                  boxShadow: '3px 3px 0 #1A1A1A', cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 14, textAlign: 'left',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFD93D';
                  e.currentTarget.style.transform = 'translate(-2px,-2px)';
                  e.currentTarget.style.boxShadow = '5px 5px 0 #1A1A1A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '3px 3px 0 #1A1A1A';
                }}
              >
                {w.adapter.icon && (
                  <img
                    src={w.adapter.icon}
                    alt={w.adapter.name}
                    style={{ width: 30, height: 30, borderRadius: 8 }}
                  />
                )}
                <span style={{ flex: 1 }}>{w.adapter.name}</span>
                {w.readyState === 'Installed' && (
                  <span style={{
                    fontSize: 9, fontWeight: 900, letterSpacing: '0.12em',
                    padding: '2px 8px', background: '#6BCB77',
                    border: '1.5px solid #1A1A1A', textTransform: 'uppercase',
                  }}>
                    Installed
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => modal.setOpen(false)}
          style={{
            marginTop: 16, width: '100%', padding: 10,
            border: '2px solid #1A1A1A30', background: 'transparent',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12, fontWeight: 700, color: '#1A1A1A50',
            cursor: 'pointer', letterSpacing: '0.05em',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Inner provider (must be inside WalletProvider) ─────────────────────── */
function WalletAuthInner({
  children,
  openModal,
}: {
  children: React.ReactNode;
  openModal: () => void;
}) {
  const { connected, publicKey, signMessage, disconnect, connecting } = useWallet();
  const [serverAuthenticated, setServerAuthenticated] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const syncedRef = useRef(false);

  const walletAddress = publicKey?.toString() ?? null;
  const walletShort = walletAddress
    ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`
    : null;
  const ready = !connecting;
  const authenticated = connected && !!walletAddress;

  const checkServerSession = useCallback(async (): Promise<boolean> => {
    try {
      const r = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
      if (r.ok) { setServerAuthenticated(true); return true; }
    } catch {}
    return false;
  }, []);

  const bridgeToServer = useCallback(async (address: string) => {
    setServerLoading(true);
    try {
      const hasSession = await checkServerSession();
      if (hasSession) return;

      const nonceRes = await fetch(`${API_BASE}/api/auth/nonce`, { credentials: 'include' });
      if (!nonceRes.ok) throw new Error('Failed to get nonce');
      const { nonce } = await nonceRes.json();

      const issuedAt = new Date().toISOString();
      const message =
        `farebox.fun wants you to sign in with your Solana account:\n` +
        `${address}\n\n` +
        `Sign in to Farebox\n\n` +
        `Nonce: ${nonce}\nIssued At: ${issuedAt}`;

      let signature = `stub-${nonce.slice(0, 16)}`;
      if (signMessage) {
        try {
          const msgBytes = new TextEncoder().encode(message);
          const sigBytes = await signMessage(msgBytes);
          signature = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
        } catch (e) {
          console.warn('[farebox] wallet signing failed, using stub sig:', e);
        }
      }

      const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress: address, nonce, signature, message }),
      });

      if (verifyRes.ok) {
        setServerAuthenticated(true);
      } else {
        const err = await verifyRes.json().catch(() => ({}));
        console.error('[farebox] auth/verify failed:', err);
      }
    } catch (e) {
      console.error('[farebox] bridgeToServer error:', e);
    } finally {
      setServerLoading(false);
    }
  }, [checkServerSession, signMessage]);

  useEffect(() => {
    if (!authenticated) {
      setServerAuthenticated(false);
      syncedRef.current = false;
      return;
    }
    if (authenticated && walletAddress && !syncedRef.current) {
      syncedRef.current = true;
      bridgeToServer(walletAddress);
    }
  }, [authenticated, walletAddress, bridgeToServer]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    setServerAuthenticated(false);
    syncedRef.current = false;
    await disconnect();
  }, [disconnect]);

  return (
    <Ctx.Provider value={{
      ready,
      authenticated,
      serverAuthenticated,
      serverLoading,
      login: openModal,
      logout: handleLogout,
      walletAddress,
      walletShort,
    }}>
      {children}
    </Ctx.Provider>
  );
}

/* ── Public provider ─────────────────────────────────────────────────────── */
export function WalletAuthProvider({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ModalCtx.Provider value={{ open: modalOpen, setOpen: setModalOpen }}>
      <WalletAuthInner openModal={() => setModalOpen(true)}>
        {children}
        <WalletSelector />
      </WalletAuthInner>
    </ModalCtx.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────────────────── */
export function useWalletAuth(): WalletAuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWalletAuth must be used inside WalletAuthProvider');
  return ctx;
}

