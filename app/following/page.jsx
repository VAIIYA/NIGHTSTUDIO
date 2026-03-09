'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_CREATORS } from '../../lib/mockData';
import CreatorCard from '../../components/CreatorCard';

export default function FollowingPage() {
  const { subscriptions } = useApp();
  const followed = MOCK_CREATORS.filter(c => subscriptions.has(c.wallet_address));
  useEffect(() => { document.title = 'NIGHTSTUDIO — Following'; }, []);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 0' }} className="fade-up">
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Following</h1>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>{followed.length} creators</div>
      {followed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: 20, color: 'var(--text-secondary)', marginBottom: 8 }}>Not following anyone yet</div>
          <div style={{ fontSize: 14, marginBottom: 20 }}>Discover creators and follow them to see their content</div>
          <Link href="/discover" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 999, background: 'var(--gradient-orange)', color: 'white', fontWeight: 700, fontFamily: 'var(--font-jakarta)', fontSize: 14 }}>Discover Creators</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {followed.map(c => <CreatorCard key={c.id} creator={c} />)}
        </div>
      )}
    </div>
  );
}
