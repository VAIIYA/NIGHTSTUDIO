import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Share2, MessageCircle, Edit3, X, Save,
  CheckCircle, Copy, Check, Lock,
  Zap, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getUserByWallet, getCreatorPosts, updateUserProfile } from '../lib/db';
import { truncateWallet } from '../lib/solana';
import { formatCount, generatePosts } from '../lib/mockData';
import WalletConnect from '../components/WalletConnect';
import PostCard from '../components/PostCard';
import { useMediaQuery } from '../hooks/useMediaQuery';

const mockCreator = {
  displayName: "Bunny Queen",
  bio: "Lifestyle, Fashion & Travel. Sub for exclusive content! 🐰✨",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bunny",
  banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  followersCount: 12500,
  postsCount: 142,
  subscriptionPriceUsdc: 9.99,
  isVerified: true
};

export default function ProfilePage() {
  const { walletAddress } = useParams();
  const { subscriptions, subscribe, unsubscribe, isConnected, wallet: loggedInWallet } = useApp();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [dbCreator, setDbCreator] = useState(null);
  const [dbPosts, setDbPosts] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    bio: '',
    avatar: '',
    price: 0
  });

  const isOwner = loggedInWallet === walletAddress;

  useEffect(() => {
    async function loadData() {
      if (!walletAddress) return;
      setLoading(true);
      try {
        const user = await getUserByWallet(walletAddress);
        if (user) {
          setDbCreator(user);
          setEditData({
            displayName: user.displayName || '',
            bio: user.bio || '',
            avatar: user.avatar || '',
            price: user.subscriptionPriceUsdc || 0
          });
          const posts = await getCreatorPosts(walletAddress);
          setDbPosts(posts);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [walletAddress]);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(walletAddress, {
        displayName: editData.displayName,
        bio: editData.bio,
        avatar: editData.avatar,
        subscriptionPriceUsdc: editData.price
      });
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const creator = dbCreator || (walletAddress ? { ...mockCreator, walletAddress } : null);

  if (!creator && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐰</div>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Creator not found
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{walletAddress}</div>
      </div>
    );
  }

  if (loading && !creator) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>;
  }

  const isSubscribedToCreator = subscriptions.has(creator?.walletAddress);
  const posts = dbPosts.length > 0 ? dbPosts : (creator ? generatePosts(creator.walletAddress || walletAddress, creator.postsCount || 10) : []);
  const mediaPosts = posts.filter(p => p.mediaType === 'image' || p.mediaType === 'video');

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: isMobile ? '140px' : '200px', background: 'var(--bg-hover)', marginLeft: isMobile ? '-12px' : '0', marginRight: isMobile ? '-12px' : '0' }}>
        {creator?.banner && <img src={creator.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, var(--bg-primary) 100%)' }} />
      </div>

      <div style={{ padding: isMobile ? '0 12px 20px' : '0 20px 20px' }}>
        {/* Avatar + Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: isMobile ? '-32px' : '-40px', marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <img src={creator?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=bunny'} alt="" style={{
              width: isMobile ? 64 : 100, height: isMobile ? 64 : 100,
              borderRadius: '50%', objectFit: 'cover',
              border: '4px solid var(--bg-primary)',
              background: 'var(--bg-secondary)',
            }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
            {isOwner ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px', borderRadius: '999px',
                  background: isEditing ? 'var(--bg-hover)' : 'var(--bg-card)',
                  border: '1px solid var(--border)', color: 'var(--text-primary)',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  fontFamily: 'Syne', fontSize: '14px'
                }}
              >
                {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : (
              <>
                <button className="icon-btn"><Share2 size={16} /></button>
                <button className="icon-btn"><MessageCircle size={16} /></button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: isMobile ? '16px' : '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Display Name</label>
                <input
                  type="text" placeholder="Display Name"
                  value={editData.displayName} onChange={e => setEditData({ ...editData, displayName: e.target.value })}
                  className="admin-input" style={{ fontSize: '16px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Bio</label>
                <textarea
                  placeholder="Bio"
                  value={editData.bio} onChange={e => setEditData({ ...editData, bio: e.target.value })}
                  className="admin-input" style={{ height: '80px', resize: 'none', fontSize: '16px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Avatar URL</label>
                <input
                  type="text" placeholder="Avatar URL"
                  value={editData.avatar} onChange={e => setEditData({ ...editData, avatar: e.target.value })}
                  className="admin-input" style={{ fontSize: '16px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Monthly Price (USDC)</span>
                <input
                  type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                  className="admin-input" style={{ width: isMobile ? '100%' : '100px', fontSize: '16px' }}
                />
              </div>
              <button
                onClick={handleSaveProfile}
                style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 800 }}>{creator?.displayName}</h1>
              {creator?.isVerified && <CheckCircle size={isMobile ? 18 : 20} color="var(--accent)" fill="var(--accent)" />}
            </div>

            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--bg-hover)', padding: '4px 12px', borderRadius: '999px',
                border: '1px solid var(--border)', color: 'var(--text-muted)',
                fontSize: '12px', cursor: 'pointer', fontFamily: 'monospace',
                marginBottom: '16px', position: 'relative'
              }}
            >
              {truncateWallet(walletAddress, isMobile ? 4 : 6)}
              {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
              {copied && <span className="tooltip">Copied!</span>}
            </button>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '15px' }}>
              <span><strong>{creator?.postsCount || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>posts</span></span>
              <span><strong>{formatCount(creator?.followersCount || 0)}</strong> <span style={{ color: 'var(--text-muted)' }}>followers</span></span>
            </div>

            {creator?.bio && <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 20px', lineHeight: 1.6 }}>{creator.bio}</p>}

            {!isOwner && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {!isConnected ? (
                  <div style={{ width: '100%' }}><WalletConnect /></div>
                ) : isSubscribedToCreator ? (
                  <button onClick={() => unsubscribe(creator.walletAddress)} className="sub-btn-following" style={{ width: '100%' }}>Following ✓</button>
                ) : (
                  <button onClick={() => subscribe(creator.walletAddress, creator.subscriptionPriceUsdc)} className="sub-btn-pay" style={{ width: '100%' }}>
                    {creator.subscriptionPriceUsdc === 0 ? 'Follow Free' : `Subscribe · ${creator.subscriptionPriceUsdc} USDC`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
          {['posts', 'media'].map(t => (
            <button
              key={t} onClick={() => setActiveTab(t)}
              style={{
                flex: 1, padding: '16px', background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === t ? 'var(--accent)' : 'transparent'}`,
                color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: activeTab === t ? 700 : 400, fontSize: '15px', cursor: 'pointer'
              }}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {activeTab === 'posts' ? (
          <div>
            {posts.length > 0 ? posts.map(p => <PostCard key={p.id} post={p} />) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No posts yet.</div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {mediaPosts.map(p => (
              <div key={p.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={p.mediaUrl || p.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {p.isLocked && !isSubscribedToCreator && <div className="media-overlay"><Lock size={20} color="white" /></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .icon-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .admin-input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); font-family: 'DM Sans'; font-size: 14px; }
        .tooltip { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: var(--bg-card); border: 1px solid var(--border); padding: 4px 8px; border-radius: 4px; font-size: 10px; white-space: nowrap; }
        .sub-btn-pay { flex: 1; padding: 14px; border-radius: 999px; border: none; background: var(--accent); color: white; font-weight: 700; cursor: pointer; font-family: 'Syne'; }
        .sub-btn-following { flex: 1; padding: 14px; border-radius: 999px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; }
        .media-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
      `}</style>
    </div>
  );
}
