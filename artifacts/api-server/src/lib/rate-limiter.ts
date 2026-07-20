/**
 * Simple in-memory sliding-window rate limiter.
 * Tracks request timestamps per API key ID within a 60s window.
 */

const windows = new Map<string, number[]>();

export function checkRateLimit(apiKeyId: string, limitRpm: number | null): boolean {
  if (!limitRpm) return true; // no limit set

  const now = Date.now();
  const windowMs = 60_000;
  const cutoff = now - windowMs;

  let timestamps = windows.get(apiKeyId) ?? [];
  timestamps = timestamps.filter((t) => t > cutoff);
  timestamps.push(now);
  windows.set(apiKeyId, timestamps);

  return timestamps.length <= limitRpm;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, ts] of windows.entries()) {
    const fresh = ts.filter((t) => t > cutoff);
    if (fresh.length === 0) windows.delete(key);
    else windows.set(key, fresh);
  }
}, 5 * 60_000);
