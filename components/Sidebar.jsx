'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useApp } from '../context/AppContext';
import { Home, Compass, Bell, MessageCircle, Users, Wallet, User, LogOut, Plus, Zap, UserCircle, LayoutDashboard, PenLine } from 'lucide-react';
import { truncateWallet } from '../lib/solana';
import NewPostModal from './NewPostModal';

export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname();
  const { wallet, isConnected, usdcBalance, notifications, user, disconnectWallet } = useApp();
  const isCreator = user?.is_creator;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const w = collapsed ? 64 : 260;

  const NAV = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: !!notifications },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Users, label: 'Following', path: '/following' },
  ];

  return (
    <aside style={{
      width: w, minWidth: w, height: '100vh',
      background: 'white',
      borderRight: '1px solid #E8E8E8',
      display: 'flex', flexDirection: 'column',
      padding: collapsed ? '16px 8px' : '20px 12px',
      position: 'sticky', top: 0, overflowY: 'auto', flexShrink: 0,
      transition: 'width 0.2s ease',
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 24, overflow: 'hidden' }}>
        <img src="/fox.svg" alt="fox logo" style={{ width: 32, height: 32, flexShrink: 0, display: 'block' }} />
        {!collapsed && (
          <span style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 900,
            fontSize: 20,
            color: '#24272A',
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap'
          }}>
            STUDIO
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
              padding: '11px 14px',
              borderRadius: 8, marginBottom: 4,
              borderLeft: active ? '3px solid #F6851B' : '3px solid transparent',
              background: active ? '#FFF4EB' : 'transparent',
              color: active ? '#F6851B' : '#6A737D',
              fontWeight: active ? 700 : 500, fontSize: 15,
              transition: 'all 0.2s',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }} onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = '#F8F8F8';
              if (!active) e.currentTarget.style.color = '#24272A';
            }} onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = 'transparent';
              if (!active) e.currentTarget.style.color = '#6A737D';
            }}>
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && badge && notifications > 0 && (
                <span style={{ marginLeft: 'auto', background: '#F6851B', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{notifications}</span>
              )}
            </Link>
          );
        })}

        {/* Profile Nav Item */}
        {isConnected && (
          <Link href="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px',
            borderRadius: 8, marginBottom: 4,
            borderLeft: pathname === '/profile' ? '3px solid #F6851B' : '3px solid transparent',
            background: pathname === '/profile' ? '#FFF4EB' : 'transparent',
            color: pathname === '/profile' ? '#F6851B' : '#6A737D',
            fontWeight: pathname === '/profile' ? 700 : 500, fontSize: 15,
            transition: 'all 0.2s',
            justifyContent: collapsed ? 'center' : 'flex-start',
            position: 'relative'
          }} onMouseEnter={(e) => {
            if (pathname !== '/profile') e.currentTarget.style.background = '#F8F8F8';
            if (pathname !== '/profile') e.currentTarget.style.color = '#24272A';
          }} onMouseLeave={(e) => {
            if (pathname !== '/profile') e.currentTarget.style.background = 'transparent';
            if (pathname !== '/profile') e.currentTarget.style.color = '#6A737D';
          }}>
            <UserCircle size={20} />
            {!collapsed && <span>Profile</span>}
            {!isCreator && (
              <div
                title="Set up your profile"
                style={{
                  position: 'absolute', top: 12, right: collapsed ? 14 : 14,
                  width: 8, height: 8, background: '#F6851B', borderRadius: '50%',
                  boxShadow: '0 0 0 2px white',
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </Link>
        )}

        {/* Dashboard Nav Item */}
        {isConnected && isCreator && (
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px',
            borderRadius: 8, marginBottom: 4,
            borderLeft: pathname === '/dashboard' ? '3px solid #F6851B' : '3px solid transparent',
            background: pathname === '/dashboard' ? '#FFF4EB' : 'transparent',
            color: pathname === '/dashboard' ? '#F6851B' : '#6A737D',
            fontWeight: pathname === '/dashboard' ? 700 : 500, fontSize: 15,
            transition: 'all 0.2s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }} onMouseEnter={(e) => {
            if (pathname !== '/dashboard') e.currentTarget.style.background = '#F8F8F8';
            if (pathname !== '/dashboard') e.currentTarget.style.color = '#24272A';
          }} onMouseLeave={(e) => {
            if (pathname !== '/dashboard') e.currentTarget.style.background = 'transparent';
            if (pathname !== '/dashboard') e.currentTarget.style.color = '#6A737D';
          }}>
            <LayoutDashboard size={20} />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        )}

        {/* Wallet Nav Item */}
        <Link href="/wallet" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 14px',
          borderRadius: 8, marginBottom: 4,
          borderLeft: pathname === '/wallet' ? '3px solid #F6851B' : '3px solid transparent',
          background: pathname === '/wallet' ? '#FFF4EB' : 'transparent',
          color: pathname === '/wallet' ? '#F6851B' : '#6A737D',
          fontWeight: pathname === '/wallet' ? 700 : 500, fontSize: 15,
          transition: 'all 0.2s',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }} onMouseEnter={(e) => {
          if (pathname !== '/wallet') e.currentTarget.style.background = '#F8F8F8';
          if (pathname !== '/wallet') e.currentTarget.style.color = '#24272A';
        }} onMouseLeave={(e) => {
          if (pathname !== '/wallet') e.currentTarget.style.background = 'transparent';
          if (pathname !== '/wallet') e.currentTarget.style.color = '#6A737D';
        }}>
          <Wallet size={20} />
          {!collapsed && <span>Wallet</span>}
        </Link>
      </nav>

      <div style={{ padding: '0 4px', marginBottom: 16 }}>
        {isConnected && !isCreator && (
          <Link href="/become-creator" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px', textDecoration: 'none' }}>
            <Plus size={18} />
            {!collapsed && <span>Become a Creator</span>}
          </Link>
        )}
        {isConnected && isCreator && (
          <button
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px' }}
          >
            {!collapsed ? <><PenLine size={18} /> New Post</> : <Plus size={20} />}
          </button>
        )}
      </div>

      {/* Wallet section */}
      <div style={{ borderTop: '1px solid #E8E8E8', paddingTop: 16, marginTop: 8 }}>
        {isConnected ? (
          <div>
            <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: 12, padding: collapsed ? '10px 8px' : '15px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: collapsed ? 0 : 8 }}>
                <div style={{ width: 8, height: 8, background: '#28A745', borderRadius: '50%', flexShrink: 0 }} />
                {!collapsed && <span style={{ fontSize: 13, color: '#24272A', fontWeight: 500 }}>{truncateWallet(wallet)}</span>}
              </div>
              {!collapsed && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6A737D' }}>Balance</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F6851B' }}>{usdcBalance.toFixed(2)} USDC</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <button onClick={disconnectWallet} style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: '#9FA6AE', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#24272A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9FA6AE'}>
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

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {isCreator && (
        <NewPostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          creatorId={user.id}
        />
      )}
    </aside>
  );
}
