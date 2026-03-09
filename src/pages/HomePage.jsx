import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { MOCK_CREATORS } from '../lib/mockData';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Compass, Users } from 'lucide-react';

import { useMediaQuery } from '../hooks/useMediaQuery';

export default function HomePage() {
  const { subscriptions, isConnected } = useApp();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [loading, setLoading] = useState(false);
  const [feedPosts, setFeedPosts] = useState([]);

  useEffect(() => {
    document.title = 'Bunny Ranch — Home';
  }, []);

  // Filter creators based on subscriptions
  const followedCreators = MOCK_CREATORS.filter(c => subscriptions.has(c.walletAddress));

  if (!isConnected) {
    return (
      <div style={{ padding: isMobile ? '0' : '20px 0' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: isMobile ? '24px' : '28px', marginBottom: '8px' }}>Home</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome to the ranch</p>
        </header>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: isMobile ? '32px 20px' : '40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', marginBottom: '12px' }}>Connect Your Wallet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>Please connect your Solana wallet to see your personalized feed.</p>
          <button onClick={() => navigate('/wallet')} style={{ padding: '12px 32px', borderRadius: '999px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}>Go to Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '0' : '20px 0' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: isMobile ? '24px' : '28px', marginBottom: '8px' }}>Home</h1>
        <p style={{ color: 'var(--text-muted)' }}>Latest updates from creators you follow</p>
      </header>

      {/* Stories / Discover creators horizontal scroll */}
      <div
        className="scroll-x-mobile"
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '24px',
          marginBottom: '8px',
          WebkitOverflowScrolling: 'touch',
          marginLeft: isMobile ? '-12px' : '0',
          marginRight: isMobile ? '-12px' : '0',
          paddingLeft: isMobile ? '12px' : '0',
          paddingRight: isMobile ? '12px' : '0',
        }}
      >
        {MOCK_CREATORS.map(creator => (
          <div
            key={creator.id}
            onClick={() => navigate(`/@/${creator.username}`)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              padding: '2px', background: subscriptions.has(creator.walletAddress) ? 'var(--accent)' : 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src={creator.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--bg-primary)', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{creator.displayName.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {followedCreators.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Here we would normally fetch posts from these creators */}
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '24px' }}>
            Posts from your creators will appear here soon.
          </div>
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
            <Users size={32} />
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', marginBottom: '12px' }}>
            Your feed is empty
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>
            Follow some creators to build your personal feed and see their latest updates.
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
