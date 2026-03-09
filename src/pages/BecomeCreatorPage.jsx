import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, DollarSign, Rocket, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { updateUserProfile } from '../lib/db';
import WalletConnect from '../components/WalletConnect';

const TAGS = ['Lifestyle', 'Fitness', 'Fashion', 'Beauty', 'Art', 'Aesthetic', 'Travel'];

export default function BecomeCreatorPage() {
  const { isConnected, wallet, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    tags: [],
    subscriptionPrice: 5.00,
    trialDays: 0,
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.display_name || '',
        bio: user.bio || '',
        avatarUrl: user.avatar_url || '',
      }));
    }
  }, [user]);

  const handleToggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleLaunch = async () => {
    setLoading(true);
    try {
      await updateUserProfile(wallet, {
        display_name: formData.displayName,
        bio: formData.bio,
        avatar_url: formData.avatarUrl,
        is_creator: 1,
        subscription_price_usdc: formData.subscriptionPrice,
        trial_days: formData.trialDays
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/@/${wallet}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to launch creator page:', error);
      alert('Failed to launch. Please try again.');
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ padding: '80px 0' }}>
        <WalletConnect />
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        height: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🐰</div>
        <h2 style={{ fontFamily: 'Syne', fontSize: '32px', fontWeight: 800, color: 'var(--accent)' }}>
          Your page is live!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
          Taking you there now...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>
          Become a Creator
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Set up your creator profile and start earning USDC</p>
      </header>

      {/* Progress handle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: s <= step ? 'var(--accent)' : 'var(--bg-secondary)'
          }} />
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px' }}>
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
                <User size={24} />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, margin: 0 }}>Basic Profile</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Bunny Queen"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell your fans about yourself..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '100px', resize: 'none', fontFamily: 'DM Sans' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Avatar URL</label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>Categories</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      style={{
                        padding: '8px 16px', borderRadius: '999px', border: '1px solid var(--border)',
                        background: formData.tags.includes(tag) ? 'var(--accent)' : 'transparent',
                        color: formData.tags.includes(tag) ? 'white' : 'var(--text-secondary)',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >{tag}</button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.displayName}
              style={{ width: '100%', marginTop: '32px', padding: '14px', borderRadius: '999px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}
            >Next: Pricing</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
                <DollarSign size={24} />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, margin: 0 }}>Membership Pricing</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Monthly Price (USDC)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={formData.subscriptionPrice}
                    onChange={e => setFormData({ ...formData, subscriptionPrice: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }}
                  />
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Set to 0.00 for a free membership.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Free Trial Days</label>
                <input
                  type="range" min="0" max="30" step="1"
                  value={formData.trialDays}
                  onChange={e => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                  style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>No trial</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formData.trialDays} days</span>
                  <span>30 days</span>
                </div>
              </div>

              <div style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.2)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <CheckCircle size={18} color="var(--green)" />
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>Revenue Share</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  You keep <strong>90%</strong> of all revenue. A 5% developer fee and 5% broker fee are automatically applied.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '14px', borderRadius: '999px', border: '1.5px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}
              >Back</button>
              <button
                onClick={() => setStep(3)}
                style={{ flex: 2, padding: '14px', borderRadius: '999px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}
              >Review & Launch</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
                <Rocket size={24} />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, margin: 0 }}>Almost Ready!</h2>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={formData.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=bunny'} style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-card)' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{formData.displayName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{wallet.slice(0, 4)}...{wallet.slice(-4)}</div>
                </div>
              </div>
              <div style={{ padding: '16px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subscription</span>
                  <span>{formData.subscriptionPrice > 0 ? `${formData.subscriptionPrice.toFixed(2)} USDC` : 'Free'}</span>
                </div>
                {formData.trialDays > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Free Trial</span>
                    <span>{formData.trialDays} Days</span>
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>
              By clicking "Launch My Page", you agree to the creator terms of service. Your profile will be instantly visible to all fans.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                style={{ flex: 1, padding: '14px', borderRadius: '999px', border: '1.5px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}
              >Back</button>
              <button
                onClick={handleLaunch}
                disabled={loading}
                style={{
                  flex: 2, padding: '14px', borderRadius: '999px', border: 'none',
                  background: 'var(--accent)', color: 'white', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Syne',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
                {loading ? 'Launching...' : 'Launch My Page'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
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
