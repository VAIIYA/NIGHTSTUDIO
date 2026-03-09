'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import CreatorCard from '../../components/CreatorCard';
import WalletConnect from '../../components/WalletConnect';

export default function FollowingPage() {
  const { isConnected, wallet } = useApp();
  const [followed, setFollowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFollowed = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      // Get all follows for this user
      const { data: follows, error: followError } = await supabase
        .from('follows')
        .select('creator_id')
        .eq('follower_wallet', wallet);

      if (followError) throw followError;

      if (follows && follows.length > 0) {
        const creatorIds = follows.map(f => f.creator_id);
        const { data: creators, error: creatorError } = await supabase
          .from('creators')
          .select('*')
          .in('id', creatorIds);

        if (creatorError) throw creatorError;
        setFollowed(creators || []);
      } else {
        setFollowed([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) fetchFollowed();
    document.title = 'NIGHTSTUDIO — Following';
  }, [wallet, isConnected]);

  const filtered = followed.filter(c =>
    c.display_name.toLowerCase().includes(search.toLowerCase()) ||
    c.bio?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isConnected) return <WalletConnect message="Connect your wallet to see who you follow" />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 0' }} className="fade-up">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#24272A' }}>Following</h1>
        <p style={{ color: '#6A737D' }}>Creators you've subscribed to or followed.</p>
      </div>

      {followed.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9FA6AE' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter following list..."
            style={{ paddingLeft: 44, borderRadius: 100, background: '#F8F8F8', border: '1px solid #E8E8E8', height: 44 }}
          />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />)}
        </div>
      ) : followed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#F8F8F8', borderRadius: 24, border: '1px dashed #E8E8E8' }}>
          <div style={{ width: 64, height: 64, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <Users size={32} color="#F6851B" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#24272A', marginBottom: 8 }}>Not following anyone yet</h2>
          <p style={{ color: '#6A737D', marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>Discover amazing creators on NIGHTSTUDIO and follow them to see their exclusive content.</p>
          <Link href="/discover" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', padding: '12px 32px' }}>Explore Creators</Link>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: '#9FA6AE', marginBottom: 16, fontWeight: 600 }}>{filtered.length} Creators</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {filtered.map(c => <CreatorCard key={c.id} creator={c} />)}
          </div>
        </>
      )}
    </div>
  );
}
