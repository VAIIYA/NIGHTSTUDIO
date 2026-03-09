'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useApp } from '../context/AppContext';
import { Home, Compass, Bell, MessageCircle, Users, Wallet, User, LogOut, Plus, Zap } from 'lucide-react';
import { truncateWallet } from '../lib/solana';

const NAV = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: Bell, label: 'Notifications', path: '/notifications', badge: true },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: Users, label: 'Following', path: '/following' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
];

export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname();
  const { wallet, isConnected, usdcBalance, notifications, user, disconnectWallet } = useApp();
  const w = collapsed ? 64 : 260;

  return (
    <aside style={{
      width: w, minWidth: w, height: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: collapsed ? '16px 8px' : '20px 12px',
      position: 'sticky', top: 0, overflowY: 'auto', flexShrink: 0,
      transition: 'width 0.2s ease',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ width: 36, height: 36, background: 'var(--gradient-orange)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎬</div>
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 900, fontSize: 15, background: 'var(--gradient-orange)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
            NIGHTSTUDIO
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV.map(({ icon: Icon, label, path, badge }) => {
          const active = pathname === path;
          return (
            <Link key={path} href={path} title={collapsed ? label : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '12px 14px' : '11px 14px',
              borderRadius: 12, marginBottom: 2,
              borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: active ? 600 : 400, fontSize: 15,
              transition: 'all 0.12s',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}>
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && badge && notifications > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{notifications}</span>
              )}
            </Link>
          );
        })}

        {/* My Page / Become Creator */}
        {isConnected && user?.is_creator === 1 ? (
          <Link href={`/@/${wallet}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '12px 14px' : '11px 14px', borderRadius: 12, marginBottom: 2, color: 'var(--text-secondary)', fontSize: 15, transition: 'all 0.12s', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <User size={18} />
            {!collapsed && <span>My Page</span>}
          </Link>
        ) : (
          <Link href="/become-creator" style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 12, padding: collapsed ? '12px 14px' : '11px 14px', borderRadius: 12, marginBottom: 2, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600, fontSize: 14, transition: 'all 0.12s', marginTop: 8 }}>
            <Plus size={18} />
            {!collapsed && <span>Become a Creator</span>}
          </Link>
        )}
      </nav>

      {/* Wallet section */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
        {isConnected ? (
          <div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: collapsed ? '10px 8px' : '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: collapsed ? 0 : 6 }}>
                <div style={{ width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', boxShadow: '0 0 6px var(--green)', flexShrink: 0 }} />
                {!collapsed && <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{truncateWallet(wallet)}</span>}
              </div>
              {!collapsed && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{usdcBalance.toFixed(2)} USDC</div>}
            </div>
            {!collapsed && (
              <button onClick={disconnectWallet} style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-inter)' }}>
                <LogOut size={14} /> Disconnect
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <WalletMultiButton style={{ width: collapsed ? 'auto' : '100%' }} />
          </div>
        )}
      </div>
    </aside>
  );
}
