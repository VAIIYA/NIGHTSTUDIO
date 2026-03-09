import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Bell, Mail, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { truncateWallet } from '../lib/solana';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isConnected, wallet, notifications } = useApp();

    const navItems = [
        { icon: Home, path: '/', label: 'Home' },
        { icon: Compass, path: '/discover', label: 'Discover' },
        { icon: Bell, path: '/notifications', label: 'Notifications', hasDot: notifications?.length > 0 },
        { icon: Mail, path: '/messages', label: 'Messages' },
        { icon: User, path: isConnected ? `/@/${wallet}` : '/wallet', label: 'Profile' },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 1000,
            paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        }}>
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                            padding: '12px',
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <item.icon size={24} />
                        {item.hasDot && (
                            <span style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                width: '8px',
                                height: '8px',
                                background: '#f43f5e',
                                borderRadius: '50%',
                                border: '2px solid var(--bg-secondary)',
                            }} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
