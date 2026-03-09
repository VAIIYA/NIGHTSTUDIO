'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TrendingUp, Search, X, Users, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function RightSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { toggleFollow, subscriptions } = useApp();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          // Query creators table: display_name ILIKE %query% OR bio ILIKE %query% OR tags @> [query]
          // Note: tags @> [query] is not directly available in standard JS client for text search easily without array syntax
          // We'll use the 'cs' (contains) filter or ILIKE for tags if they are text
          const { data, error } = await supabase
            .from('creators')
            .select('*')
            .or(`display_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
            .limit(6);

          if (data) setSearchResults(data);
          setShowDropdown(true);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setShowDropdown(false); });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <aside style={{ width: 320, flexShrink: 0, padding: '24px 20px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', borderLeft: '1px solid #E8E8E8', background: 'white' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: 24 }} ref={dropdownRef}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9FA6AE' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search creators..."
            onFocus={() => searchQuery.length > 1 && setShowDropdown(true)}
            style={{ paddingLeft: 44, paddingRight: 40, borderRadius: 100, background: '#F8F8F8', border: '1px solid #E8E8E8', height: 44 }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9FA6AE', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', marginTop: 8, borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #E8E8E8', overflow: 'hidden', zIndex: 100 }}>
            {isSearching ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#9FA6AE', fontSize: 13 }}>Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(c => (
                <Link key={c.id} href={`/creator/${c.wallet_address}`} onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F8F8F8', textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F8F8F8'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <img src={c.avatar_url || 'https://via.placeholder.com/150'} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#24272A', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.display_name}</span>
                      {c.is_verified && <CheckCircle size={12} color="#037DD6" fill="#037DD6" />}
                    </div>
                    <div style={{ fontSize: 12, color: '#6A737D', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>#{c.tags?.[0]}</span>
                      <span>•</span>
                      <span>{c.follower_count || 0} followers</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#9FA6AE', fontSize: 13 }}>No creators found.</div>
            )}
          </div>
        )}
      </div>

      {/* Trending */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={16} color="#F6851B" />
          <span style={{ fontWeight: 800, fontSize: 15, color: '#24272A' }}>Trends for you</span>
        </div>
        {['#web3creative', '#solana', '#digitalart', '#lifestyle', '#gaming'].map((tag, i) => (
          <div key={tag} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid #F8F8F8' : 'none' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#24272A' }}>{tag}</div>
              <div style={{ fontSize: 11, color: '#6A737D' }}>{Math.floor(Math.random() * 500 + 100)}K posts</div>
            </div>
            <div style={{ fontSize: 12, color: '#F6851B', fontWeight: 800 }}>↑ {i + 1}</div>
          </div>
        ))}
      </div>

      {/* Suggested */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#24272A', marginBottom: 16 }}>Suggested Creators</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Placeholder for suggested creators, use some from mockData if available or just empty for now */}
          <div style={{ textAlign: 'center', padding: '12px', border: '1px dashed #E8E8E8', borderRadius: 8, color: '#9FA6AE', fontSize: 12 }}>
            Follow creators to see suggestions.
          </div>
        </div>
        <Link href="/discover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', marginTop: 16, padding: '10px', borderRadius: 100, color: '#F6851B', fontSize: 13, fontWeight: 700, background: '#FFF4EB', textDecoration: 'none' }}>
          Show more <ArrowRight size={14} />
        </Link>
      </div>

      {/* Legal/Footer */}
      <div style={{ padding: '0 8px', display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: 12, color: '#9FA6AE' }}>
        <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Terms of Service</a>
        <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy Policy</a>
        <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Cookie Policy</a>
        <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Accessibility</a>
        <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Ads info</a>
        <span>© 2026 NIGHTSTUDIO</span>
      </div>
    </aside>
  );
}

function CheckCircle({ size, color, fill }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
