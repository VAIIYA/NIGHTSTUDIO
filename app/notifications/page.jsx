'use client';
import { useState, useEffect } from 'react';
import { Heart, UserPlus, MessageCircle, Zap, Check, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';

const ICONS = {
  subscribe: { icon: UserPlus, color: '#F6851B', bg: '#FFF4EB' },
  payment: { icon: Zap, color: '#F6851B', bg: '#FFF4EB' },
  like: { icon: Heart, color: '#D73A49', bg: '#FFF5F6' },
  comment: { icon: MessageCircle, color: '#037DD6', bg: '#F0F7FF' },
};

export default function NotificationsPage() {
  const { wallet, setNotifications, isConnected } = useApp();
  const { success, error: toastError } = useToast();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_wallet', wallet)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifs(data || []);
      // Reset unread count globally
      setNotifications(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) fetchNotifications();
  }, [wallet, isConnected]);

  const markAllRead = async () => {
    if (!wallet) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_wallet', wallet);

      if (error) throw error;
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      success('All notifications marked as read');
    } catch (err) {
      console.error(err);
      toastError('Failed to mark notifications as read');
    }
  };

  if (!isConnected) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Connect your wallet</h2>
        <p style={{ color: '#6A737D', marginTop: 12 }}>Please connect your wallet to view notifications.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 0' }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#24272A' }}>Notifications</h1>
        {notifs.some(n => !n.is_read) && (
          <button
            onClick={markAllRead}
            style={{
              background: '#FFF4EB', border: 'none', color: '#F6851B',
              fontSize: 13, fontWeight: 700, padding: '8px 16px',
              borderRadius: 100, display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Check size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifs.map(n => {
          const config = ICONS[n.type] || ICONS.subscribe;
          const Icon = config.icon;

          return (
            <div
              key={n.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px', borderRadius: 12,
                background: n.is_read ? '#F8F8F8' : 'white',
                border: '1px solid #E8E8E8',
                borderLeft: n.is_read ? '1px solid #E8E8E8' : '4px solid #F6851B',
                position: 'relative',
                transition: 'transform 0.2s',
              }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: config.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={20} color={config.color} fill={n.type === 'like' ? config.color : 'none'} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: '#24272A', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 800 }}>{n.data?.sender_name || 'Someone'}</span> {n.data?.message || 'interacted with you'}
                </div>
                <div style={{ fontSize: 13, color: '#9FA6AE', marginTop: 4 }}>
                  {new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>

              {!n.is_read && (
                <div style={{ width: 8, height: 8, background: '#F6851B', borderRadius: '50%' }} />
              )}
            </div>
          );
        })}

        {notifs.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: '#9FA6AE' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>No notifications yet</div>
            <p style={{ fontSize: 14, marginTop: 8 }}>We'll alert you when someone interacts with your profile.</p>
          </div>
        )}

        {loading && (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))
        )}
      </div>
    </div>
  );
}
