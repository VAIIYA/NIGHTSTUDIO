'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { upsertUser, recordPurchase, recordSubscription } from '../lib/db';
import { payForContent, subscribeToCreator, getUsdcBalance } from '../lib/solana';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { publicKey, connected, disconnect } = useWallet();
  const [user, setUser] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [unlockedPosts, setUnlockedPosts] = useState(new Set());
  const [notifications, setNotifications] = useState(9);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      const wallet = publicKey.toString();
      setLoading(true);
      Promise.all([
        upsertUser(wallet).catch(() => ({ wallet_address: wallet })),
        getUsdcBalance(wallet).catch(() => 0),
      ]).then(([dbUser, balance]) => {
        setUser(dbUser || { wallet_address: wallet });
        setUsdcBalance(balance);
      }).finally(() => setLoading(false));
    } else {
      setUser(null);
      setUsdcBalance(0);
    }
  }, [connected, publicKey]);

  const unlockPost = useCallback(async (postId, creatorWallet, priceUsdc) => {
    if (!connected || !publicKey) throw new Error('Connect your wallet first');
    const txSig = await payForContent(creatorWallet, priceUsdc);
    await recordPurchase(publicKey.toString(), postId, priceUsdc, txSig);
    setUnlockedPosts(prev => new Set([...prev, postId]));
    const balance = await getUsdcBalance(publicKey.toString());
    setUsdcBalance(balance);
    return txSig;
  }, [connected, publicKey]);

  const subscribe = useCallback(async (creatorWallet, priceUsdc) => {
    if (!connected || !publicKey) throw new Error('Connect your wallet first');
    if (priceUsdc > 0) {
      const txSig = await subscribeToCreator(creatorWallet, priceUsdc);
      await recordSubscription(publicKey.toString(), creatorWallet, txSig);
    }
    setSubscriptions(prev => new Set([...prev, creatorWallet]));
    if (priceUsdc > 0) {
      const balance = await getUsdcBalance(publicKey.toString());
      setUsdcBalance(balance);
    }
  }, [connected, publicKey]);

  const unsubscribe = useCallback((creatorWallet) => {
    setSubscriptions(prev => { const s = new Set(prev); s.delete(creatorWallet); return s; });
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser,
      wallet: publicKey?.toString() || null,
      isConnected: connected,
      usdcBalance,
      loading,
      subscriptions,
      subscribe,
      unsubscribe,
      unlockedPosts,
      unlockPost,
      notifications,
      setNotifications,
      disconnectWallet: disconnect,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
