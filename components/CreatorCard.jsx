'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CreatorCard({ creator, compact = false }) {
  const { subscriptions, toggleFollow } = useApp();
  const isFollowing = subscriptions.has(creator.wallet_address);

  const handleFollow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFollow(creator.id, creator.wallet_address);
  };

  const walletShort = creator.wallet_address ? `${creator.wallet_address.slice(0, 4)}...${creator.wallet_address.slice(-4)}` : '';

  if (compact) {
    return (
      <Link href={`/creator/${creator.wallet_address}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #E8E8E8', background: 'white', textDecoration: 'none' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={creator.avatar_url || 'https://via.placeholder.com/150'} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 14, color: '#24272A' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{creator.display_name}</span>
            {creator.is_verified && <CheckCircle size={12} color="#037DD6" fill="#037DD6" />}
          </div>
          <div style={{ color: '#6A737D', fontSize: 12 }}>{walletShort}</div>
        </div>
        <button onClick={handleFollow} className={isFollowing ? 'btn-secondary' : 'btn-primary'} style={{ padding: '6px 16px', fontSize: 12 }}>
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </Link>
    );
  }

  return (
    <Link href={`/creator/${creator.wallet_address}`} className="card" style={{ display: 'block', overflow: 'hidden', transition: 'all 0.2s', textDecoration: 'none' }}>
      <div style={{ height: 100, background: creator.cover_url ? `url(${creator.cover_url})` : '#F8F8F8', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ marginTop: -24, marginBottom: 12, position: 'relative' }}>
          <img src={creator.avatar_url || 'https://via.placeholder.com/150'} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 16, color: '#24272A' }}>
              {creator.display_name}
              {creator.is_verified && <CheckCircle size={14} color="#037DD6" fill="#037DD6" />}
            </div>
            <div style={{ color: '#6A737D', fontSize: 12 }}>{walletShort}</div>
          </div>
          <button onClick={handleFollow} className={isFollowing ? 'btn-secondary' : 'btn-primary'} style={{ padding: '8px 20px', fontSize: 13 }}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        {creator.bio && <p style={{ color: '#6A737D', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5, height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{creator.bio}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #E8E8E8' }}>
          <div style={{ color: '#F6851B', fontWeight: 700, fontSize: 14 }}>
            {creator.subscription_price == 0 ? 'Free' : `${creator.subscription_price} USDC/mo`}
          </div>
          <div style={{ color: '#9FA6AE', fontSize: 12 }}>
            {creator.follower_count || 0} followers
          </div>
        </div>
      </div>
    </Link>
  );
}
