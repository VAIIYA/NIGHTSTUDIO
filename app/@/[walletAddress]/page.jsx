'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, MapPin, Share2, MessageCircle, Lock, Copy, CheckCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MOCK_CREATORS, generatePosts, formatCount, timeAgo } from '../../../lib/mockData';
import { truncateWallet } from '../../../lib/solana';
import PostCard from '../../../components/PostCard';
import WalletConnect from '../../../components/WalletConnect';

export default function ProfilePage() {
  const { walletAddress } = useParams();
  const { subscriptions, subscribe, unsubscribe, isConnected, wallet } = useApp();
  const [tab, setTab] = useState('posts');
  const [copied, setCopied] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const creator = MOCK_CREATORS.find(c => c.wallet_address === walletAddress) || {
    wallet_address: walletAddress, display_name: truncateWallet(walletAddress), bio: '', avatar_url: `https://i.pravatar.cc/150?u=${walletAddress}`, banner_url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=900&q=80', is_verified: 0, is_online: false, followersCount: 0, postsCount: 0, mediaCount: 0, subscription_price_usdc: 0, trial_days: 0,
  };

  const isOwner = wallet === walletAddress;
  const isSubscribed = subscriptions.has(walletAddress);
  const posts = generatePosts(creator.id || '1', 12);

  useEffect(() => { document.title = `NIGHTSTUDIO — @${truncateWallet(walletAddress)}`; }, [walletAddress]);

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribe = async () => {
    if (!isConnected) return;
    setSubscribing(true);
    try { await subscribe(walletAddress, creator.subscription_price_usdc); }
    catch (err) { console.error(err); }
    setSubscribing(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }} className="fade-up">
      {/* Banner */}
      <div style={{ height: 200, overflow: 'hidden', background: 'var(--bg-hover)', position: 'relative' }}>
        <img src={creator.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, var(--bg-primary) 100%)' }} />
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        {/* Avatar + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -36, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <img src={creator.avatar_url} alt="" style={{ width: 78, height: 78, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-primary)' }} />
            {creator.is_online && <span className="online-pulse" style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--bg-primary)' }} />}
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
            <button onClick={copyWallet} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {copied ? <CheckCheck size={14} color="var(--green)" /> : <Copy size={14} />}
            </button>
            <button style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={14} />
            </button>
            <button style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* Name & wallet */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900 }}>{creator.display_name}</h1>
            {creator.is_verified === 1 && <CheckCircle size={18} color="var(--accent)" fill="var(--accent)" />}
            {creator.is_online && <span style={{ fontSize: 11, color: 'var(--green)', background: 'var(--green-dim)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>● ONLINE</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <code style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '3px 10px', borderRadius: 6 }}>{truncateWallet(walletAddress, 6)}</code>
            {creator.is_nearby && <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} /> nearby</span>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, fontSize: 13, marginBottom: 12, flexWrap: 'wrap' }}>
          <span><strong>{creator.postsCount}</strong> <span style={{ color: 'var(--text-muted)' }}>posts</span></span>
          <span><strong>{formatCount(creator.followersCount)}</strong> <span style={{ color: 'var(--text-muted)' }}>followers</span></span>
        </div>

        {creator.bio && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{creator.bio}</p>}

        {/* Subscribe */}
        {!isConnected ? (
          <WalletConnect message="Connect your wallet to subscribe and unlock exclusive content." />
        ) : !isOwner && (
          <div style={{ marginBottom: 24 }}>
            {isSubscribed ? (
              <button onClick={() => unsubscribe(walletAddress)} style={{ width: '100%', padding: 12, borderRadius: 999, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)' }}>
                Following ✓
              </button>
            ) : (
              <button onClick={handleSubscribe} disabled={subscribing} style={{ width: '100%', padding: 13, borderRadius: 999, border: 'none', background: 'var(--gradient-orange)', color: 'white', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-jakarta)', boxShadow: '0 4px 20px rgba(246,133,27,0.3)' }}>
                {subscribing ? 'Processing...' : creator.trial_days > 0 ? `Free for ${creator.trial_days} days` : creator.subscription_price_usdc === 0 ? 'Follow for free' : `Subscribe · ${creator.subscription_price_usdc} USDC/mo`}
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {[{ id: 'posts', label: `Posts (${creator.postsCount || 12})` }, { id: 'media', label: `Media (${creator.mediaCount || 12})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: 12, background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: tab === t.id ? 700 : 400, fontSize: 14, fontFamily: 'var(--font-jakarta)', transition: 'all 0.12s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'posts' && posts.map(p => <PostCard key={p.id} post={{ ...p, creator_wallet: walletAddress }} creator={creator} />)}
        {tab === 'media' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {posts.map(p => (
              <div key={p.id} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 4, cursor: 'pointer' }}>
                <img src={p.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: (!isSubscribed && p.is_locked) ? 'blur(10px)' : 'none', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                {(!isSubscribed && p.is_locked) && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}><Lock size={16} color="white" />{p.price_usdc > 0 && <span style={{ color: 'white', fontSize: 11, fontWeight: 700, marginTop: 3 }}>{p.price_usdc}</span>}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
