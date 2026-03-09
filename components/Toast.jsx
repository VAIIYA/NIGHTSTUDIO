'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const success = (msg) => addToast(msg, 'success');
    const error = (msg) => addToast(msg, 'error');
    const info = (msg) => addToast(msg, 'info');

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        background: 'white',
                        minWidth: 300,
                        padding: '16px 20px',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        borderLeft: `4px solid ${t.type === 'success' ? '#28A745' : t.type === 'error' ? '#D73A49' : '#F6851B'}`,
                        display: 'flex', alignItems: 'center', gap: 12,
                        animation: 'slideIn 0.3s ease-out forwards',
                    }}>
                        {t.type === 'success' && <CheckCircle2 size={20} color="#28A745" />}
                        {t.type === 'error' && <AlertCircle size={20} color="#D73A49" />}
                        {t.type === 'info' && <Info size={20} color="#F6851B" />}
                        <span style={{ flex: 1, fontSize: 14, color: '#24272A', fontWeight: 500 }}>{t.message}</span>
                        <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', color: '#9FA6AE', padding: 4 }}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx;
};
