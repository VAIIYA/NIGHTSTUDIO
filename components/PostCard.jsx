'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Lock, Zap, CheckCircle, Play, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { timeAgo, calculateSplit } from '../lib/mockData';
import { truncateWallet } from '../lib/solana';

export default function PostCard({ post, creator }) {
  const { unlockedPosts, unlockPost, subscriptions, isConnected } = useApp();
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes_count || 0);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isSubscribed = subscriptions.has(post.creator_wallet);
  const isUnlocked = !post.is_locked || isSubscribed || unlockedPosts.has(post.id);
  const split = post.price_usdc ? calculateSplit(post.price_usdc) : null;

  const handleUnlock = async () => {
    setShowConfirm(false);
    setUnlocking(true);
    setError('');
    try {
      await unlockPost(post.id, post.creator_wallet, post.price_usdc);
    } catch (err) {
      setError(err.message || 'Transaction failed');
    }
    setUnlocking(false);
  };

  return (
    <article style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 12, transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href={`/@/${post.creator_wallet}`} style={{ position: 'relative', flexShrink: 0 }}>
          <img src={creator?.avatar_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
          {creator?.is_online && <span className="online-pulse" style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--bg-card)' }} />}
        </Link>
        <div style={{ flex: 1 }}>
          <Link href={`/@/${post.creator_wallet}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-jakarta)' }}>
            {creator?.display_name}
            {creator?.is_verified === 1 && <CheckCircle size={13} color="var(--accent)" fill="var(--accent)" />}
          </Link>
          <div style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>
            {truncateWallet(post.creator_wallet)} · {timeAgo(post.created_at)}
          </div>
        </div>
      </div>

      {post.text && <div style={{ padding: '0 16px 10px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{post.text}</div>}

      {/* Media */}
      <div style={{ position: 'relative', minHeight: 280 }}>
        <img src={post.thumbnail} alt="" style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block', filter: isUnlocked ? 'none' : 'blur(20px)', transform: isUnlocked ? 'none' : 'scale(1.05)', transition: 'filter 0.4s, transform 0.4s' }} />
        {post.mediaType === 'video' && isUnlocked && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 52, height: 52, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <Play size={22} color="white" fill="white" />
            </div>
          </div>
        )}

        {/* Confirm modal */}
        {showConfirm && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 20, padding: 24, maxWidth: 280, width: '90%', textAlign: 'center' }}>
              <button onClick={() => setShowConfirm(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={16} /></button>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Unlock this post</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-jakarta)', marginBottom: 12 }}>{post.price_usdc} USDC</div>
              {split && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>Creator gets {split.creator} USDC · Fee {(split.developer + split.broker).toFixed(2)} USDC</div>}
              <button onClick={handleUnlock} style={{ width: '100%', padding: '12px', borderRadius: 999, border: 'none', background: 'var(--gradient-orange)', color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Zap size={15} /> Confirm & Pay
              </button>
            </div>
          </div>
        )}

        {/* Lock overlay */}
        {!isUnlocked && !showConfirm && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,11,13,0.55)', backdropFilter: 'blur(2px)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 16, padding: '20px 24px', textAlign: 'center', maxWidth: 260 }}>
              <img src={creator?.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />
              <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Locked Content</div>
              {error && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 8 }}>{error}</div>}
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
                {post.price_usdc > 0 ? `${post.price_usdc} USDC to unlock` : 'Subscribe to view'}
              </div>
              {post.price_usdc > 0 ? (
                <button onClick={() => setShowConfirm(true)} disabled={unlocking} style={{ padding: '10px 20px', borderRadius: 999, border: 'none', background: unlocking ? 'var(--bg-hover)' : 'var(--gradient-orange)', color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}>
                  <Zap size={14} />
                  {unlocking ? 'Confirming on Solana...' : `Unlock · ${post.price_usdc} USDC`}
                </button>
              ) : (
                <Link href={`/@/${post.creator_wallet}`} style={{ display: 'block', padding: '10px 20px', borderRadius: 999, background: 'var(--gradient-orange)', color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-jakarta)', textAlign: 'center' }}>
                  Subscribe to Unlock
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => { setLiked(l => !l); setLikesCount(n => liked ? n - 1 : n + 1); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: liked ? 'var(--accent)' : 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-inter)' }}>
          <Heart size={16} fill={liked ? 'var(--accent)' : 'none'} /> {likesCount}
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-inter)' }}>
          <MessageCircle size={16} /> {post.commentsCount || 0}
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, marginLeft: 'auto', fontFamily: 'var(--font-inter)' }}>
          <Share2 size={16} />
        </button>
      </div>
    </article>
  );
}
