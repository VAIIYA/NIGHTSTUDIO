import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

import { AppProvider } from './context/AppContext';
import AppLayout from './layouts/AppLayout';
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
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/following" element={<FollowingPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/become-creator" element={<BecomeCreatorPage />} />
                  <Route path="/@/:walletAddress" element={<ProfilePage />} />
                </Route>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/promotions" element={<div className="p-10 text-center text-gray-500">Promotions coming soon</div>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
