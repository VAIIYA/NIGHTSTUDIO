'use client';
import Link from 'next/link';
export default function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 900, fontSize: 28, marginBottom: 8 }}>Page not found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This page doesn't exist on NIGHTSTUDIO.</p>
        <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 999, background: 'var(--gradient-orange)', color: 'white', fontWeight: 700, fontFamily: 'var(--font-jakarta)' }}>Go Home</Link>
      </div>
    </div>
  );
}
