import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function WalletConnect() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            background: 'var(--bg-secondary)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            maxWidth: '400px',
            margin: '40px auto',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐰</div>
            <h2 style={{
                fontFamily: 'Syne',
                fontSize: '24px',
                fontWeight: 800,
                margin: '0 0 12px',
                color: 'var(--text-primary)',
            }}>
                BUNNY RANCH
            </h2>
            <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                margin: '0 0 8px',
                color: 'var(--text-primary)',
            }}>
                Connect your wallet to continue
            </h3>
            <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: '0 0 24px',
                lineHeight: 1.5,
            }}>
                Subscribe to creators, unlock exclusive content, and send messages — all with your Solana wallet.
            </p>

            <div className="wallet-btn-custom">
                <WalletMultiButton />
            </div>

            <div style={{
                marginTop: '24px',
                fontSize: '12px',
                color: 'var(--text-muted)',
            }}>
                Supported wallets: Phantom · Solflare
            </div>

            <style>{`
        .wallet-btn-custom .wallet-adapter-button {
          background-color: var(--accent) !important;
          border-radius: 999px !important;
          font-family: 'Syne', sans-serif !important;
          font-weight: 700 !important;
          height: 48px !important;
          padding: 0 24px !important;
        }
        .wallet-btn-custom .wallet-adapter-button:hover {
          background-color: var(--accent-hover) !important;
        }
      `}</style>
        </div>
    );
}
