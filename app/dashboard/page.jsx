'use client';
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import {
    TrendingUp, Users, DollarSign,
    ArrowUpRight, Clock, Award,
    BarChart2, MoreHorizontal
} from 'lucide-react';

function DashboardCard({ title, value, subtitle, icon: Icon, color = '#F6851B' }) {
    return (
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#6A737D', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
                <div style={{ padding: 8, background: `${color}15`, borderRadius: 8, color }}>
                    <Icon size={18} />
                </div>
            </div>
            <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#24272A' }}>{value}</div>
                <div style={{ fontSize: 13, color: '#28A745', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} /> {subtitle}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { wallet, isConnected, user } = useApp();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarned: 0,
        thisMonth: 0,
        subscribers: 0,
        recentTx: [],
        topPosts: []
    });

    useEffect(() => {
        if (!isConnected) return;
        if (user && !user.is_creator) {
            router.push('/become-creator');
            return;
        }

        const fetchDashboardData = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                // Query subscriptions for earnings
                const { data: subs, error: subError } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('creator_id', user.id);

                if (subError) throw subError;

                const now = new Date();
                const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const total = subs.reduce((acc, s) => acc + (parseFloat(s.amount_usdc) || 0), 0);
                const month = subs.filter(s => new Date(s.created_at) >= firstOfMonth)
                    .reduce((acc, s) => acc + (parseFloat(s.amount_usdc) || 0), 0);
                const activeSubs = subs.length; // Simplified for now

                // Recent transactions
                const recent = subs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

                // Top posts
                const { data: posts, error: postError } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('creator_id', user.id)
                    .order('unlock_count', { ascending: false })
                    .limit(5);

                setStats({
                    totalEarned: total,
                    thisMonth: month,
                    subscribers: activeSubs,
                    recentTx: recent,
                    topPosts: posts || []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchDashboardData();
    }, [isConnected, user, router]);

    if (!isConnected) {
        return (
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Connect your wallet</h2>
                <p style={{ color: '#6A737D', marginTop: 12 }}>Please connect your wallet to view your creator dashboard.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: 32 }}>
                <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 32 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 32 }}>
                    {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}
                </div>
                <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 12 }} />
            </div>
        );
    }

    return (
        <div className="fade-up" style={{ padding: 40, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: '#24272A' }}>Dashboard</h1>
                    <p style={{ color: '#6A737D', marginTop: 4 }}>Manage your content, earnings, and fans.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ArrowUpRight size={18} /> Withdraw Earnings
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
                <DashboardCard title="Total Earned" value={`${stats.totalEarned.toFixed(2)} USDC`} subtitle="Net volume" icon={DollarSign} />
                <DashboardCard title="This Month" value={`${stats.thisMonth.toFixed(2)} USDC`} subtitle="Last 30 days" icon={BarChart2} color="#037DD6" />
                <DashboardCard title="Active Subscribers" value={stats.subscribers} subtitle="Paying fans" icon={Users} color="#28A745" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
                {/* Recent Transactions */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E8E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Recent Transactions</h3>
                        <button style={{ background: 'none', border: 'none', color: '#037DD6', fontSize: 13, fontWeight: 700 }}>View All</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F8F8F8', textAlign: 'left' }}>
                                <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6A737D' }}>WALLET</th>
                                <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6A737D' }}>AMOUNT</th>
                                <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6A737D' }}>DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentTx.map((tx, i) => (
                                <tr key={i} style={{ borderTop: '1px solid #E8E8E8' }}>
                                    <td style={{ padding: '16px 24px', fontSize: 14, fontFamily: 'monospace', color: '#24272A' }}>
                                        {tx.subscriber_wallet.slice(0, 6)}...{tx.subscriber_wallet.slice(-4)}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: '#F6851B' }}>
                                        {tx.amount_usdc} USDC
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, color: '#6A737D' }}>
                                        {new Date(tx.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {stats.recentTx.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#9FA6AE' }}>No transactions yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Top Posts */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Top posts by unlocks</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {stats.topPosts.map((post, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 8, background: '#F2F4F6', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                                    {post.media_url ? <img src={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Clock size={20} color="#E8E8E8" style={{ margin: 14 }} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                                    <div style={{ fontSize: 12, color: '#6A737D' }}>{post.unlock_count || 0} unlocks</div>
                                </div>
                                <div style={{ color: '#F6851B' }}>
                                    <Award size={18} />
                                </div>
                            </div>
                        ))}
                        {stats.topPosts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: '#9FA6AE', fontSize: 13 }}>No paid posts yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
