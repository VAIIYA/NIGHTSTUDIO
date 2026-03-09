import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import WalletPage from './pages/WalletPage';
import FollowingPage from './pages/FollowingPage';
import NotificationsPage from './pages/NotificationsPage';
import BecomeCreatorPage from './pages/BecomeCreatorPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

import { useMediaQuery } from './hooks/useMediaQuery';
import BottomNav from './components/BottomNav';

function Layout({ children, showRight = true }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      maxWidth: '1280px',
      margin: '0 auto',
      position: 'relative',
    }}>
      {/* Sidebar: hidden on mobile, always shown on tablet/desktop */}
      {!isMobile && <Sidebar collapsed={isTablet} />}

      <main style={{
        flex: 1,
        padding: isMobile ? '16px 12px 80px 12px' : '0 24px',
        minWidth: 0,
        width: '100%',
      }}>
        {children}
      </main>

      {/* Right sidebar: only on desktop */}
      {!isMobile && !isTablet && showRight && <RightSidebar />}

      {/* Bottom nav: only on mobile */}
      {isMobile && <BottomNav />}
    </div>
  );
}

export default function App() {
  const endpoint = import.meta.env.VITE_SOLANA_RPC || clusterApiUrl('mainnet-beta');
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/discover" element={<Layout><DiscoverPage /></Layout>} />
                <Route path="/following" element={<Layout><FollowingPage /></Layout>} />
                <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
                <Route path="/messages" element={<Layout showRight={false}><MessagesPage /></Layout>} />
                <Route path="/wallet" element={<Layout showRight={false}><WalletPage /></Layout>} />
                <Route path="/become-creator" element={<Layout showRight={false}><BecomeCreatorPage /></Layout>} />
                <Route path="/@/:walletAddress" element={<Layout><ProfilePage /></Layout>} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/promotions" element={<Layout><div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Promotions coming soon</div></Layout>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
