'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bell, UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: Bell, label: 'Alerts', path: '/notifications', badge: true },
  { icon: UserCircle, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { notifications } = useApp();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'white',
      borderTop: '1px solid #E8E8E8',
      display: 'flex',
      height: 64,
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
    }}>
      {NAV.map(({ icon: Icon, label, path, badge }) => {
        const active = pathname === path;
        return (
          <Link key={path} href={path} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: active ? '#F6851B' : '#9FA6AE',
            fontSize: 10, fontWeight: active ? 700 : 500, gap: 4,
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}>
            <div style={{ position: 'relative' }}>
              <Icon size={24} />
              {badge && notifications > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -4,
                  background: '#F6851B', color: 'white',
                  borderRadius: 999, fontSize: 10, fontWeight: 700,
                  minWidth: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', border: '2px solid white'
                }}>{notifications}</span>
              )}
            </div>
            <span style={{ letterSpacing: '0.2px' }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
