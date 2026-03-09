'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function WalletConnect({ message = "Connect your Solana wallet to subscribe, message creators, and unlock exclusive content." }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 24, padding: '40px 32px', textAlign: 'center', maxWidth: 380, width: '100%' }}>
        <div style={{ width: 72, height: 72, background: 'var(--gradient-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 0 40px rgba(246,133,27,0.3)' }}>
          🎬
        </div>
        <h2 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 900, fontSize: 22, marginBottom: 10 }}>Connect to NIGHTSTUDIO</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <WalletMultiButton />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Supported: Phantom · Solflare</p>
      </div>
    </div>
  );
}
