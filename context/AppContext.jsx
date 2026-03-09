'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { payForContent, subscribeToCreator, getUsdcBalance } from '../lib/solana';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { publicKey, connected, disconnect: disconnectWallet } = useWallet();
  const { success, error: toastError } = useToast();

  const [user, setUser] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [subscriptions, setSubscriptions] = useState(new Set()); // IDs of creator wallets
  const [unlockedPosts, setUnlockedPosts] = useState(new Set()); // IDs of posts
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sync state with Supabase when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const wallet = publicKey.toString();

      const initializeAppData = async () => {
        setLoading(true);
        try {
          // 1. Fetch/Sync Creator Profile
          const { data: creatorData } = await supabase
            .from('creators')
            .select('*')
            .eq('wallet_address', wallet)
            .single();

          if (creatorData) {
            setUser({ ...creatorData, is_creator: true });
          } else {
            setUser({ wallet_address: wallet, is_creator: false });
          }

          // 2. Fetch Follows/Subscriptions
          const { data: follows } = await supabase
            .from('follows')
            .select('creator_id, creators(wallet_address)')
            .eq('follower_wallet', wallet);

          if (follows) {
            const followedWallets = new Set(follows.map(f => f.creators?.wallet_address).filter(Boolean));
            setSubscriptions(followedWallets);
          }

          // 3. Fetch Unlocked Posts
          const { data: purchases } = await supabase
            .from('unlocked_posts')
            .select('post_id')
            .eq('buyer_wallet', wallet);

          if (purchases) {
            setUnlockedPosts(new Set(purchases.map(p => p.post_id)));
          }

          // 4. Fetch Unread Notifications
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_wallet', wallet)
            .eq('is_read', false);

          setNotifications(count || 0);

          // 5. Fetch Balance
          const balance = await getUsdcBalance(wallet).catch(() => 0);
          setUsdcBalance(balance);

        } catch (err) {
          console.error('AppData Initialization Error:', err);
        } finally {
          setLoading(false);
        }
      };

      initializeAppData();
    } else {
      setUser(null);
      setSubscriptions(new Set());
      setUnlockedPosts(new Set());
      setUsdcBalance(0);
      setNotifications(0);
    }
  }, [connected, publicKey]);

  // Unlock exclusive post
  const unlockPost = useCallback(async (postId, creatorWallet, priceUsdc) => {
    if (!connected || !publicKey) {
      toastError('Connect your wallet first');
      throw new Error('Not connected');
    }

    try {
      const txSig = await payForContent(creatorWallet, priceUsdc);

      // Record in Supabase
      const { error } = await supabase
        .from('unlocked_posts')
        .insert({
          buyer_wallet: publicKey.toString(),
          post_id: postId,
          amount_usdc: priceUsdc,
          tx_signature: txSig
        });

      if (error) throw error;

      setUnlockedPosts(prev => new Set([...prev, postId]));

      // Refresh balance
      const balance = await getUsdcBalance(publicKey.toString());
      setUsdcBalance(balance);

      success('Post unlocked! Enjoy the content.');
      return txSig;
    } catch (err) {
      console.error(err);
      toastError(err.message || 'Unlock failed');
      throw err;
    }
  }, [connected, publicKey, success, toastError]);

  // Toggle Follow/Subscription
  const toggleFollow = useCallback(async (creatorId, creatorWallet) => {
    if (!connected || !publicKey) {
      toastError('Connect your wallet to follow creators');
      return;
    }

    const wallet = publicKey.toString();
    const isCurrentlyFollowing = subscriptions.has(creatorWallet);

    // Optimistic UI update
    setSubscriptions(prev => {
      const next = new Set(prev);
      if (isCurrentlyFollowing) next.delete(creatorWallet);
      else next.add(creatorWallet);
      return next;
    });

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_wallet', wallet)
          .eq('creator_id', creatorId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_wallet: wallet,
            creator_id: creatorId
          });

        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to update follow status');
      // Revert optimistic update
      setSubscriptions(prev => {
        const next = new Set(prev);
        if (isCurrentlyFollowing) next.add(creatorWallet);
        else next.delete(creatorWallet);
        return next;
      });
    }
  }, [connected, publicKey, subscriptions, toastError]);

  // Subscribe (Paid)
  const subscribe = useCallback(async (creatorId, creatorWallet, priceUsdc) => {
    if (!connected || !publicKey) {
      toastError('Connect your wallet first');
      return;
    }

    try {
      const txSig = await subscribeToCreator(creatorWallet, priceUsdc);

      // Record in Supabase (we'll reuse follows table for free/paid for simplicity, or use subscriptions table)
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_wallet: publicKey.toString(),
          creator_id: creatorId,
          amount_usdc: priceUsdc,
          tx_signature: txSig
        });

      if (error) throw error;

      // Also ensure followed
      if (!subscriptions.has(creatorWallet)) {
        await toggleFollow(creatorId, creatorWallet);
      }

      setSubscriptions(prev => new Set([...prev, creatorWallet]));

      const balance = await getUsdcBalance(publicKey.toString());
      setUsdcBalance(balance);

      success('Subscription successful!');
    } catch (err) {
      console.error(err);
      toastError(err.message || 'Subscription failed');
    }
  }, [connected, publicKey, subscriptions, toggleFollow, success, toastError]);

  const disconnect = () => {
    disconnectWallet();
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      wallet: publicKey?.toString() || null,
      isConnected: connected,
      usdcBalance,
      loading,
      subscriptions,
      unlockedPosts,
      notifications,
      setNotifications,
      unlockPost,
      toggleFollow,
      subscribe,
      disconnectWallet: disconnect
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
