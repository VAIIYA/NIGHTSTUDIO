'use client';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { MOCK_CREATORS } from '../lib/mockData';
import { truncateWallet } from '../lib/solana';
import { useApp } from '../context/AppContext';

export default function RightSidebar() {
  const [search, setSearch] = useState('');
  const { subscriptions, subscribe } = useApp();
  const suggested = MOCK_CREATORS.slice(0, 4);

  return (
    <aside style={{ width: 290, flexShrink: 0, padding: '20px 16px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creators..." style={{ marginBottom: 16, borderRadius: 999 }} />

      {/* Trending */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TrendingUp size={15} color="var(--accent)" />
          <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 14 }}>Trending</span>
        </div>
        {['#lifestyle', '#aesthetic', '#fitness', '#fashion', '#art'].map((tag, i) => (
          <div key={tag} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{tag}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{Math.floor(Math.random() * 500 + 100)}K posts</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>↑ {i + 1}</div>
          </div>
        ))}
      </div>

      {/* Suggested */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Suggested Creators</div>
        {suggested.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <Link href={`/@/${c.wallet_address}`}>
              <img src={c.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={`/@/${c.wallet_address}`} style={{ fontWeight: 600, fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.display_name}</Link>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{truncateWallet(c.wallet_address)}</div>
            </div>
            <button onClick={() => subscribe(c.wallet_address, c.subscription_price_usdc)} style={{ padding: '5px 12px', borderRadius: 999, border: subscriptions.has(c.wallet_address) ? '1px solid var(--border-light)' : 'none', background: subscriptions.has(c.wallet_address) ? 'transparent' : 'var(--gradient-orange)', color: subscriptions.has(c.wallet_address) ? 'var(--text-muted)' : 'white', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-jakarta)' }}>
              {subscriptions.has(c.wallet_address) ? '✓' : 'Follow'}
            </button>
          </div>
        ))}
        <Link href="/discover" style={{ display: 'block', textAlign: 'center', marginTop: 10, padding: '8px', borderRadius: 10, color: 'var(--accent)', fontSize: 13, fontWeight: 600, background: 'var(--accent-dim)' }}>
          Show more →
        </Link>
      </div>

      {/* Solana promo */}
      <div style={{ background: 'linear-gradient(135deg, rgba(246,133,27,0.1), rgba(3,125,214,0.08))', border: '1px solid rgba(246,133,27,0.25)', borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Payments on NIGHTSTUDIO</div>
        <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: 15, marginBottom: 6, background: 'var(--gradient-orange)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>USDC on Solana</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Lightning-fast payments. Near-zero fees. Creators keep 90%.</div>
      </div>
    </aside>
  );
}
