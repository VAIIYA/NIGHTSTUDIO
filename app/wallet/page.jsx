'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Wallet, ExternalLink, ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { truncateWallet, calculateSplit } from '../../lib/solana';
import WalletConnect from '../../components/WalletConnect';

const MOCK_TXS = [
  { id: 1, type: 'unlock', label: 'Unlocked post', amount: -4.99, sig: '4xKq...Ab3m', time: '2h ago' },
  { id: 2, type: 'subscribe', label: 'Subscribed to Millie', amount: -9.99, sig: '7yLm...Pq2n', time: '1d ago' },
  { id: 3, type: 'receive', label: 'Received tip', amount: +2.00, sig: '9zRt...Kw5p', time: '2d ago' },
  { id: 4, type: 'unlock', label: 'Unlocked video', amount: -14.99, sig: '2mNs...Vb8x', time: '3d ago' },
];

export default function WalletPage() {
  const { isConnected, wallet, usdcBalance } = useApp();
  useEffect(() => { document.title = 'NIGHTSTUDIO — Wallet'; }, []);

  if (!isConnected) return <WalletConnect message="Connect your wallet to view your balance and transaction history." />;

  const split = calculateSplit(10);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 0' }} className="fade-up">
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Wallet</h1>

      {/* Balance card */}
      <div style={{ background: 'linear-gradient(135deg, #1a1f2e, #161b22)', border: '1px solid rgba(246,133,27,0.3)', borderRadius: 20, padding: '28px 24px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'radial-gradient(circle, rgba(246,133,27,0.12), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>USDC Balance</div>
        <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'var(--font-jakarta)', background: 'var(--gradient-orange)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
          {usdcBalance.toFixed(2)}
          <span style={{ fontSize: 18, marginLeft: 6 }}>USDC</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <code style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 8 }}>{truncateWallet(wallet, 6)}</code>
          <a href={`https://solscan.io/account/${wallet}`} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
            Solscan <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <Link href="/discover" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)' }}>Subscribe</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Support creators</div>
          </div>
        </Link>
        <Link href="/become-creator" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ width: 36, height: 36, background: 'var(--green-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownLeft size={16} color="var(--green)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)' }}>Earn</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Become a creator</div>
          </div>
        </Link>
      </div>

      {/* Payment split info */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Zap size={14} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)' }}>Payment Split (per $10 USDC)</span>
        </div>
        {[
          { label: 'Creator', pct: '90%', amount: split.creator, color: 'var(--green)' },
          { label: 'Platform fee', pct: '5%', amount: split.developer, color: 'var(--text-muted)' },
          { label: 'Network fee', pct: '5%', amount: split.broker, color: 'var(--text-muted)' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: r.pct, background: r.color === 'var(--green)' ? 'var(--gradient-orange)' : 'var(--bg-elevated)', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, color: r.color, fontWeight: 600, width: 30, textAlign: 'right' }}>{r.pct}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60, textAlign: 'right' }}>{r.amount} USDC</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 80 }}>{r.label}</span>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)' }}>Recent Transactions</div>
        {MOCK_TXS.map(tx => (
          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.amount > 0 ? 'var(--green-dim)' : 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tx.amount > 0 ? <ArrowDownLeft size={15} color="var(--green)" /> : <ArrowUpRight size={15} color="var(--accent)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.time}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: tx.amount > 0 ? 'var(--green)' : 'var(--text-primary)' }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} USDC
              </div>
              <a href={`https://solscan.io/tx/${tx.sig}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                {tx.sig} <ExternalLink size={9} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
