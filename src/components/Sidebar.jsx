import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Bell, Mail, Bookmark, User, PlusSquare, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { truncateWallet } from '../lib/solana';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, wallet, user, usdcBalance } = useApp();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: Bookmark, label: 'Following', path: '/following' },
  ];

  const bottomItems = [
    { icon: User, label: 'Profile', path: isConnected ? `/@/${wallet}` : '/wallet' },
  ];

  const isCreator = user?.is_creator === 1;
  const isActive = (path) => location.pathname === path || 
    (path === '/' && location.pathname === '/') ||
    (path === '/discover' && location.pathname.startsWith('/discover'));

  return (
    <aside className="w-60 flex-shrink-0 h-screen sticky top-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-6">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer mb-10"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white text-xl font-bold">N</span>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">NightStudio</span>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} className={active ? 'text-blue-600' : ''} />
                <span className={active ? 'font-semibold' : ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => isCreator ? navigate(`/@/${wallet}`) : navigate('/become-creator')}
          className={`mt-6 w-full py-3.5 px-4 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            isCreator 
              ? 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/30'
          }`}
        >
          <PlusSquare size={18} />
          {isCreator ? 'My Page →' : 'Become a Creator'}
        </button>
      </div>

      <div className="mt-auto p-6 border-t border-gray-200">
        {isConnected ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 truncate">
                {user?.display_name || truncateWallet(wallet)}
              </div>
              <div className="text-xs text-gray-500">
                {usdcBalance.toFixed(2)} USDC
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/wallet')}
            className="w-full py-3 px-4 rounded-xl bg-gray-100 text-blue-600 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Zap size={16} className="fill-blue-600" />
            Connect Wallet
          </button>
        )}
      </div>
    </aside>
  );
}
