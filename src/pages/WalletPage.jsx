import { useState } from 'react';
import { Zap, CreditCard, ArrowUpRight, ArrowDownLeft, Wallet, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MOCK_TRANSACTIONS = [
  { id: 1, type: 'unlock', description: 'Unlocked post by @babyxmillie', amount: -4.99, time: '2h ago', currency: 'USD' },
  { id: 2, type: 'tip', description: 'Tip to @anna.secret', amount: -10.00, time: '1d ago', currency: 'USD' },
  { id: 3, type: 'sub', description: 'Subscription to @anna.secret', amount: -9.99, time: '2d ago', currency: 'USD' },
];

export default function WalletPage() {
  const { solanaWallet, connectWallet } = useApp();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectWallet();
    } catch (err) {
      alert(err.message || 'Failed to connect wallet');
    }
    setConnecting(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 0' }}>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', marginBottom: '24px' }}>Wallet</h1>

      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(124,92,252,0.2) 0%, transparent 70%)' }} />
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Balance</div>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '36px', marginBottom: '20px' }}>$0.00</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            flex: 1, padding: '10px', borderRadius: '12px',
            border: '1.5px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans',
          }}>
            <Plus size={15} /> Add Funds
          </button>
          <button style={{
            flex: 1, padding: '10px', borderRadius: '12px',
            border: '1.5px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans',
          }}>
            <ArrowUpRight size={15} /> Withdraw
          </button>
        </div>
      </div>

      {/* Solana wallet */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(153,69,255,0.1), rgba(20,241,149,0.06))',
        border: '1px solid rgba(153,69,255,0.3)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #9945ff, #14f195)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '16px' }}>Solana Wallet</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pay for content with SOL</div>
          </div>
        </div>

        {solanaWallet ? (
          <div>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#14f195',
              marginBottom: '12px',
              wordBreak: 'break-all',
            }}>
              {solanaWallet}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              ✓ Connected — ready to unlock content with Solana
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              Connect your Phantom wallet to pay for exclusive content instantly with SOL. Near-zero fees, lightning fast.
            </div>
            <button
              onClick={handleConnect}
              disabled={connecting}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #9945ff, #14f195)',
                color: 'white',
                fontWeight: 700, fontSize: '14px',
                cursor: connecting ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <Zap size={16} />
              {connecting ? 'Connecting...' : 'Connect Phantom Wallet'}
            </button>
          </div>
        )}
      </div>

      {/* Fee Breakdown Info */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '12px', background: 'var(--accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
        }}>
          <Zap size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>Transparent Protocol Fees</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Creators receive 90% of all payments. Protocol fees (Developer 5% · Broker 5%) are automatically split on-chain.
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, margin: '0 0 16px', fontSize: '16px' }}>Payment Methods</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-hover)', borderRadius: '12px', marginBottom: '10px' }}>
          <CreditCard size={20} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Add Credit Card</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Visa, Mastercard, Amex</div>
          </div>
          <button style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '8px', border: '1.5px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans' }}>
            Add
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
          <Wallet size={20} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Google Pay / Apple Pay</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>One-tap payments</div>
          </div>
          <button style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '8px', border: '1.5px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans' }}>
            Add
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '16px', fontSize: '16px' }}>Transaction History</h3>
        {MOCK_TRANSACTIONS.map(tx => (
          <div key={tx.id} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: '10px',
              background: tx.amount < 0 ? 'rgba(244,63,94,0.1)' : 'var(--green-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {tx.amount < 0
                ? <ArrowUpRight size={16} color="#f43f5e" />
                : <ArrowDownLeft size={16} color="var(--green)" />
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{tx.description}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.time}</div>
            </div>
            <div style={{ fontWeight: 600, color: tx.amount < 0 ? '#f43f5e' : 'var(--green)', fontSize: '15px' }}>
              {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
