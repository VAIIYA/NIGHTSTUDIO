import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Lock, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { truncateWallet } from '../lib/solana';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function PostCard({ post }) {
  const { wallet, subscriptions, isConnected } = useApp();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [showPayModal, setShowPayModal] = useState(false);
  const isOwner = wallet === post.creatorWallet;
  const isSubscribed = subscriptions.has(post.creatorWallet);
  const isUnlockedForUser = !post.isLocked || isOwner || isSubscribed;

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '16px' }}>
      {/* Post Header */}
      <div style={{ padding: isMobile ? '12px' : '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.creatorWallet}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{truncateWallet(post.creatorWallet, 5)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}</div>
          </div>
        </div>
        <button style={{ padding: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreHorizontal size={20} /></button>
      </div>

      {/* Post Content */}
      <div style={{ padding: isMobile ? '0 12px 12px' : '0 16px 16px', fontSize: isMobile ? '15px' : '16px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
        {post.text}
      </div>

      {/* Post Media */}
      {post.mediaUrl && (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          {!isUnlockedForUser ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '20px', textAlign: 'center', backdropFilter: 'blur(40px)', background: 'rgba(0,0,0,0.6)' }}>
              <Lock size={48} color="var(--accent)" />
              <div>
                <div style={{ fontWeight: 800, fontSize: isMobile ? '18px' : '20px', marginBottom: '4px', fontFamily: 'Syne' }}>This post is locked</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Subscribe or pay to unlock</div>
              </div>
              <button
                onClick={() => setShowPayModal(true)}
                style={{ padding: '12px 32px', borderRadius: '999px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}
              >
                Unlock for {post.priceUsdc} USDC
              </button>
            </div>
          ) : (
            post.mediaType === 'video' ? (
              <video src={post.mediaUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={post.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ padding: isMobile ? '8px 12px' : '12px 16px', display: 'flex', gap: '20px' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
          <Heart size={20} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>0</span>
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
          <MessageCircle size={20} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>0</span>
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}
