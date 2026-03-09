import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CREATORS } from '../lib/mockData';
import { useApp } from '../context/AppContext';
import { UserCheck, Compass } from 'lucide-react';

export default function FollowingPage() {
  const { subscriptions } = useApp();
  const navigate = useNavigate();

  const followedCreators = MOCK_CREATORS.filter(c => subscriptions.has(c.walletAddress));

  useEffect(() => {
    document.title = 'Bunny Ranch — Following';
  }, []);

  return (
    <div style={{ padding: '20px 0' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '28px', marginBottom: '8px' }}>Following</h1>
        <p style={{ color: 'var(--text-muted)' }}>Creators you are subscribed to</p>
      </header>

      {followedCreators.length > 0 ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          {followedCreators.map(creator => (
            <div
              key={creator.id}
              onClick={() => navigate(`/@/${creator.username}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: '20px',
                cursor: 'pointer', transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <img src={creator.avatar} alt="" style={{ width: 60, height: 60, borderRadius: '16px', background: 'var(--bg-secondary)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontFamily: 'Syne', fontSize: '16px' }}>{creator.displayName}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>@{creator.username}</div>
              </div>
              <button style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
                Following
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '60px 40px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '20px', background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--text-muted)'
          }}>
            <UserCheck size={32} />
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', marginBottom: '12px' }}>
            You're not following anyone yet
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>
            Discover amazing creators and subscribe to see their exclusive content in your feed.
          </p>
          <button
            onClick={() => navigate('/discover')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto',
              padding: '12px 24px', borderRadius: '999px', border: 'none',
              background: 'var(--accent)', color: 'white', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Syne'
            }}
          >
            <Compass size={18} />
            Discover Creators
          </button>
        </div>
      )}
    </div>
  );
}
