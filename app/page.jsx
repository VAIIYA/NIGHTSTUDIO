'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Users, TrendingUp } from 'lucide-react';
import { MOCK_CREATORS, generatePosts } from '../lib/mockData';
import PostCard from '../components/PostCard';
import CreatorCard from '../components/CreatorCard';
import { useApp } from '../context/AppContext';

const TABS = [
  { id: 'foryou', label: 'For You', icon: Sparkles },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'top', label: 'Top Creators', icon: TrendingUp },
];

export default function HomePage() {
  const [tab, setTab] = useState('foryou');
  const { subscriptions } = useApp();

  const feedPosts = MOCK_CREATORS.flatMap(c => generatePosts(c.id, 3).map(p => ({ ...p, creator: c }))).sort(() => Math.random() - 0.5).slice(0, 12);
  const followingPosts = MOCK_CREATORS.filter(c => subscriptions.has(c.wallet_address)).flatMap(c => generatePosts(c.id, 4).map(p => ({ ...p, creator: c })));
  const topCreators = [...MOCK_CREATORS].sort((a, b) => b.followersCount - a.followersCount);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 0' }} className="fade-up">
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '12px 8px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? 'var(--accent)' : 'transparent'}`, color: tab === id ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: tab === id ? 700 : 400, fontSize: 14, fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.12s' }}>
            <Icon size={14} color={tab === id ? 'var(--accent)' : 'currentColor'} /> {label}
          </button>
        ))}
      </div>

      {tab === 'foryou' && (
        <>
          {/* Stories */}
          <div className="scroll-x" style={{ display: 'flex', gap: 14, paddingBottom: 12, marginBottom: 20 }}>
            {MOCK_CREATORS.map(c => (
              <Link key={c.id} href={`/@/${c.wallet_address}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 58, height: 58, borderRadius: '50%', padding: 2, background: 'var(--gradient-orange)' }}>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: '50%', padding: 2, height: '100%' }}>
                    <img src={c.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 58, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.display_name.split(' ')[0]}</span>
              </Link>
            ))}
          </div>
          {feedPosts.map(p => <PostCard key={p.id} post={p} creator={p.creator} />)}
        </>
      )}

      {tab === 'following' && (
        followingPosts.length === 0
          ? <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Users size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
              <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>Not following anyone</div>
              <Link href="/discover" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 999, background: 'var(--gradient-orange)', color: 'white', fontWeight: 700, fontFamily: 'var(--font-jakarta)', fontSize: 14 }}>Discover Creators</Link>
            </div>
          : followingPosts.map(p => <PostCard key={p.id} post={p} creator={p.creator} />)
      )}

      {tab === 'top' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {topCreators.map(c => <CreatorCard key={c.id} creator={c} />)}
        </div>
      )}
    </div>
  );
}
