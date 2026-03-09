'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Users, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  const { isConnected, wallet, subscriptions } = useApp();
  const [posts, setPosts] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'foryou') {
        // Fetch recent posts with creator info
        const { data, error } = await supabase
          .from('posts')
          .select('*, creator:creators(*)')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setPosts(data || []);

        // Fetch some creators for the stories/bar
        const { data: creatorData } = await supabase
          .from('creators')
          .select('*')
          .limit(10);
        setCreators(creatorData || []);
      }

      else if (tab === 'following') {
        if (!isConnected || !wallet) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // Get followed creator IDs
        const { data: follows } = await supabase
          .from('follows')
          .select('creator_id')
          .eq('follower_wallet', wallet);

        if (follows && follows.length > 0) {
          const ids = follows.map(f => f.creator_id);
          const { data, error } = await supabase
            .from('posts')
            .select('*, creator:creators(*)')
            .in('creator_id', ids)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setPosts(data || []);
        } else {
          setPosts([]);
        }
      }

      else if (tab === 'top') {
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .order('follower_count', { ascending: false })
          .limit(20);

        if (error) throw error;
        setCreators(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab, isConnected, wallet]);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 0' }} className="fade-up">
      {/* Stories / Spotlight */}
      {tab === 'foryou' && creators.length > 0 && (
        <div className="scroll-x" style={{ display: 'flex', gap: 16, paddingBottom: 16, marginBottom: 24, paddingLeft: 4 }}>
          {creators.map(c => (
            <Link key={c.id} href={`/creator/${c.wallet_address}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' }}>
              <div style={{ padding: 3, borderRadius: '50%', background: 'linear-gradient(45deg, #F6851B, #FFB370)' }}>
                <div style={{ padding: 2, background: 'white', borderRadius: '50%' }}>
                  <img
                    src={c.avatar_url || 'https://via.placeholder.com/150'}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#24272A', maxWidth: 64, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.display_name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E8E8E8', marginBottom: 24 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, padding: '14px 8px', background: 'none', border: 'none',
              borderBottom: tab === id ? '3px solid #F6851B' : '3px solid transparent',
              color: tab === id ? '#F6851B' : '#6A737D',
              fontWeight: tab === id ? 800 : 500, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 400, borderRadius: 16 }} />
          ))}
        </div>
      ) : (
        <>
          {tab !== 'top' ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {posts.map(p => <PostCard key={p.id} post={p} creator={p.creator} />)}

              {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 20px', background: '#F8F8F8', borderRadius: 24 }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>No posts yet</h3>
                  <p style={{ color: '#6A737D', marginTop: 8 }}>
                    {tab === 'following' ? "You aren't following anyone who has posted yet." : "Be the first to see new content here!"}
                  </p>
                  {tab === 'following' && (
                    <Link href="/discover" className="btn-primary" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none', padding: '10px 24px' }}>
                      Discover Creators
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {creators.map(c => <CreatorCard key={c.id} creator={c} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
