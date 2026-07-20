import React from 'react';
import { useGetAuthNonce, useVerifyAuth } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetMeQueryKey } from '@workspace/api-client-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ConnectWalletModal({ isOpen }: { isOpen: boolean }) {
  const [wallet, setWallet] = React.useState('');
  const queryClient = useQueryClient();
  const verifyAuth = useVerifyAuth();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    // Simulate getting a nonce and signing
    // We'll just fetch nonce and use a fake signature
    try {
      const response = await fetch('/api/auth/nonce');
      const data = await response.json();
      
      verifyAuth.mutate(
        {
          data: {
            walletAddress: wallet,
            nonce: data.nonce,
            signature: "simulated-signature-12345"
          }
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          }
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold uppercase tracking-tight">Connect Wallet</DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Farebox requires a Solana wallet to manage API keys and balance.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleConnect} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider">Simulated Wallet Address</label>
            <input 
              type="text" 
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              placeholder="Enter any address (e.g. 7o2...)"
              className="w-full px-4 py-3 border border-black font-mono focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={verifyAuth.isPending}
            className="w-full py-3 px-4 bg-primary text-white font-bold tracking-widest uppercase border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50"
          >
            {verifyAuth.isPending ? 'Connecting...' : 'Connect (Simulated)'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
