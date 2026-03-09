import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { truncateWallet } from '../lib/solana';
import { formatCount } from '../lib/mockData';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function CreatorCard({ creator, variant = 'full' }) {
  const { subscriptions, subscribe, unsubscribe } = useApp();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isSubscribed = subscriptions.has(creator.walletAddress);

  if (variant === 'compact') {
    return (
      <div
        onClick={() => navigate(`/@/${creator.walletAddress}`)}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
      >
        <img src={creator.avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{creator.displayName}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{truncateWallet(creator.walletAddress, 4)}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); isSubscribed ? unsubscribe(creator.walletAddress) : subscribe(creator.walletAddress, creator.subscriptionPriceUsdc); }}
          style={{ padding: '6px 12px', borderRadius: '999px', border: '1px solid var(--border)', background: isSubscribed ? 'var(--bg-hover)' : 'var(--accent)', color: isSubscribed ? 'var(--text-primary)' : 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          {isSubscribed ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/@/${creator.walletAddress}`)}
      style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ height: isMobile ? '80px' : '100px', background: 'var(--accent-dim)', position: 'relative' }}>
        {creator.banner && <img src={creator.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ padding: isMobile ? '16px' : '20px', paddingTop: isMobile ? '24px' : '32px' }}>
        <img src={creator.avatar} alt="" style={{ width: isMobile ? 64 : 80, height: isMobile ? 64 : 80, borderRadius: '50%', border: '4px solid var(--bg-primary)', position: 'absolute', top: isMobile ? '48px' : '60px', left: isMobile ? '16px' : '20px', background: 'var(--bg-secondary)', objectFit: 'cover' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <div style={{ fontWeight: 800, fontSize: isMobile ? '16px' : '18px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{creator.displayName}</div>
              {creator.isVerified && <CheckCircle size={14} color="var(--accent)" fill="var(--accent)" />}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>@{truncateWallet(creator.walletAddress, 6)}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); isSubscribed ? unsubscribe(creator.walletAddress) : subscribe(creator.walletAddress, creator.subscriptionPriceUsdc); }}
            style={{ padding: '8px 16px', borderRadius: '999px', border: 'none', background: isSubscribed ? 'var(--bg-hover)' : 'var(--accent)', color: isSubscribed ? 'var(--text-primary)' : 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {isSubscribed ? 'Following' : 'Follow'}
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '13px' : '14px', lineHeight: 1.5, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{creator.bio}</p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span><strong>{formatCount(creator.followersCount || 0)}</strong> subscribers</span>
          <span><strong>{creator.postsCount || 0}</strong> posts</span>
        </div>
      </div>
    </div>
  );
}
