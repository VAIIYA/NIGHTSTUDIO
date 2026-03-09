'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet, ExternalLink, ArrowUpRight,
  ArrowDownLeft, Zap, RefreshCcw,
  History, CreditCard, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { truncateWallet } from '../../lib/solana';
import WalletConnect from '../../components/WalletConnect';
import { supabase } from '../../lib/supabase';

export default function WalletPage() {
  const { isConnected, wallet, usdcBalance } = useApp();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      // Query subscriptions where either creator or subscriber is the user
      // This is a simplified view of 'transactions'
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, creator:creators(*)')
        .or(`subscriber_wallet.eq.${wallet},creator_wallet.eq.${wallet}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTxs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) fetchTransactions();
    document.title = 'STUDIO — Wallet';
  }, [isConnected, wallet]);

  if (!isConnected) return <WalletConnect message="Connect your wallet to view your balance and transaction history." />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 0' }} className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#24272A', marginBottom: 8 }}>Wallet</h1>
        <p style={{ color: '#6A737D' }}>Manage your funds and view transaction history.</p>
      </div>

      {/* Modern Balance Card */}
      <div style={{
        background: 'white',
        border: '1px solid #E8E8E8',
        borderRadius: 24,
        padding: '40px',
        marginBottom: 32,
        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(246,133,27,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#6A737D', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Total Balance</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#24272A', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                {usdcBalance.toFixed(2)}
                <span style={{ fontSize: 20, color: '#F6851B' }}>USDC</span>
              </div>
            </div>
            <div style={{ background: '#F8F8F8', padding: '12px 20px', borderRadius: 16, border: '1px solid #E8E8E8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, background: '#28A745', borderRadius: '50%' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#24272A' }}>{truncateWallet(wallet)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowUpRight size={18} /> Send
            </button>
            <button className="btn-secondary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowDownLeft size={18} /> Receive
            </button>
            <button className="btn-secondary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCcw size={18} /> Swap
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
        {/* Transactions list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#24272A', display: 'flex', alignItems: 'center', gap: 10 }}>
              <History size={20} /> Activity
            </h3>
            <button onClick={fetchTransactions} style={{ background: 'none', border: 'none', color: '#037DD6', fontSize: 13, fontWeight: 700 }}>Refresh</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)
            ) : txs.map(tx => {
              const isReceive = tx.creator_wallet === wallet;
              return (
                <div key={tx.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: isReceive ? '#E8F5E9' : '#FFF4EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isReceive ? <ArrowDownLeft size={20} color="#28A745" /> : <ArrowUpRight size={20} color="#F6851B" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#24272A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isReceive ? `From ${tx.subscriber_wallet.slice(0, 8)}...` : `Subscription to ${tx.creator?.display_name || 'Creator'}`}
                    </div>
                    <div style={{ fontSize: 13, color: '#9FA6AE', marginTop: 2 }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: isReceive ? '#28A745' : '#24272A' }}>
                      {isReceive ? '+' : '-'}{tx.amount_usdc} USDC
                    </div>
                    <a href={`https://solscan.io/account/${wallet}`} target="_blank" style={{ fontSize: 11, color: '#037DD6', textDecoration: 'none' }}>Success</a>
                  </div>
                </div>
              );
            })}
            {!loading && txs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8F8F8', borderRadius: 20, color: '#9FA6AE' }}>
                No transactions yet.
              </div>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={18} color="#F6851B" /> Security
            </h3>
            <p style={{ fontSize: 13, color: '#6A737D', lineHeight: 1.5, marginBottom: 16 }}>
              Your funds are secured on the Solana blockchain. STUDIO does not have access to your private keys.
            </p>
            <div style={{ fontSize: 13, background: '#F8F8F8', padding: 12, borderRadius: 8, color: '#24272A' }}>
              <strong>Network:</strong> Solana Mainnet
            </div>
          </div>

          <div className="card" style={{ padding: 24, background: '#F6851B', border: 'none' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 12 }}>USDC Stablecoin</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, marginBottom: 20 }}>
              All transactions on STUDIO are powered by USDC, ensuring your earnings and payments are stable and globally accessible.
            </p>
            <button style={{ width: '100%', padding: '10px', borderRadius: 100, background: 'white', border: 'none', color: '#F6851B', fontWeight: 800, fontSize: 13 }}>
              Learn more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
