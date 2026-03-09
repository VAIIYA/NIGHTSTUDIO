'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import { updateUserProfile } from '../../lib/db';
import WalletConnect from '../../components/WalletConnect';
import { calculateSplit } from '../../lib/solana';

const STEP_LABELS = ['Profile', 'Pricing', 'Launch'];
const TAGS = ['lifestyle', 'fitness', 'fashion', 'beauty', 'art', 'aesthetic', 'travel', 'gaming', 'cooking', 'music', 'wellness', 'modeling'];

export default function BecomeCreatorPage() {
  const router = useRouter();
  const { isConnected, wallet, user, setUser } = useApp();
  const [step, setStep] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    display_name: '', bio: '', avatar_url: '', tags: [],
    subscription_price_usdc: 0, trial_days: 7,
  });

  useEffect(() => { document.title = 'NIGHTSTUDIO — Become a Creator'; }, []);
  useEffect(() => {
    if (user) setForm(f => ({ ...f, display_name: user.display_name || '', bio: user.bio || '', avatar_url: user.avatar_url || '' }));
  }, [user]);

  if (!isConnected) return <WalletConnect message="Connect your wallet to start your creator page." />;

  const split = calculateSplit(form.subscription_price_usdc || 10);

  const { success, error: toastError } = useToast();

  const handleLaunch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('creators')
        .upsert({
          wallet_address: wallet,
          display_name: form.display_name,
          bio: form.bio,
          avatar_url: form.avatar_url,
          tags: form.tags,
          subscription_price: parseFloat(form.subscription_price_usdc) || 0,
        })
        .select()
        .single();

      if (error) throw error;

      setUser({ ...data, is_creator: true });
      success('Creator profile created successfully!');
      setLaunched(true);
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err) {
      console.error(err);
      toastError('Failed to create profile. Please try again.');
    }
    setLoading(false);
  };

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTag = (t) => setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] }));

  if (launched) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-jakarta)', marginBottom: 8 }}>Your page is live!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Redirecting you now...</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 0' }} className="fade-up">
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Become a Creator</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Set up your page in minutes. Keep 90% of every dollar.</p>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
        {STEP_LABELS.map((label, i) => (
          <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: i < step ? 'var(--gradient-orange)' : i === step ? 'var(--accent-dim)' : 'var(--bg-card)', border: `2px solid ${i <= step ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, transition: 'all 0.2s' }}>
                {i < step ? <CheckCircle size={16} color="white" fill="white" /> : <span style={{ fontSize: 13, fontWeight: 700, color: i === step ? 'var(--accent)' : 'var(--text-muted)' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 11, color: i === step ? 'var(--accent)' : 'var(--text-muted)', fontWeight: i === step ? 700 : 400 }}>{label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: i < step ? 'var(--accent)' : 'var(--border)', marginBottom: 20, transition: 'background 0.2s' }} />}
          </div>
        ))}
      </div>

      {/* Step 0: Profile */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Display Name *</label>
            <input value={form.display_name} onChange={e => update('display_name', e.target.value)} placeholder="Your creator name" />
            {form.display_name && form.display_name.length < 3 && (
              <p className="text-red-500 text-sm mt-1">Display name must be at least 3 characters</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Bio</label>
            <textarea value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell fans about yourself..." rows={3} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', padding: '12px 16px', width: '100%', resize: 'vertical', fontFamily: 'var(--font-inter)', fontSize: 14, outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Avatar URL</label>
            <input value={form.avatar_url} onChange={e => update('avatar_url', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TAGS.map(t => (
                <button key={t} onClick={() => toggleTag(t)} style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${form.tags.includes(t) ? 'var(--accent)' : 'var(--border)'}`, background: form.tags.includes(t) ? 'var(--accent-dim)' : 'transparent', color: form.tags.includes(t) ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, fontWeight: form.tags.includes(t) ? 700 : 400, fontFamily: 'var(--font-jakarta)', transition: 'all 0.12s' }}>
                  #{t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(1)} disabled={form.display_name.length < 3} style={{ padding: '14px', borderRadius: 999, border: 'none', background: form.display_name.length >= 3 ? 'var(--accent)' : '#E8E8E8', color: 'white', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-jakarta)', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Pricing */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Monthly Subscription Price (USDC)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" value={form.subscription_price_usdc} onChange={e => update('subscription_price_usdc', e.target.value)} min="0" max="99.99" step="0.01" placeholder="0 = Free" />
              <span style={{ color: 'var(--text-muted)', fontSize: 13, flexShrink: 0 }}>USDC / mo</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Set to 0 to make your page free to follow</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Free Trial (days)</label>
            <input type="number" value={form.trial_days} onChange={e => update('trial_days', e.target.value)} min="0" max="30" placeholder="0 = No trial" />
          </div>

          {/* Split preview card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(246,133,27,0.2)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Zap size={14} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)' }}>
                Your earnings per ${form.subscription_price_usdc || 10} USDC
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'You earn', amount: split.creator, color: 'var(--green)', pct: '90%' },
                { label: 'Platform', amount: split.developer, color: 'var(--text-muted)', pct: '5%' },
                { label: 'Network', amount: split.broker, color: 'var(--text-muted)', pct: '5%' },
              ].map(r => (
                <div key={r.label} style={{ flex: 1, background: 'var(--bg-hover)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-jakarta)', color: r.color, marginBottom: 4 }}>{r.amount}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>USDC</div>
                  <div style={{ fontSize: 10, color: r.color, fontWeight: 600 }}>{r.label} ({r.pct})</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(0)} style={{ flex: 1, padding: '13px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, fontFamily: 'var(--font-jakarta)' }}>Back</button>
            <button onClick={() => setStep(2)} style={{ flex: 2, padding: '13px', borderRadius: 999, border: 'none', background: 'var(--gradient-orange)', color: 'white', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Launch */}
      {step === 2 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 20 }}>
            {form.avatar_url && <img src={form.avatar_url} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px' }} />}
            <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 900, fontSize: 20, marginBottom: 6 }}>{form.display_name}</div>
            {form.bio && <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{form.bio}</div>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 13, flexWrap: 'wrap' }}>
              <span style={{ color: form.subscription_price_usdc == 0 ? 'var(--green)' : 'var(--accent)', fontWeight: 700 }}>
                {form.subscription_price_usdc == 0 ? '✓ Free' : `${form.subscription_price_usdc} USDC/mo`}
              </span>
              {form.trial_days > 0 && <span style={{ color: 'var(--text-muted)' }}>· {form.trial_days} day free trial</span>}
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Your wallet is your identity. No review needed — your page goes live instantly.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, fontFamily: 'var(--font-jakarta)' }}>Back</button>
            <button onClick={handleLaunch} disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: 999, border: 'none', background: loading ? 'var(--bg-hover)' : 'var(--gradient-orange)', color: 'white', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-jakarta)', boxShadow: loading ? 'none' : '0 4px 20px rgba(246,133,27,0.35)' }}>
              {loading ? 'Launching...' : '🎬 Launch My Page'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
