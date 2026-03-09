import { Link } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { MOCK_CREATORS } from '../lib/mockData';
import CreatorCard from './CreatorCard';

import { useMediaQuery } from '../hooks/useMediaQuery';

export default function RightSidebar() {
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const [searchQuery, setSearchQuery] = useState('');
  const suggested = MOCK_CREATORS.slice(0, 5);

  if (!isDesktop) return null;

  return (
    <aside style={{
      width: '300px',
      flexShrink: 0,
      padding: '20px 16px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={15} style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }} />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search creators..."
          style={{ paddingLeft: '38px', borderRadius: '999px', fontSize: '14px' }}
        />
      </div>

      {/* Trending */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <TrendingUp size={16} color="var(--accent)" />
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px' }}>Trending</span>
        </div>
        {['#lifestyle', '#aesthetic', '#fitness', '#fashion', '#art'].map((tag, i) => (
          <div key={tag} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{tag}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(Math.random() * 500 + 100).toFixed(0)}K posts</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>↑ {i + 1}</div>
          </div>
        ))}
      </div>

      {/* Suggested creators */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px' }}>Suggested Creators</span>
        </div>
        {suggested.map(creator => (
          <CreatorCard key={creator.id} creator={creator} compact />
        ))}
        <Link to="/discover" style={{
          display: 'block', textAlign: 'center', marginTop: '8px',
          padding: '8px', borderRadius: '10px',
          color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
          background: 'var(--accent-dim)',
          transition: 'filter 0.12s',
        }}>
          Show more →
        </Link>
      </div>

      {/* Solana promo */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(153,69,255,0.12), rgba(20,241,149,0.08))',
        border: '1px solid rgba(153,69,255,0.3)',
        borderRadius: '16px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Coming Soon</div>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>
          <span style={{ background: 'linear-gradient(135deg, #9945ff, #14f195)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Solana Payments
          </span>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Pay for exclusive content instantly with SOL. Lightning fast, near-zero fees.
        </div>
      </div>
    </aside>
  );
}
