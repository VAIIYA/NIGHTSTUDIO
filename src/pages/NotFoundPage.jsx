import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', background: 'var(--bg-primary)'
        }}>
            <div style={{ fontSize: '120px', marginBottom: '24px' }}>🐰</div>
            <h1 style={{ fontFamily: 'Syne', fontSize: '48px', fontWeight: 800, margin: '0 0 16px' }}>404</h1>
            <h2 style={{ fontFamily: 'Syne', fontSize: '24px', fontWeight: 700, margin: '0 0 32px', color: 'var(--text-muted)' }}>
                Page not found
            </h2>
            <button
                onClick={() => navigate('/')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '16px 32px', borderRadius: '999px', border: 'none',
                    background: 'var(--accent)', color: 'white', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Syne', transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Home size={20} />
                Go Home
            </button>
        </div>
    );
}
