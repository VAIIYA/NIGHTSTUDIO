'use client';
import { useState } from 'react';
import { X, Image as ImageIcon, Lock, Unlock, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';

export default function NewPostModal({ isOpen, onClose, creatorId }) {
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        content: '',
        media_url: '',
        is_locked: false,
        unlock_price: 0
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title && !form.content) {
            toastError('Post must have a title or content');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .insert({
                    creator_id: creatorId,
                    title: form.title,
                    content: form.content,
                    media_url: form.media_url,
                    is_locked: form.is_locked,
                    unlock_price: form.is_locked ? parseFloat(form.unlock_price) : 0
                })
                .select()
                .single();

            if (error) throw error;

            success('Post published successfully!');
            onClose();
            // Reset form
            setForm({ title: '', content: '', media_url: '', is_locked: false, unlock_price: 0 });
            // Optionally refresh page or feed
            window.location.reload();
        } catch (err) {
            console.error(err);
            toastError('Failed to publish post.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', z_index: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="fade-up" style={{ background: 'white', borderRadius: 16, maxWidth: 500, width: '100%', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #E8E8E8' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>Create New Post</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9FA6AE' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#6A737D' }}>TITLE</label>
                        <input
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="What's on your mind?"
                            style={{ fontWeight: 600 }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#6A737D' }}>CONTENT</label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            placeholder="Write something for your fans..."
                            rows={4}
                            style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: 8, padding: 12, width: '100%', fontSize: 15, fontFamily: 'DM Sans', resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#6A737D' }}>MEDIA URL (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <ImageIcon size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9FA6AE' }} />
                            <input
                                value={form.media_url}
                                onChange={e => setForm({ ...form, media_url: e.target.value })}
                                placeholder="https://image-url.com/pic.jpg"
                                style={{ paddingLeft: 44 }}
                            />
                        </div>
                        {form.media_url && (
                            <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8' }}>
                                <img src={form.media_url} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F8F8', padding: '12px 16px', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {form.is_locked ? <Lock size={18} color="#F6851B" /> : <Unlock size={18} color="#9FA6AE" />}
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>Lock this post</div>
                                <div style={{ fontSize: 12, color: '#6A737D' }}>Only unlocked for paying fans or via purchase</div>
                            </div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={form.is_locked} onChange={e => setForm({ ...form, is_locked: e.target.checked })} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {form.is_locked && (
                        <div className="fade-up">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#6A737D' }}>UNLOCK PRICE (USDC)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.unlock_price}
                                onChange={e => setForm({ ...form, unlock_price: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Publish Post</>}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #E8E8E8;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider { background-color: #F6851B; }
        input:checked + .slider:before { transform: translateX(20px); }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
