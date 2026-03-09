'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Lock, Zap, CheckCircle, Play, X, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';

export default function PostCard({ post, creator }) {
  const { unlockedPosts, unlockPost, subscriptions, isConnected, wallet } = useApp();
  const { success, error: toastError } = useToast();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.like_count || 0);
  const [unlocking, setUnlocking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isSubscribed = subscriptions.has(creator?.wallet_address);
  const isOwner = wallet === creator?.wallet_address;
  const isUnlocked = !post.is_locked || isSubscribed || isOwner || unlockedPosts.has(post.id);

  const handleUnlock = async () => {
    setShowConfirm(false);
    setUnlocking(true);
    try {
      await unlockPost(post.id, creator.wallet_address, post.unlock_price);
      success('Post unlocked successfully!');
    } catch (err) {
      console.error(err);
      toastError(err.message || 'Unlock failed');
    }
    setUnlocking(false);
  };

  const creatorShort = creator?.wallet_address ? `${creator.wallet_address.slice(0, 4)}...${creator.wallet_address.slice(-4)}` : '';

  return (
    <article className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href={`/creator/${creator?.wallet_address}`} style={{ flexShrink: 0 }}>
          <img src={creator?.avatar_url || 'https://via.placeholder.com/150'} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/creator/${creator?.wallet_address}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 15, color: '#24272A', textDecoration: 'none' }}>
            {creator?.display_name || 'Creator'}
            {creator?.is_verified && <CheckCircle size={14} color="#037DD6" fill="#037DD6" />}
          </Link>
          <div style={{ color: '#6A737D', fontSize: 12 }}>
            {creatorShort} • {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
        <button style={{ background: 'none', border: 'none', color: '#9FA6AE' }}><MoreHorizontal size={20} /></button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px 12px', fontSize: 15, color: '#24272A', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>{post.title}</div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
      </div>

      {/* Media */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#F8F8F8' }}>
        {post.media_url ? (
          <div style={{ position: 'relative', minHeight: 100 }}>
            <img
              src={post.media_url}
              alt=""
              style={{
                width: '100%',
                display: 'block',
                filter: isUnlocked ? 'none' : 'blur(40px)',
                transform: isUnlocked ? 'none' : 'scale(1.1)',
                transition: 'all 0.5s',
                maxHeight: 500,
                objectFit: 'contain'
              }}
            />

            {/* Lock overlay */}
            {!isUnlocked && !showConfirm && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }}>
                <div style={{ background: 'white', border: '1px solid #E8E8E8', borderRadius: 20, padding: 24, textAlign: 'center', maxWidth: 300, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: 56, height: 56, background: '#FFF4EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Lock size={24} color="#F6851B" />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>This post is locked</div>
                  <div style={{ color: '#6A737D', fontSize: 13, marginBottom: 20 }}>
                    {post.unlock_price > 0 ? `Unlock for ${post.unlock_price} USDC` : 'Subscribe to creator to unlock'}
                  </div>

                  {post.unlock_price > 0 ? (
                    <button
                      onClick={() => setShowConfirm(true)}
                      disabled={unlocking}
                      className="btn-primary"
                      style={{ width: '100%', padding: '12px', fontSize: 14 }}
                    >
                      <Zap size={16} /> Pay {post.unlock_price} USDC to Unlock
                    </button>
                  ) : (
                    <Link
                      href={`/creator/${creator?.wallet_address}`}
                      className="btn-primary"
                      style={{ display: 'block', textDecoration: 'none', padding: '12px', fontSize: 14 }}
                    >
                      Subscribe to Creator
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Confirm Unlock */}
            {showConfirm && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
                <div style={{ background: 'white', border: '1px solid #E8E8E8', borderRadius: 20, padding: 24, maxWidth: 280, textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Confirm Unlock</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#F6851B', marginBottom: 20 }}>{post.unlock_price} USDC</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowConfirm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={handleUnlock} className="btn-primary" style={{ flex: 1 }}>Pay Now</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 20, borderTop: '1px solid #F8F8F8' }}>
        <button onClick={() => { setLiked(!liked); setLikesCount(liked ? likesCount - 1 : likesCount + 1); }} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: liked ? '#D73A49' : '#6A737D', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <Heart size={20} fill={liked ? '#D73A49' : 'none'} /> {likesCount}
        </button>
        <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: '#6A737D', fontWeight: 700, fontSize: 14 }}>
          <MessageCircle size={20} /> {post.comment_count || 0}
        </button>
        <button style={{ background: 'none', border: 'none', marginLeft: 'auto', color: '#6A737D' }}>
          <Share2 size={20} />
        </button>
      </div>

      {unlocking && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#F6851B', zIndex: 10 }}>
          <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 12 }}></div>
          <div style={{ fontWeight: 800 }}>Confirming on Solana...</div>
        </div>
      )}
    </article>
  );
}
