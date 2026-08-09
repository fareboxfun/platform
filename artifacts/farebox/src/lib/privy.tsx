import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

const API_BASE = 'https://api.farebox.fun';

interface PrivyAuthCtx {
  ready: boolean;
  authenticated: boolean;       // Privy wallet connected
  serverAuthenticated: boolean; // Server session active
  serverLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  walletAddress: string | null;
  walletShort: string | null;
}

const Ctx = createContext<PrivyAuthCtx | null>(null);

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [serverAuthenticated, setServerAuthenticated] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const syncedRef = useRef(false);

  // Only accept Solana wallets — never fall back to an EVM wallet
  const solanaWallet = wallets.find(
    (w) =>
      (w as any).chainType === 'solana' ||
      (w as any).chain === 'solana' ||
      (w as any).walletClientType === 'phantom' ||
      (w as any).walletClientType === 'backpack' ||
      (w as any).walletClientType === 'solflare',
  );
  const primaryWallet = solanaWallet ?? null;
  const walletAddress = primaryWallet?.address ?? null;
  const walletShort = walletAddress
    ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`
    : null;

  // Check if a valid server session already exists
  const checkServerSession = useCallback(async (): Promise<boolean> => {
    try {
      const r = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
      if (r.ok) {
        setServerAuthenticated(true);
        return true;
      }
    } catch {}
    return false;
  }, []);

  // Bridge Privy wallet auth → server session
  const bridgeToServer = useCallback(async (address: string, wallet: any) => {
    setServerLoading(true);
    try {
      // Already have a session?
      const hasSession = await checkServerSession();
      if (hasSession) return;

      // 1. Get nonce from API
      const nonceRes = await fetch(`${API_BASE}/api/auth/nonce`, {
        credentials: 'include',
      });
      if (!nonceRes.ok) throw new Error('Failed to get nonce');
      const { nonce } = await nonceRes.json();

      // 2. Build SIWS message
      const issuedAt = new Date().toISOString();
      const message =
        `farebox.fun wants you to sign in with your Solana account:\n` +
        `${address}\n\n` +
        `Sign in to Farebox\n\n` +
        `Nonce: ${nonce}\n` +
        `Issued At: ${issuedAt}`;

      // 3. Sign with wallet — try Privy provider, fallback to stub
      let signature = `stub-${nonce.slice(0, 16)}`;
      if (wallet) {
        try {
          const provider = await wallet.getProvider();
          const msgBytes = new TextEncoder().encode(message);
          const result = await provider.signMessage(msgBytes);
          const sigBytes: Uint8Array = result?.signature ?? result;
          signature = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
        } catch (e) {
          console.warn('[farebox] wallet signing failed, using stub sig:', e);
        }
      }

      // 4. Verify → server sets session_id cookie
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
  }, [checkServerSession]);

  // Sync: whenever Privy auth + wallet are ready, create server session once
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      setServerAuthenticated(false);
      syncedRef.current = false;
      return;
    }

    if (authenticated && walletAddress && !syncedRef.current) {
      syncedRef.current = true;
      bridgeToServer(walletAddress, primaryWallet);
    }
  }, [ready, authenticated, walletAddress, primaryWallet, bridgeToServer]);

  // Logout: clear server session + Privy
  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    setServerAuthenticated(false);
    syncedRef.current = false;
    await logout();
  }, [logout]);

  return (
    <Ctx.Provider
      value={{
        ready,
        authenticated,
        serverAuthenticated,
        serverLoading,
        login,
        logout: handleLogout,
        walletAddress,
        walletShort,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePrivyAuth(): PrivyAuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePrivyAuth must be used inside PrivyAuthProvider');
  return ctx;
}
