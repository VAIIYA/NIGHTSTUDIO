'use client';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Loader2, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CreatorCard from '../../components/CreatorCard';

const CATS = ['All', 'Art', 'Gaming', 'Music', 'Photography', 'Fashion', 'Lifestyle', 'Tech', 'Free'];

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState([]);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      let query = supabase.from('creators').select('*');

      if (cat !== 'All') {
        if (cat === 'Free') {
          query = query.eq('subscription_price', 0);
        } else {
          // Assuming tags is a text array
          query = query.contains('tags', [cat.toLowerCase()]);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data || [];

      // Client side search and sort (can be moved to server later for scale)
      if (search) {
        result = result.filter(c =>
          c.display_name.toLowerCase().includes(search.toLowerCase()) ||
          c.bio?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (sort === 'popular') {
        result.sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0));
      } else {
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setCreators(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
    document.title = 'NIGHTSTUDIO — Discover';
  }, [cat, sort]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCreators();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 0' }} className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#24272A', marginBottom: 8 }}>Discover</h1>
        <p style={{ color: '#6A737D' }}>Find and subscribe to the best Web3 creators.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9FA6AE' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search creators by name, bio, or tags..."
            style={{ paddingLeft: 48, borderRadius: 100, height: 48, background: '#F8F8F8', border: '1px solid #E8E8E8' }}
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ width: 'auto', borderRadius: 100, height: 48, padding: '0 20px', background: 'white', border: '1px solid #E8E8E8', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          <option value="popular">Most Popular</option>
          <option value="new">Newly Joined</option>
        </select>
      </div>

      <div className="scroll-x" style={{ display: 'flex', gap: 10, paddingBottom: 12, marginBottom: 24 }}>
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cat === c ? 'btn-primary' : 'btn-secondary'}
            style={{
              padding: '8px 20px',
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 14, color: '#9FA6AE', marginBottom: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutGrid size={16} /> {creators.length} Creators found
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {creators.map(c => <CreatorCard key={c.id} creator={c} />)}
          </div>

          {creators.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 24px', background: '#F8F8F8', borderRadius: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#24272A' }}>No creators found</h3>
              <p style={{ color: '#6A737D', marginTop: 8 }}>Try adjusting your search or filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
