'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bell, MessageCircle, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: Bell, label: 'Alerts', path: '/notifications', badge: true },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: User, label: 'Profile', path: '/wallet' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { notifications } = useApp();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
    }}>
      {NAV.map(({ icon: Icon, label, path, badge }) => {
        const active = pathname === path;
        return (
          <Link key={path} href={path} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 4px 6px',
            color: active ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: 10, fontWeight: active ? 700 : 400, gap: 4,
            position: 'relative',
            transition: 'color 0.12s',
          }}>
            {active && <div style={{ position: 'absolute', top: 6, width: 4, height: 4, background: 'var(--accent)', borderRadius: '50%' }} />}
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {badge && notifications > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -6, background: 'var(--accent)', color: 'white', borderRadius: 999, fontSize: 9, fontWeight: 700, minWidth: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{notifications}</span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
