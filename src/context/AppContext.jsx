import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { upsertUser, hasPurchased, isSubscribed, recordPurchase, recordSubscription } from '../lib/db';
import { payForContent, subscribeToCreator, getUsdcBalance } from '../lib/solana';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { publicKey, connected, disconnect } = useWallet();
  const [user, setUser] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [unlockedPosts, setUnlockedPosts] = useState(new Set());
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(false);

  // On wallet connect: upsert user in DB, fetch balance
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      setLoading(true);
      Promise.all([
        upsertUser(walletAddress),
        getUsdcBalance(walletAddress),
      ]).then(([dbUser, balance]) => {
        setUser(dbUser || { wallet_address: walletAddress });
        setUsdcBalance(balance);
      }).catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setUsdcBalance(0);
      setSubscriptions(new Set());
      setUnlockedPosts(new Set());
    }
  }, [connected, publicKey]);

  const unlockPost = useCallback(async (postId, creatorWallet, priceUsdc) => {
    if (!connected || !publicKey) throw new Error('Connect your wallet first');
    const txSig = await payForContent(creatorWallet, priceUsdc, postId);
    await recordPurchase(publicKey.toString(), postId, priceUsdc, txSig);
    setUnlockedPosts(prev => new Set([...prev, postId]));
    // Refresh balance
    const balance = await getUsdcBalance(publicKey.toString());
    setUsdcBalance(balance);
    return txSig;
  }, [connected, publicKey]);

  const subscribe = useCallback(async (creatorWallet, priceUsdc) => {
    if (!connected || !publicKey) throw new Error('Connect your wallet first');
    const txSig = await subscribeToCreator(creatorWallet, priceUsdc);
    await recordSubscription(publicKey.toString(), creatorWallet, txSig);
    setSubscriptions(prev => new Set([...prev, creatorWallet]));
    const balance = await getUsdcBalance(publicKey.toString());
    setUsdcBalance(balance);
    return txSig;
  }, [connected, publicKey]);

  const unsubscribe = useCallback((creatorWallet) => {
    setSubscriptions(prev => {
      const next = new Set(prev);
      next.delete(creatorWallet);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      user,
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
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
