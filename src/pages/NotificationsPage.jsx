import { useApp } from '../context/AppContext';
import { Heart, UserPlus, MessageCircle, Zap, Bell } from 'lucide-react';
import { MOCK_CREATORS } from '../lib/mockData';

const MOCK_NOTIFS = [
  { id: 1, type: 'like', user: MOCK_CREATORS[0], text: 'liked your post', time: '2m', read: false },
  { id: 2, type: 'follow', user: MOCK_CREATORS[1], text: 'started following you', time: '15m', read: false },
  { id: 3, type: 'message', user: MOCK_CREATORS[2], text: 'sent you a message', time: '1h', read: false },
  { id: 4, type: 'unlock', user: MOCK_CREATORS[3], text: 'unlocked your post for $4.99', time: '2h', read: false },
  { id: 5, type: 'like', user: MOCK_CREATORS[4], text: 'liked your photo', time: '3h', read: true },
  { id: 6, type: 'follow', user: MOCK_CREATORS[0], text: 'subscribed to you', time: '5h', read: true },
  { id: 7, type: 'unlock', user: MOCK_CREATORS[1], text: 'unlocked your video for $9.99', time: '1d', read: true },
  { id: 8, type: 'message', user: MOCK_CREATORS[2], text: 'replied to your message', time: '1d', read: true },
  { id: 9, type: 'like', user: MOCK_CREATORS[3], text: 'and 12 others liked your post', time: '2d', read: true },
];

const ICONS = {
  like: { icon: Heart, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
  follow: { icon: UserPlus, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  message: { icon: MessageCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  unlock: { icon: Zap, color: '#9945ff', bg: 'rgba(153,69,255,0.1)' },
};

export default function NotificationsPage() {
  const { setNotifications } = useApp();

  const markAllRead = () => setNotifications(0);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', margin: 0 }}>Notifications</h1>
        <button onClick={markAllRead} style={{
          background: 'transparent', border: 'none', color: 'var(--accent)',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans',
        }}>Mark all read</button>
      </div>

      {MOCK_NOTIFS.map(notif => {
        const { icon: Icon, color, bg } = ICONS[notif.type];
        return (
          <div key={notif.id} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: notif.read ? 'transparent' : 'rgba(124,92,252,0.05)',
            border: `1px solid ${notif.read ? 'var(--border)' : 'rgba(124,92,252,0.15)'}`,
            marginBottom: '8px',
            transition: 'background 0.12s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(124,92,252,0.05)'}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={notif.user.avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 20, height: 20,
                background: bg, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-primary)',
              }}>
                <Icon size={10} color={color} fill={notif.type === 'like' ? color : 'none'} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{notif.user.displayName}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}> {notif.text}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{notif.time}</div>
            {!notif.read && (
              <div style={{ width: 7, height: 7, background: 'var(--accent)', borderRadius: '50%', flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
