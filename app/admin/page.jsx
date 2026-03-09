'use client';
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getAllCreators, getAllUsers, getRecentPurchases, getPlatformStats, suspendCreator } from '../../lib/db';
import { truncateWallet } from '../../lib/solana';
import { Users, Zap, DollarSign, Shield, ExternalLink } from 'lucide-react';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '2Z9eW3nwa2GZUM1JzXdfBK1MN57RPA2PrhuTREEZ31VY';
const TABS = ['Creators', 'All Users', 'Purchases', 'Stats'];

export default function AdminPage() {
  const { wallet, isConnected } = useApp();
  const [tab, setTab] = useState('Stats');
  const [creators, setCreators] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'NIGHTSTUDIO — Admin'; }, []);

  useEffect(() => {
    if (!isConnected || wallet !== ADMIN_WALLET) return;
    const load = async () => {
      setLoading(true);
      const [c, u, p, s] = await Promise.all([getAllCreators(), getAllUsers(), getRecentPurchases(), getPlatformStats()]);
      setCreators(c); setUsers(u); setPurchases(p); setStats(s);
      setLoading(false);
    };
    load();
  }, [isConnected, wallet]);

  if (!isConnected || wallet !== ADMIN_WALLET) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Shield size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: 20, color: 'var(--text-secondary)', marginBottom: 8 }}>Access denied</div>
          <div style={{ fontSize: 14 }}>Admin wallet required</div>
        </div>
      </div>
    );
  }

  const handleSuspend = async (w) => {
    if (!confirm('Suspend this creator?')) return;
    await suspendCreator(w);
    setCreators(prev => prev.filter(c => c.wallet_address !== w));
  };

  const StatCard = ({ icon: Icon, label, value, color = 'var(--accent)' }) => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `rgba(${color === 'var(--accent)' ? '246,133,27' : color === 'var(--green)' ? '63,185,80' : color === 'var(--blue)' ? '3,125,214' : '248,81,73'}, 0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-jakarta)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 0' }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, background: 'var(--red-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="var(--red)" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Admin Panel</h1>
        <code style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '3px 8px', borderRadius: 6, marginLeft: 8 }}>{truncateWallet(wallet)}</code>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`, color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: tab === t ? 700 : 400, fontSize: 14, fontFamily: 'var(--font-jakarta)', transition: 'all 0.12s' }}>
            {t}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading data from Turso...</div>}

      {!loading && tab === 'Stats' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="var(--blue)" />
          <StatCard icon={Zap} label="Creators" value={stats.totalCreators} color="var(--accent)" />
          <StatCard icon={DollarSign} label="Purchases" value={stats.totalPurchases} color="var(--green)" />
          <StatCard icon={DollarSign} label="Volume (USDC)" value={parseFloat(stats.totalVolume || 0).toFixed(2)} color="var(--green)" />
        </div>
      )}

      {!loading && tab === 'Creators' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Wallet', 'Name', 'Price', 'Verified', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creators.length === 0 && <tr><td colSpan={5} style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>No creators yet</td></tr>}
              {creators.map(c => (
                <tr key={c.wallet_address} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{truncateWallet(c.wallet_address, 6)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.display_name || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--accent)' }}>{c.subscription_price_usdc} USDC</td>
                  <td style={{ padding: '12px 16px' }}>{c.is_verified ? '✓' : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleSuspend(c.wallet_address)} style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid var(--red)', background: 'var(--red-dim)', color: 'var(--red)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-jakarta)' }}>Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'All Users' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Wallet', 'Name', 'Creator', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && <tr><td colSpan={4} style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>No users yet</td></tr>}
              {users.map(u => (
                <tr key={u.wallet_address} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{truncateWallet(u.wallet_address, 6)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.display_name || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>{u.is_creator ? <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Yes</span> : '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 11 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'Purchases' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Buyer', 'Post', 'Amount', 'TX', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 && <tr><td colSpan={5} style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>No purchases yet</td></tr>}
              {purchases.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{truncateWallet(p.buyer_wallet, 4)}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{truncateWallet(p.post_id, 4)}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--green)', fontWeight: 700 }}>{p.amount_usdc} USDC</td>
                  <td style={{ padding: '12px 16px' }}>
                    <a href={`https://solscan.io/tx/${p.tx_signature}`} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                      {truncateWallet(p.tx_signature, 4)} <ExternalLink size={10} />
                    </a>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 11 }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
