'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCount, truncateWallet } from '../lib/mockData';

export default function CreatorCard({ creator, compact = false }) {
  const { subscriptions, subscribe } = useApp();
  const isFollowing = subscriptions.has(creator.wallet_address);

  const handleFollow = (e) => {
    e.preventDefault();
    subscribe(creator.wallet_address, creator.subscription_price_usdc);
  };

  if (compact) {
    return (
      <Link href={`/@/${creator.wallet_address}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={creator.avatar_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
          {creator.is_online && <span className="online-pulse" style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--bg-card)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{creator.display_name}</span>
            {creator.is_verified === 1 && <CheckCircle size={12} color="var(--accent)" fill="var(--accent)" />}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>{truncateWallet(creator.wallet_address)}</div>
        </div>
        <button onClick={handleFollow} style={{ padding: '5px 12px', borderRadius: 999, border: isFollowing ? '1px solid var(--border-light)' : 'none', background: isFollowing ? 'transparent' : 'var(--gradient-orange)', color: isFollowing ? 'var(--text-muted)' : 'white', fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-jakarta)' }}>
          {isFollowing ? '✓' : 'Follow'}
        </button>
      </Link>
    );
  }

  return (
    <Link href={`/@/${creator.wallet_address}`} style={{ display: 'block', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', transition: 'box-shadow 0.15s, transform 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent), 0 8px 32px rgba(246,133,27,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ height: 90, overflow: 'hidden', background: 'var(--bg-hover)', position: 'relative' }}>
        <img src={creator.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))' }} />
      </div>
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ marginTop: -20, marginBottom: 8, position: 'relative', width: 'fit-content' }}>
          <img src={creator.avatar_url} alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--bg-card)' }} />
          {creator.is_online && <span className="online-pulse" style={{ position: 'absolute', bottom: 2, right: 2, width: 11, height: 11, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--bg-card)' }} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)' }}>
              {creator.display_name}
              {creator.is_verified === 1 && <CheckCircle size={13} color="var(--accent)" fill="var(--accent)" />}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>{truncateWallet(creator.wallet_address)}</div>
          </div>
          <button onClick={handleFollow} style={{ padding: '6px 14px', borderRadius: 999, border: isFollowing ? '1px solid var(--border-light)' : 'none', background: isFollowing ? 'transparent' : 'var(--gradient-orange)', color: isFollowing ? 'var(--text-muted)' : 'white', fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-jakarta)' }}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        {creator.bio && <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: '0 0 8px', lineHeight: 1.4 }}>{creator.bio}</p>}
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          <span><strong style={{ color: 'var(--text-primary)' }}>{formatCount(creator.followersCount)}</strong> followers</span>
          <span><strong style={{ color: 'var(--text-primary)' }}>{creator.postsCount}</strong> posts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: creator.subscription_price_usdc === 0 ? 'var(--green)' : 'var(--accent)', fontWeight: 600 }}>
            {creator.subscription_price_usdc === 0 ? '✓ Free' : `${creator.subscription_price_usdc} USDC/mo`}
          </span>
          {creator.trial_days > 0 && <span style={{ fontSize: 11, background: 'var(--green-dim)', color: 'var(--green)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{creator.trial_days}d free trial</span>}
        </div>
      </div>
    </Link>
  );
}
