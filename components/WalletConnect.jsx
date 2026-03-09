'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function WalletConnect({ message = "Connect your Solana wallet to subscribe, message creators, and unlock exclusive content." }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px' }}>
      <div style={{ background: 'white', border: '1px solid #E8E8E8', borderRadius: 16, padding: '48px 32px', textAlign: 'center', maxWidth: 420, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <img src="/fox.svg" alt="fox logo" style={{ width: 80, height: 80, margin: '0 auto 24px', display: 'block' }} />
        <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 12, color: '#24272A' }}>Welcome to STUDIO</h2>
        <p style={{ color: '#6A737D', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <WalletMultiButton className="btn-primary" />
        </div>
        <p style={{ color: '#9FA6AE', fontSize: 13 }}>First time? <a href="https://phantom.app" target="_blank" style={{ color: '#F6851B', fontWeight: 600 }}>Get a wallet</a></p>
      </div>
    </div>
  );
}
