'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { MOCK_CREATORS } from '../../lib/mockData';
import CreatorCard from '../../components/CreatorCard';

const CATS = ['All','Lifestyle','Fitness','Fashion','Beauty','Art','Aesthetic','Travel','Free'];

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('popular');
  useEffect(() => { document.title = 'NIGHTSTUDIO — Discover'; }, []);

  const filtered = MOCK_CREATORS.filter(c => {
    const ms = c.display_name.toLowerCase().includes(search.toLowerCase()) || c.bio?.toLowerCase().includes(search.toLowerCase());
    const mc = cat === 'All' || (cat === 'Free' ? c.subscription_price_usdc === 0 : c.tags?.includes(cat.toLowerCase()));
    return ms && mc;
  }).sort((a, b) => sort === 'popular' ? b.followersCount - a.followersCount : 0);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 0' }} className="fade-up">
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Discover Creators</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creators..." style={{ paddingLeft: 38, borderRadius: 999 }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ borderRadius: 10, padding: '10px 14px', width: 'auto', cursor: 'pointer' }}>
          <option value="popular">Popular</option>
          <option value="new">Newest</option>
        </select>
      </div>
      <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 8, marginBottom: 24 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: '7px 16px', borderRadius: 999, border: `1.5px solid ${cat === c ? 'var(--accent)' : 'var(--border)'}`, background: cat === c ? 'var(--accent-dim)' : 'transparent', color: cat === c ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, fontWeight: cat === c ? 700 : 400, flexShrink: 0, fontFamily: 'var(--font-jakarta)', transition: 'all 0.12s' }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{filtered.length} creators found</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered.map(c => <CreatorCard key={c.id} creator={c} />)}
      </div>
    </div>
  );
}
