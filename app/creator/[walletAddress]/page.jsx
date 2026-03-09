'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle, Share2, MessageCircle,
  Lock, Copy, CheckCheck, LayoutGrid,
  Info, Calendar, Users, Zap, Loader2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/Toast';
import WalletConnect from '../../../components/WalletConnect';
import Link from 'next/link';

function ProfileSkeleton() {
  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
      <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: '0 0 12px 12px' }} />
      <div style={{ padding: '0 24px' }}>
        <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%', marginTop: -50, border: '4px solid white' }} />
        <div className="skeleton" style={{ width: 200, height: 24, marginTop: 16 }} />
        <div className="skeleton" style={{ width: 150, height: 16, marginTop: 8 }} />
        <div className="skeleton" style={{ width: '100%', height: 60, marginTop: 16 }} />
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const { walletAddress } = useParams();
  const { subscriptions, toggleFollow, isConnected, wallet: connectedWallet } = useApp();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('posts');
  const [copied, setCopied] = useState(false);

  const isFollowing = subscriptions.has(walletAddress);
  const isOwner = connectedWallet === walletAddress;

  const fetchCreator = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (data) {
        setCreator(data);

        // Fetch posts
        const { data: creatorPosts } = await supabase
          .from('posts')
          .select('*')
          .eq('creator_id', data.id)
          .order('created_at', { ascending: false });

        setPosts(creatorPosts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreator();
  }, [walletAddress]);

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Address copied to clipboard');
  };

  const handleFollow = async () => {
    if (!isConnected) return;
    toggleFollow(creator.id, walletAddress);
  };

  if (loading) return <ProfileSkeleton />;

  if (!creator) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Creator Not Found</h2>
        <p style={{ color: '#6A737D', maxWidth: 360, marginBottom: 32 }}>We couldn't find a creator with this wallet address.</p>
        <Link href="/discover" className="btn-secondary" style={{ textDecoration: 'none' }}>Discover Creators</Link>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
      {/* Banner */}
      <div style={{ position: 'relative', width: '100%', height: 200, background: creator.cover_url ? `url(${creator.cover_url})` : '#F2F4F6', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '0 0 16px 16px' }}>
        <div style={{ position: 'absolute', bottom: -50, left: 32, width: 100, height: 100, borderRadius: '50%', background: 'white', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <img src={creator.avatar_url || 'https://via.placeholder.com/150'} alt={creator.display_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Profile Details */}
      <div style={{ padding: '60px 32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#24272A', display: 'flex', alignItems: 'center', gap: 8 }}>
              {creator.display_name}
              {creator.is_verified && <CheckCircle size={20} color="#037DD6" fill="#037DD6" />}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <code style={{ color: '#6A737D', fontSize: 13, background: '#F8F8F8', padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace' }}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </code>
              <button onClick={copyWallet} style={{ background: 'none', border: 'none', color: '#9FA6AE', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {copied ? <CheckCheck size={14} color="#28A745" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {!isOwner && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" style={{ width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={18} />
              </button>
              <button
                onClick={handleFollow}
                className={isFollowing ? 'btn-secondary' : 'btn-primary'}
                style={{ minWidth: 120, height: 44 }}
              >
                {isFollowing ? 'Following' : `Subscribe · ${creator.subscription_price} USDC`}
              </button>
            </div>
          )}

          {isOwner && (
            <Link href="/profile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              Edit Profile
            </Link>
          )}
        </div>

        <p style={{ fontSize: 16, color: '#24272A', lineHeight: 1.6, marginBottom: 20 }}>
          {creator.bio || 'No bio yet.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {creator.tags?.map(tag => (
            <span key={tag} style={{ padding: '4px 12px', borderRadius: 999, background: '#F8F8F8', border: '1px solid #E8E8E8', fontSize: 13, color: '#6A737D' }}>
              #{tag}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, borderTop: '1px solid #E8E8E8', borderBottom: '1px solid #E8E8E8', padding: '16px 0' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#24272A' }}>{creator.follower_count || 0}</div>
            <div style={{ fontSize: 13, color: '#6A737D' }}>Followers</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#24272A' }}>{creator.post_count || 0}</div>
            <div style={{ fontSize: 13, color: '#6A737D' }}>Posts</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E8E8E8', padding: '0 32px' }}>
        <button onClick={() => setTab('posts')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: tab === 'posts' ? '3px solid #F6851B' : '3px solid transparent', color: tab === 'posts' ? '#F6851B' : '#6A737D', fontWeight: tab === 'posts' ? 800 : 600, fontSize: 15, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <LayoutGrid size={18} /> Posts
        </button>
        <button onClick={() => setTab('about')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: tab === 'about' ? '3px solid #F6851B' : '3px solid transparent', color: tab === 'about' ? '#F6851B' : '#6A737D', fontWeight: tab === 'about' ? 800 : 600, fontSize: 15, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Info size={18} /> About
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '24px 32px' }}>
        {tab === 'posts' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {posts.map(post => {
              const isLocked = !isFollowing && !isOwner && post.is_locked;
              return (
                <div key={post.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ position: 'relative', paddingTop: '56.25%', background: '#F8F8F8' }}>
                    {post.media_url && !isLocked ? (
                      <img src={post.media_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={40} color="#E8E8E8" />
                      </div>
                    )}
                    {isLocked && (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#24272A' }}>
                        <Lock size={24} style={{ marginBottom: 8 }} />
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{post.unlock_price} USDC</div>
                        <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 12, marginTop: 12 }}>Unlock Post</button>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#24272A' }}>{post.title}</div>
                    <div style={{ color: '#6A737D', fontSize: 13, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
                    <div style={{ display: 'flex', gap: 16, color: '#6A737D', fontSize: 13 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Likes {post.like_count || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Comments {post.comment_count || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {posts.length === 0 && (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px 0', color: '#9FA6AE' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
                <div>No posts found.</div>
              </div>
            )}
          </div>
        )}

        {tab === 'about' && (
          <div style={{ background: '#F8F8F8', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h4 style={{ fontSize: 14, color: '#6A737D', fontWeight: 600, marginBottom: 8 }}>BIO</h4>
                <p style={{ fontSize: 15, color: '#24272A', lineHeight: 1.6 }}>{creator.bio || 'Not provided.'}</p>
              </div>
              <div style={{ display: 'flex', gap: 40 }}>
                <div>
                  <h4 style={{ fontSize: 14, color: '#6A737D', fontWeight: 600, marginBottom: 8 }}>JOINED</h4>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{new Date(creator.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <h4 style={{ fontSize: 14, color: '#6A737D', fontWeight: 600, marginBottom: 8 }}>SUBSCRIBERS</h4>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{creator.follower_count || 0} fans</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  );
}
