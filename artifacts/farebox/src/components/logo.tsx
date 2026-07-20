import React from 'react';

interface LogoProps {
  /** Height of the logo mark in px (default 28) */
  size?: number;
  /** Show "FAREBOX" wordmark next to the icon (default true) */
  wordmark?: boolean;
  className?: string;
}

export function Logo({ size = 28, wordmark = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Neo Brutalism logo mark: rounded square, black border, hard shadow */}
      <img
        src="/logo.png"
        alt="Farebox logo"
        width={size}
        height={size}
        className="object-cover shrink-0"
        style={{
          borderRadius: Math.round(size * 0.25),
          border: '2px solid #1A1A1A',
          boxShadow: '2px 2px 0 #1A1A1A',
          display: 'block',
        }}
      />
      {wordmark && (
        <span
          className="font-black tracking-tight leading-none"
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontWeight: 900,
            fontSize: size * 0.85,
            color: '#1A1A1A',
          }}
        >
          FAREBOX
        </span>
      )}
    </span>
  );
}
