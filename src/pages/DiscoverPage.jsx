import { useState, useEffect } from 'react';
import { Search, MapPin, Users, Heart, Star, LayoutGrid, List } from 'lucide-react';
import { MOCK_CREATORS } from '../lib/mockData';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Lifestyle', 'Fitness', 'Fashion', 'Beauty', 'Art', 'Travel'];

import { useMediaQuery } from '../hooks/useMediaQuery';

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    document.title = 'Bunny Ranch — Discover';
  }, []);

  return (
    <div style={{ padding: isMobile ? '0' : '20px 0' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: isMobile ? '24px' : '28px', marginBottom: '8px' }}>Discover</h1>
        <p style={{ color: 'var(--text-muted)' }}>Find your next favorite creators</p>
      </header>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: isMobile ? '20px' : '32px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search creators..."
          style={{ width: '100%', padding: '16px 16px 16px 52px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '16px' }}
        />
      </div>

      {/* Categories */}
      <div
        className="scroll-x-mobile"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '32px',
          marginLeft: isMobile ? '-12px' : '0',
          marginRight: isMobile ? '-12px' : '0',
          paddingLeft: isMobile ? '12px' : '0',
          paddingRight: isMobile ? '12px' : '0',
        }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: '1.5px solid var(--border)',
              background: activeCategory === cat ? 'var(--accent)' : 'transparent',
              color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'Syne'
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Featured Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
        {MOCK_CREATORS.map(creator => (
          <div
            key={creator.id}
            onClick={() => navigate(`/@/${creator.username}`)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ height: '140px', background: 'var(--bg-hover)', position: 'relative' }}>
              <img src={`https://images.unsplash.com/photo-1579540673398-9fdd95019387?w=400&q=80&seed=${creator.username}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '-24px', left: '16px' }}>
                <img src={creator.avatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '16px', border: '4px solid var(--bg-card)', background: 'var(--bg-secondary)' }} />
              </div>
            </div>
            <div style={{ padding: '32px 16px 16px' }}>
              <div style={{ fontWeight: 800, fontFamily: 'Syne', fontSize: '16px', marginBottom: '4px' }}>{creator.displayName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>@{creator.username}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} color="var(--accent)" fill="var(--accent)" /> 4.9</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} color="#f43f5e" /> 12k</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
