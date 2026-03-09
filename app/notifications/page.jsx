'use client';
import { useEffect } from 'react';
import { Heart, UserPlus, MessageCircle, Zap } from 'lucide-react';
import { MOCK_CREATORS } from '../../lib/mockData';
import { useApp } from '../../context/AppContext';

const NOTIFS = [
  { id:1, type:'like', user: 0, text:'liked your post', time:'2m', read:false },
  { id:2, type:'follow', user: 1, text:'started following you', time:'15m', read:false },
  { id:3, type:'message', user: 2, text:'sent you a message', time:'1h', read:false },
  { id:4, type:'unlock', user: 3, text:'unlocked your post for 4.99 USDC', time:'2h', read:false },
  { id:5, type:'like', user: 4, text:'liked your photo', time:'3h', read:true },
  { id:6, type:'follow', user: 0, text:'subscribed to you', time:'5h', read:true },
  { id:7, type:'unlock', user: 1, text:'unlocked your video for 9.99 USDC', time:'1d', read:true },
  { id:8, type:'like', user: 2, text:'and 8 others liked your post', time:'2d', read:true },
];
const ICONS = {
  like: { icon: Heart, color: 'var(--red)', bg: 'var(--red-dim)' },
  follow: { icon: UserPlus, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  message: { icon: MessageCircle, color: 'var(--blue)', bg: 'var(--blue-dim)' },
  unlock: { icon: Zap, color: 'var(--accent)', bg: 'var(--accent-dim)' },
};

export default function NotificationsPage() {
  const { setNotifications } = useApp();
  useEffect(() => { document.title = 'NIGHTSTUDIO — Notifications'; setNotifications(0); }, []);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 0' }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>Notifications</h1>
        <button onClick={() => setNotifications(0)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-jakarta)' }}>Mark all read</button>
      </div>
      {NOTIFS.map(n => {
        const creator = MOCK_CREATORS[n.user];
        const { icon: Icon, color, bg } = ICONS[n.type];
        return (
          <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: n.read ? 'transparent' : 'rgba(246,133,27,0.04)', border: `1px solid ${n.read ? 'var(--border)' : 'rgba(246,133,27,0.12)'}`, marginBottom: 8, cursor: 'pointer', transition: 'background 0.12s' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={creator?.avatar_url} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, background: bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-primary)' }}>
                <Icon size={9} color={color} fill={n.type === 'like' ? color : 'none'} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{creator?.display_name}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}> {n.text}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{n.time}</div>
            {!n.read && <div style={{ width: 7, height: 7, background: 'var(--accent)', borderRadius: '50%', flexShrink: 0 }} />}
          </div>
        );
      })}
    </div>
  );
}
