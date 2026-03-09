import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Bell, Mail, Bookmark, User, PlusSquare, MoreHorizontal, Settings, Zap, DollarSign, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { truncateWallet } from '../lib/solana';

export default function Sidebar({ collapsed = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, wallet, user, disconnectWallet, usdcBalance } = useApp();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: Bookmark, label: 'Following', path: '/following' },
    { icon: DollarSign, label: 'Wallet', path: '/wallet' },
    { icon: User, label: 'Profile', path: isConnected ? `/@/${wallet}` : '/wallet' },
  ];

  const adminItem = { icon: LayoutDashboard, label: 'Admin', path: '/admin' };
  const isAdmin = wallet === '2Z9eW3nwa2GZUM1JzXdfBK1MN57RPA2PrhuTREEZ31VY';

  const isCreator = user?.is_creator === 1;

  return (
    <div style={{
      width: collapsed ? '80px' : '280px',
      height: '100vh',
      position: 'fixed',
      borderRight: '1px solid var(--border)',
      padding: collapsed ? '24px 12px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      transition: 'width 0.2s ease',
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '40px',
          cursor: 'pointer',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
        title="Bunny Ranch"
      >
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, var(--accent), #ff8c00)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(124, 92, 252, 0.3)',
          flexShrink: 0,
        }}>🐰</div>
        {!collapsed && (
          <span style={{
            fontFamily: 'Syne',
            fontWeight: 800,
            fontSize: '22px',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(to right, #fff, #888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap'
          }}>Bunny Ranch</span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {menuItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: location.pathname === item.path ? 'var(--bg-hover)' : 'transparent',
              color: location.pathname === item.path ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              fontFamily: 'DM Sans',
              fontWeight: location.pathname === item.path ? 700 : 500,
              fontSize: '16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <item.icon size={22} color={location.pathname === item.path ? 'var(--accent)' : 'currentColor'} style={{ flexShrink: 0 }} />
            {!collapsed && item.label}
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={() => navigate(adminItem.path)}
            title={collapsed ? adminItem.label : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: location.pathname === adminItem.path ? 'var(--bg-hover)' : 'transparent',
              color: location.pathname === adminItem.path ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              fontFamily: 'DM Sans',
              fontWeight: 700,
              fontSize: '16px',
              marginTop: '4px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <adminItem.icon size={22} color={location.pathname === adminItem.path ? 'var(--accent)' : 'currentColor'} style={{ flexShrink: 0 }} />
            {!collapsed && adminItem.label}
          </button>
        )}

        <button
          onClick={() => isCreator ? navigate(`/@/${wallet}`) : navigate('/become-creator')}
          title={collapsed ? (isCreator ? 'My Page' : 'Become a Creator') : ''}
          style={{
            marginTop: '24px',
            background: isCreator ? 'var(--bg-secondary)' : 'var(--accent)',
            color: 'white',
            width: collapsed ? '44px' : '100%',
            height: collapsed ? '44px' : 'auto',
            padding: collapsed ? '0' : '14px',
            borderRadius: collapsed ? '50%' : '999px',
            border: isCreator ? '1px solid var(--border)' : 'none',
            fontFamily: 'Syne',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isCreator ? 'none' : '0 10px 20px rgba(124, 92, 252, 0.2)',
            alignSelf: collapsed ? 'center' : 'stretch',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {collapsed ? (
            isCreator ? <User size={20} /> : <PlusSquare size={20} />
          ) : (
            <>
              {isCreator ? (
                <>My Page →</>
              ) : (
                <>
                  <PlusSquare size={18} />
                  Become a Creator
                </>
              )}
            </>
          )}
        </button>
      </nav>

      {/* User Info */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '24px', position: 'relative' }}>
        {isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={20} color="var(--accent)" />
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.display_name || truncateWallet(wallet)}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {usdcBalance.toFixed(2)} USDC
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <MoreHorizontal size={18} />
                </button>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/wallet')}
            title={collapsed ? 'Connect Wallet' : ''}
            style={{
              width: collapsed ? '44px' : '100%',
              height: collapsed ? '44px' : 'auto',
              padding: collapsed ? '0' : '12px',
              borderRadius: collapsed ? '50%' : '12px',
              border: 'none',
              background: 'var(--bg-secondary)',
              color: 'var(--accent)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Zap size={16} fill="var(--accent)" />
            {!collapsed && 'Connect Wallet'}
          </button>
        )}
      </div>
    </div>
  );
}
