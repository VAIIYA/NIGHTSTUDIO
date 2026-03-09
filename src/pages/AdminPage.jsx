import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
    Users, UserCheck, ShoppingCart, TrendingUp,
    ExternalLink, Ban, Loader2, LogOut, Copy, Check
} from 'lucide-react';
import { getAllCreators, getAllUsers, getRecentPurchases, getPlatformStats, suspendCreator } from '../lib/db';
import { truncateWallet } from '../lib/solana';

const ADMIN_WALLET = '2Z9eW3nwa2GZUM1JzXdfBK1MN57RPA2PrhuTREEZ31VY';

export default function AdminPage() {
    const { wallet, isConnected, disconnectWallet } = useApp();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [creators, setCreators] = useState([]);
    const [users, setUsers] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [copying, setCopying] = useState(null);

    useEffect(() => {
        if (isConnected && wallet === ADMIN_WALLET) {
            loadData();
        }
    }, [isConnected, wallet]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [s, c, u, p] = await Promise.all([
                getPlatformStats(),
                getAllCreators(),
                getAllUsers(),
                getRecentPurchases(),
            ]);
            setStats(s);
            setCreators(c);
            setUsers(u);
            setPurchases(p);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (walletAddress) => {
        if (confirm(`Suspend creator ${walletAddress}?`)) {
            await suspendCreator(walletAddress);
            loadData();
        }
    };

    const handleCopy = (txt) => {
        navigator.clipboard.writeText(txt);
        setCopying(txt);
        setTimeout(() => setCopying(null), 2000);
    };

    // Restrict access
    if (!isConnected || wallet !== ADMIN_WALLET) {
        return <div style={{ height: '100vh', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Access denied.</div>;
    }

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={32} color="var(--accent)" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontFamily: 'Syne', fontSize: '28px', fontWeight: 800, margin: 0 }}>Bunny Ranch Admin</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Protocol Governance Dashboard</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{truncateWallet(wallet)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>VERIFIED ADMIN</div>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                    >
                        <LogOut size={14} /> Disconnect
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { icon: Users, label: 'Total Users', value: stats.totalUsers },
                    { icon: UserCheck, label: 'Total Creators', value: stats.totalCreators },
                    { icon: ShoppingCart, label: 'Total Purchases', value: stats.totalPurchases },
                    { icon: TrendingUp, label: 'USDC Volume', value: `${stats.totalVolume.toFixed(2)} USDC`, color: 'var(--green)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <s.icon size={16} /> {s.label}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Syne', color: s.color || 'var(--text-primary)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gap: '40px' }}>
                {/* New Creators */}
                <section>
                    <h2 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>New Creators</h2>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Wallet</th>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Display Name</th>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Price</th>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Joined</th>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {creators.map(c => (
                                    <tr key={c.wallet_address} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                                                {truncateWallet(c.wallet_address)}
                                                <button onClick={() => handleCopy(c.wallet_address)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                    {copying === c.wallet_address ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 600 }}>{c.display_name}</td>
                                        <td style={{ padding: '16px' }}>{c.subscription_price_usdc} USDC</td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <a href={`/@/${c.wallet_address}`} target="_blank" style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ExternalLink size={12} /> View
                                                </a>
                                                <button onClick={() => handleSuspend(c.wallet_address)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Ban size={12} /> Suspend
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Recent Purchases */}
                <section>
                    <h2 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Recent Purchases</h2>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Buyer</th>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Amount</th>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>TX Signature</th>
                                    <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px', fontFamily: 'monospace' }}>{truncateWallet(p.buyer_wallet)}</td>
                                        <td style={{ padding: '16px', fontWeight: 700, color: 'var(--green)' }}>{p.amount_usdc} USDC</td>
                                        <td style={{ padding: '16px' }}>
                                            <a href={`https://solscan.io/tx/${p.tx_signature}`} target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '12px', fontFamily: 'monospace' }}>
                                                {p.tx_signature.slice(0, 10)}...
                                            </a>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(p.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
