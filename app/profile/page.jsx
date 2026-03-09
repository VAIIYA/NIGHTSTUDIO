'use client';
import { useState, useEffect, Suspense } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import {
    UserCircle, Edit3, Calendar, Users,
    LayoutGrid, Info, CheckCircle, Lock,
    ThumbsUp, MessageSquare, Plus, Save, X
} from 'lucide-react';
import WalletConnect from '../../components/WalletConnect';
import Link from 'next/link';

function ProfileSkeleton() {
    return (
        <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
            <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: '0 0 12px 12px' }} />
            <div style={{ padding: '0 24px' }}>
                <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%', marginTop: -50, border: '4px solid white' }} />
                <div className="skeleton" style={{ width: 200, height: 24, marginTop: 16 }} />
                <div className="skeleton" style={{ width: 150, height: 16, marginTop: 8 }} />
                <div className="skeleton" style={{ width: '100%', height: 60, marginTop: 16 }} />
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { wallet: connectedWallet, isConnected } = useApp();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [tab, setTab] = useState('posts');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        display_name: '',
        bio: '',
        avatar_url: '',
        cover_url: '',
        tags: [],
        subscription_price: 0
    });

    const fetchProfile = async () => {
        if (!connectedWallet) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('creators')
                .select('*')
                .eq('wallet_address', connectedWallet)
                .single();

            if (data) {
                setProfile(data);
                setEditForm({
                    display_name: data.display_name,
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || '',
                    cover_url: data.cover_url || '',
                    tags: data.tags || [],
                    subscription_price: data.subscription_price || 0
                });

                // Fetch posts
                const { data: creatorPosts } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('creator_id', data.id)
                    .order('created_at', { ascending: false });

                setPosts(creatorPosts || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [connectedWallet]);

    const handleSaveProfile = async () => {
        if (!connectedWallet) return;
        try {
            const { error } = await supabase
                .from('creators')
                .upsert({
                    wallet_address: connectedWallet,
                    ...editForm
                });

            if (error) throw error;

            success('Profile updated successfully!');
            setIsEditModalOpen(false);
            fetchProfile();
        } catch (err) {
            console.error(err);
            toastError('Failed to save profile.');
        }
    };

    if (!isConnected) return <WalletConnect message="Connect your wallet to view your profile" />;
    if (loading) return <ProfileSkeleton />;

    if (!profile) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '100px 20px', textAlign: 'center' }}>
                <div style={{ background: '#FFF4EB', color: '#F6851B', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <UserCircle size={32} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Profile Not Set Up</h2>
                <p style={{ color: '#6A737D', maxWidth: 360, marginBottom: 32 }}>You haven't set up your creator profile yet. Fans won't be able to find you or subscribe.</p>
                <Link href="/become-creator" className="btn-primary" style={{ textDecoration: 'none' }}>Set Up Profile</Link>
            </div>
        );
    }

    return (
        <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
            {/* Banner */}
            <div style={{ position: 'relative', width: '100%', height: 200, background: profile.cover_url ? `url(${profile.cover_url})` : '#F2F4F6', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '0 0 16px 16px' }}>
                <div style={{ position: 'absolute', bottom: -50, left: 32, width: 100, height: 100, borderRadius: '50%', background: 'white', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                    <img src={profile.avatar_url || 'https://via.placeholder.com/150'} alt={profile.display_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
            </div>

            {/* Profile Details */}
            <div style={{ padding: '60px 32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#24272A', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {profile.display_name}
                            {profile.is_verified && <CheckCircle size={20} color="#037DD6" fill="#037DD6" />}
                        </h1>
                        <div style={{ color: '#6A737D', fontSize: 14, marginTop: 4 }}>
                            @{connectedWallet.slice(0, 4)}...{connectedWallet.slice(-4)} • Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                    <button className="btn-secondary" onClick={() => setIsEditModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Edit3 size={16} /> Edit Profile
                    </button>
                </div>

                <p style={{ fontSize: 16, color: '#24272A', lineHeight: 1.6, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                    {profile.bio || 'No bio yet.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    {profile.tags?.map(tag => (
                        <span key={tag} style={{ padding: '4px 12px', borderRadius: 999, background: '#F8F8F8', border: '1px solid #E8E8E8', fontSize: 13, color: '#6A737D' }}>
                            #{tag}
                        </span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 32, borderTop: '1px solid #E8E8E8', borderBottom: '1px solid #E8E8E8', padding: '16px 0' }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: '#24272A' }}>{profile.follower_count || 0}</div>
                        <div style={{ fontSize: 13, color: '#6A737D' }}>Followers</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: '#24272A' }}>{profile.post_count || 0}</div>
                        <div style={{ fontSize: 13, color: '#6A737D' }}>Posts</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: '#F6851B' }}>{profile.subscription_price} USDC</div>
                        <div style={{ fontSize: 13, color: '#6A737D' }}>Subscription/mo</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E8E8E8', padding: '0 32px' }}>
                <button onClick={() => setTab('posts')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: tab === 'posts' ? '3px solid #F6851B' : '3px solid transparent', color: tab === 'posts' ? '#F6851B' : '#6A737D', fontWeight: tab === 'posts' ? 800 : 600, fontSize: 15, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <LayoutGrid size={18} /> Posts
                </button>
                <button onClick={() => setTab('about')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: tab === 'about' ? '3px solid #F6851B' : '3px solid transparent', color: tab === 'about' ? '#F6851B' : '#6A737D', fontWeight: tab === 'about' ? 800 : 600, fontSize: 15, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Info size={18} /> About
                </button>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '24px 32px' }}>
                {tab === 'posts' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {posts.map(post => (
                            <div key={post.id} className="card" style={{ overflow: 'hidden' }}>
                                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#F8F8F8' }}>
                                    {post.media_url ? (
                                        <img src={post.media_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                    ) : (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserCircle size={40} color="#E8E8E8" />
                                        </div>
                                    )}
                                    {post.is_locked && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#24272A' }}>
                                            <Lock size={24} style={{ marginBottom: 8 }} />
                                            <div style={{ fontWeight: 800, fontSize: 13 }}>{post.unlock_price} USDC</div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: 16 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#24272A' }}>{post.title}</div>
                                    <div style={{ display: 'flex', gap: 16, color: '#6A737D', fontSize: 13 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={14} /> {post.like_count || 0}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={14} /> {post.comment_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {posts.length === 0 && (
                            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px 0', color: '#9FA6AE' }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
                                <div>No posts yet.</div>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'about' && (
                    <div style={{ background: '#F8F8F8', borderRadius: 12, padding: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <h4 style={{ fontSize: 14, color: '#6A737D', fontWeight: 600, marginBottom: 8 }}>FULL BIO</h4>
                                <p style={{ fontSize: 15, color: '#24272A', lineHeight: 1.6 }}>{profile.bio || 'Not provided.'}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 40 }}>
                                <div>
                                    <h4 style={{ fontSize: 14, color: '#6A737D', fontWeight: 600, marginBottom: 8 }}>JOINED</h4>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{new Date(profile.created_at).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 14, color: '#6A737D', fontWeight: 600, marginBottom: 8 }}>EARNINGS</h4>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#F6851B' }}>{profile.total_earned || 0} USDC</div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 14, color: '#6A737D', fontWeight: 600, marginBottom: 8 }}>SUBSCRIBERS</h4>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{profile.follower_count || 0} fans</div>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: 14, color: '#6A737D', fontWeight: 600, marginBottom: 8 }}>TAGS</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {profile.tags?.map(t => <span key={t} style={{ fontSize: 13, color: '#6A737D' }}>#{t}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="fade-up" style={{ background: 'white', borderRadius: 16, maxWidth: 500, width: '100%', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E8E8E8' }}>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>Edit Profile</div>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9FA6AE' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#6A737D' }}>DISPLAY NAME</label>
                                <input value={editForm.display_name} onChange={e => setEditForm({ ...editForm, display_name: e.target.value })} placeholder="Display name" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#6A737D' }}>BIO</label>
                                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Bio..." rows={3} style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: 8, padding: 12, width: '100%', fontSize: 14, fontFamily: 'DM Sans' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#6A737D' }}>AVATAR URL</label>
                                    <input value={editForm.avatar_url} onChange={e => setEditForm({ ...editForm, avatar_url: e.target.value })} placeholder="https://..." />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#6A737D' }}>COVER URL</label>
                                    <input value={editForm.cover_url} onChange={e => setEditForm({ ...editForm, cover_url: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#6A737D' }}>SUBSCRIPTION PRICE (USDC)</label>
                                <input type="number" step="0.01" value={editForm.subscription_price} onChange={e => setEditForm({ ...editForm, subscription_price: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                            </div>
                        </div>
                        <div style={{ padding: '16px 20px', background: '#F8F8F8', display: 'flex', gap: 12 }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleSaveProfile}>
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
