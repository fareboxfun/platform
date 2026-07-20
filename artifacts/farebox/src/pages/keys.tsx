import React from 'react';
import { useListApiKeys, useCreateApiKey, useRevokeApiKey, getListApiKeysQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Keys() {
  const { data: keys, isLoading } = useListApiKeys();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newKeyData, setNewKeyData] = React.useState<{ label: string; rawKey: string } | null>(null);

  return (
    <div className="p-6 space-y-6 max-w-5xl pt-[58px]" style={{ background: '#FFFBEF', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono font-bold uppercase tracking-widest text-[#7C3AED] mb-1" style={{ fontSize: 10 }}>
            Account
          </div>
          <h1
            className="font-black uppercase"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, letterSpacing: '-0.01em' }}
          >
            API Keys
          </h1>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="nb-btn nb-btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Key
        </button>
      </div>

      {/* Table card */}
      <div
        style={{
          background: 'white',
          border: '2.5px solid #1A1A1A',
          borderRadius: 12,
          boxShadow: '4px 4px 0 #1A1A1A',
          overflow: 'hidden',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono whitespace-nowrap" style={{ fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#1A1A1A', borderBottom: '2.5px solid #1A1A1A' }}>
                {['Label', 'Prefix', 'Cap / Day', 'Created', 'Status', ''].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 font-bold uppercase tracking-widest text-white"
                    style={{ fontSize: 9 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-black/25 font-mono" style={{ fontSize: 10 }}>
                    Loading…
                  </td>
                </tr>
              ) : keys?.length ? keys.map(k => (
                <KeyRow key={k.id} apiKey={k} />
              )) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div
                      className="inline-block p-8"
                      style={{ border: '2px dashed rgba(26,26,26,0.2)', borderRadius: 10 }}
                    >
                      <div className="font-mono text-black/30 uppercase tracking-widest" style={{ fontSize: 10 }}>
                        No keys yet — create one to start
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info note */}
      <div
        className="font-mono text-black/40"
        style={{
          fontSize: 9,
          border: '2px solid rgba(26,26,26,0.12)',
          borderRadius: 10,
          background: 'rgba(26,26,26,0.03)',
          padding: '12px 16px',
        }}
      >
        Keys are stored as SHA-256 hashes. Raw value shown exactly once at creation.{' '}
        Prefix <code style={{ color: '#7C3AED' }}>sk-fbx-</code> is safe to share for support.
      </div>

      <CreateKeyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(label, rawKey) => { setIsCreateOpen(false); setNewKeyData({ label, rawKey }); }}
      />
      <NewKeyModal data={newKeyData} onClose={() => setNewKeyData(null)} />
    </div>
  );
}

function KeyRow({ apiKey }: { apiKey: any }) {
  const revoke = useRevokeApiKey();
  const qc = useQueryClient();
  const active = apiKey.status === 'active';

  return (
    <tr
      style={{
        borderBottom: '1.5px solid rgba(26,26,26,0.07)',
        opacity: active ? 1 : 0.4,
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#FFFBEF')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <td className="px-5 py-3 font-bold text-black/80">{apiKey.label}</td>
      <td className="px-5 py-3">
        <code
          style={{
            background: '#FFFBEF',
            border: '1.5px solid #1A1A1A',
            borderRadius: 6,
            boxShadow: '1.5px 1.5px 0 #1A1A1A',
            padding: '2px 8px',
            fontSize: 10,
          }}
        >
          {apiKey.prefix}••••••••
        </code>
      </td>
      <td className="px-5 py-3 text-black/50">
        {apiKey.dailyCapUsd ? `$${Number(apiKey.dailyCapUsd).toFixed(2)}` : '—'}
      </td>
      <td className="px-5 py-3 text-black/35">
        {new Date(apiKey.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-3">
        {active ? (
          <span
            className="inline-flex items-center gap-1.5 font-bold uppercase tracking-widest"
            style={{
              fontSize: 9,
              padding: '3px 10px',
              background: '#6BCB77',
              border: '1.5px solid #1A1A1A',
              borderRadius: 999,
              boxShadow: '2px 2px 0 #1A1A1A',
              color: '#1A1A1A',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A1A1A', display: 'inline-block' }} />
            Active
          </span>
        ) : (
          <span
            className="font-bold uppercase tracking-widest"
            style={{
              fontSize: 9,
              padding: '3px 10px',
              background: '#FF6B6B',
              border: '1.5px solid #1A1A1A',
              borderRadius: 999,
              boxShadow: '2px 2px 0 #1A1A1A',
              color: 'white',
            }}
          >
            Revoked
          </span>
        )}
      </td>
      <td className="px-5 py-3 text-right">
        {active && (
          <button
            onClick={() => {
              if (confirm(`Revoke "${apiKey.label}"? This cannot be undone.`)) {
                revoke.mutate({ id: apiKey.id }, {
                  onSuccess: () => qc.invalidateQueries({ queryKey: getListApiKeysQueryKey() })
                });
              }
            }}
            className="nb-btn nb-btn-coral nb-btn-sm"
            style={{ padding: '4px 8px' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}

function CreateKeyModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean; onClose: () => void;
  onSuccess: (label: string, rawKey: string) => void;
}) {
  const [label, setLabel] = React.useState('');
  const [cap, setCap] = React.useState('');
  const create = useCreateApiKey();
  const qc = useQueryClient();

  return (
    <Dialog open={isOpen} onOpenChange={o => !o && onClose()}>
      <DialogContent
        className="max-w-sm p-0 overflow-hidden"
        style={{
          border: '2.5px solid #1A1A1A',
          borderRadius: 12,
          boxShadow: '6px 6px 0 #1A1A1A',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ background: '#7C3AED', padding: '20px 24px' }}>
          <DialogTitle
            className="font-black uppercase tracking-wide text-white"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 22 }}
          >
            Create API Key
          </DialogTitle>
          <DialogDescription className="font-mono text-white/50 mt-1" style={{ fontSize: 11 }}>
            Key is shown once. Store it securely.
          </DialogDescription>
        </div>

        {/* Form */}
        <form
          className="space-y-5"
          style={{ padding: '24px', background: '#FFFBEF' }}
          onSubmit={e => {
            e.preventDefault();
            create.mutate({ data: { label, dailyCapUsd: cap ? parseFloat(cap) : null } }, {
              onSuccess: (data) => {
                qc.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
                onSuccess(data.apiKey.label, data.rawKey);
                setLabel(''); setCap('');
              }
            });
          }}
        >
          <div>
            <label
              className="block font-mono font-bold uppercase tracking-widest text-black/50 mb-2"
              style={{ fontSize: 9 }}
            >
              Label
            </label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Production agent, Testing…"
              required
              className="nb-input"
            />
          </div>
          <div>
            <label
              className="block font-mono font-bold uppercase tracking-widest text-black/50 mb-2"
              style={{ fontSize: 9 }}
            >
              Daily Cap (USD){' '}
              <span className="text-black/25 normal-case tracking-normal ml-1" style={{ fontWeight: 400 }}>
                optional
              </span>
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-black/40"
                style={{ fontSize: 14 }}
              >
                $
              </span>
              <input
                value={cap}
                onChange={e => setCap(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="Unlimited"
                className="nb-input"
                style={{ paddingLeft: 28 }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={create.isPending || !label}
            className="nb-btn nb-btn-primary w-full"
            style={{ opacity: create.isPending || !label ? 0.5 : 1 }}
          >
            {create.isPending ? 'Generating…' : 'Generate Key'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewKeyModal({ data, onClose }: { data: { label: string; rawKey: string } | null; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    if (data) {
      navigator.clipboard.writeText(data.rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={!!data} onOpenChange={o => !o && onClose()}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden"
        style={{
          border: '2.5px solid #1A1A1A',
          borderRadius: 12,
          boxShadow: '6px 6px 0 #1A1A1A',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ background: '#6BCB77', padding: '20px 24px' }}>
          <DialogTitle
            className="font-black uppercase tracking-wide text-black flex items-center gap-2"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 22 }}
          >
            <Check className="w-5 h-5" /> Key Generated!
          </DialogTitle>
          <DialogDescription className="font-mono text-black/50 mt-1" style={{ fontSize: 11 }}>
            This is the only time you'll see this key.
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="space-y-4" style={{ padding: '24px', background: '#FFFBEF' }}>
          <div>
            <div className="font-mono font-bold uppercase tracking-widest text-black/40 mb-2" style={{ fontSize: 9 }}>
              {data?.label}
            </div>
            <div
              className="font-mono break-all"
              style={{
                background: '#1A1A1A',
                border: '2px solid #1A1A1A',
                borderRadius: 8,
                padding: '12px',
                fontSize: 11,
                color: '#6BCB77',
                lineHeight: 1.6,
              }}
            >
              {data?.rawKey}
            </div>
          </div>
          <button
            onClick={copy}
            className="nb-btn nb-btn-black w-full"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Key'}
          </button>
          <button
            onClick={onClose}
            className="w-full font-mono text-black/35 hover:text-black uppercase tracking-widest transition-colors"
            style={{ fontSize: 10, paddingTop: 4 }}
          >
            I've saved it securely
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
