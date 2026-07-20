import React from 'react';
import { Link } from 'wouter';
import { useListModels, useGetBalance } from '@workspace/api-client-react';
import { Send, TerminalSquare, ArrowLeft, Bot, User, Trash2, AlertTriangle } from 'lucide-react';

const API_BASE = 'https://api.farebox.fun';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  cost?: number;
  error?: boolean;
}

export default function Playground() {
  const { data: models, isLoading: modelsLoading } = useListModels();
  const { data: balance, refetch: refetchBalance } = useGetBalance();
  const [selectedModel, setSelectedModel] = React.useState<string>('');
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);

  const bottomRef = React.useRef<HTMLDivElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Pick default model — honour ?model= URL param if present
  React.useEffect(() => {
    if (!models || models.length === 0 || selectedModel) return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('model');
    const def =
      (fromUrl && models.find(m => m.id === fromUrl)) ||
      models.find(m => m.id === 'anthropic/claude-sonnet-5') ||
      models.find(m => m.id.includes('claude-sonnet')) ||
      models.find(m => m.id.includes('gpt-4o-mini')) ||
      models[0];
    setSelectedModel(def.id);
  }, [models, selectedModel]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel || isStreaming) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsStreaming(true);

    // Placeholder for streaming assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/v1/chat/completions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...messages
              .filter(m => m.content)
              .map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg },
          ],
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
        const errMsg = err?.error?.message ?? 'Request failed';
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: errMsg, error: true };
          return next;
        });
        setIsStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const chunk = JSON.parse(data);
            if (chunk.error) {
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: 'assistant',
                  content: chunk.error.message,
                  error: true,
                };
                return next;
              });
              break;
            }
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: fullText };
                return next;
              });
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        // user cancelled
      } else {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: 'Connection error. Check your network.',
            error: true,
          };
          return next;
        });
      }
    } finally {
      setIsStreaming(false);
      refetchBalance();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const clearChat = () => setMessages([]);

  const noBalance = balance && balance.balanceUsd < 0.001;

  return (
    <div className="flex flex-col h-screen" style={{ background: '#FFFBEF', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <header className="flex-none h-16 flex items-center justify-between px-4 md:px-6 z-10"
        style={{ background: 'white', borderBottom: '2.5px solid #1A1A1A', boxShadow: '0 4px 0 #1A1A1A' }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 transition-all nb-btn nb-btn-outline nb-btn-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="font-black text-xl tracking-tight uppercase flex items-center gap-2"
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
            <TerminalSquare className="w-5 h-5" style={{ color: '#7C3AED' }} />
            Playground
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Balance badge */}
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Balance</span>
            <span className="font-bold font-mono text-sm nb-badge" style={{ color: '#7C3AED', borderColor: '#7C3AED', background: '#7C3AED18' }}>
              {balance ? `$${balance.balanceUsd.toFixed(4)}` : '...'}
            </span>
          </div>
          {/* Model selector */}
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="nb-input"
            style={{ maxWidth: 260, fontFamily: "'Space Mono', monospace", fontSize: 12, padding: '0.375rem 0.75rem' }}
            disabled={modelsLoading}
          >
            {modelsLoading ? (
              <option>Loading models...</option>
            ) : (
              models?.map(m => (
                <option key={m.id} value={m.id}>{m.id}</option>
              ))
            )}
          </select>
        </div>
      </header>

      {/* Low balance warning */}
      {noBalance && (
        <div className="flex-none px-6 py-2 flex items-center gap-2 text-xs font-mono"
          style={{ background: '#FFD93D', borderBottom: '2px solid #1A1A1A', color: '#1A1A1A' }}>
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Insufficient balance. Top up USDC to continue.
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 nb-dot-bg">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <div className="nb-card p-8 flex flex-col items-center" style={{ background: 'white' }}>
                <div className="w-16 h-16 flex items-center justify-center mb-4"
                  style={{ background: '#7C3AED22', border: '2.5px solid #7C3AED', borderRadius: 12, boxShadow: '3px 3px 0 #7C3AED' }}>
                  <TerminalSquare className="w-8 h-8" style={{ color: '#7C3AED' }} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest mb-2"
                  style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#1A1A1A' }}>
                  Send a message
                </h2>
                <p className="font-mono text-sm max-w-md" style={{ color: '#6B7280' }}>
                  Test prompts against any model. Cost is metered live from your USDC balance.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ background: '#7C3AED', border: '2.5px solid #1A1A1A', borderRadius: 10, boxShadow: '3px 3px 0 #1A1A1A' }}>
                    <Bot className="w-5 h-5" style={{ color: 'white' }} />
                  </div>
                )}

                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className="p-4"
                    style={
                      msg.role === 'user'
                        ? { background: '#7C3AED', color: 'white', border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A' }
                        : msg.error
                        ? { background: '#FF6B6B18', color: '#AA1111', border: '2.5px solid #FF6B6B', borderRadius: 12, boxShadow: '4px 4px 0 #FF6B6B' }
                        : { background: 'white', color: '#1A1A1A', border: '2.5px solid #1A1A1A', borderRadius: 12, boxShadow: '4px 4px 0 #1A1A1A' }
                    }
                  >
                    {msg.content
                      ? <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                      : <div className="flex gap-1 items-center h-5">
                          <div className="w-2 h-2 animate-bounce [animation-delay:-0.3s]" style={{ background: '#7C3AED', borderRadius: 2 }} />
                          <div className="w-2 h-2 animate-bounce [animation-delay:-0.15s]" style={{ background: '#7C3AED', borderRadius: 2 }} />
                          <div className="w-2 h-2 animate-bounce" style={{ background: '#7C3AED', borderRadius: 2 }} />
                        </div>
                    }
                  </div>
                  {msg.cost !== undefined && (
                    <div className="mt-2 nb-badge text-[10px]" style={{ color: '#6B7280' }}>
                      Cost: ${msg.cost.toFixed(6)}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ background: '#FFD93D', border: '2.5px solid #1A1A1A', borderRadius: 10, boxShadow: '3px 3px 0 #1A1A1A' }}>
                    <User className="w-5 h-5" style={{ color: '#1A1A1A' }} />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 md:p-6 relative z-10"
        style={{ background: 'white', borderTop: '2.5px solid #1A1A1A' }}>
        <div className="max-w-3xl mx-auto relative">
          {/* Action buttons above input */}
          <div className="absolute -top-12 right-0 flex gap-2">
            {isStreaming && (
              <button
                onClick={handleStop}
                className="nb-btn nb-btn-coral nb-btn-sm"
              >
                Stop
              </button>
            )}
            {messages.length > 0 && !isStreaming && (
              <button
                onClick={clearChat}
                className="nb-btn nb-btn-outline nb-btn-sm"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={noBalance ? 'Top up balance to chat…' : 'Enter a prompt…'}
              disabled={!!noBalance || isStreaming}
              className="flex-1 nb-input"
              style={{ padding: '0.875rem 1rem', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming || !!noBalance}
              className="nb-btn nb-btn-primary"
              style={{ padding: '0 1.5rem' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
