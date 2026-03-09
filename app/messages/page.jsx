'use client';
import { useState, useEffect } from 'react';
import { Search, Send } from 'lucide-react';
import { MOCK_MESSAGES } from '../../lib/mockData';
import { useApp } from '../../context/AppContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function MessagesPage() {
  const [selected, setSelected] = useState(MOCK_MESSAGES[0]);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [msgs, setMsgs] = useState([
    { id:1, from:'them', text:'hey!! glad you subbed 🥺', time:'2m' },
    { id:2, from:'them', text:'i posted new content today 🎬', time:'1m' },
  ]);
  const { subscriptions } = useApp();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isSubscribed = subscriptions.has(selected?.wallet_address);
  useEffect(() => { document.title = 'NIGHTSTUDIO — Messages'; }, []);

  const sendMsg = () => {
    if (!message.trim()) return;
    setMsgs(prev => [...prev, { id: Date.now(), from: 'me', text: message, time: 'now' }]);
    setMessage('');
  };

  const selectConv = (conv) => { setSelected(conv); setShowChat(true); };

  const ConvList = () => (
    <div style={{ width: isMobile ? '100%' : 270, flexShrink: 0, borderRight: isMobile ? 'none' : '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 18 }}>Messages</h2>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search..." style={{ paddingLeft: 32, fontSize: 13, padding: '9px 9px 9px 32px' }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {MOCK_MESSAGES.map(c => (
          <div key={c.id} onClick={() => selectConv(c)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer', background: selected?.id === c.id ? 'var(--accent-dim)' : 'transparent', borderLeft: `2px solid ${selected?.id === c.id ? 'var(--accent)' : 'transparent'}`, transition: 'background 0.12s' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={c.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              {c.isOnline && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--bg-secondary)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.display_name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</div>
            </div>
            {c.unread > 0 && <span style={{ background: 'var(--accent)', color: 'white', borderRadius: 999, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{c.unread}</span>}
          </div>
        ))}
      </div>
    </div>
  );

  const ChatPanel = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-jakarta)', marginRight: 4 }}>← Back</button>}
        <img src={selected?.avatar_url} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{selected?.display_name}</div>
          <div style={{ fontSize: 11, color: selected?.isOnline ? 'var(--green)' : 'var(--text-muted)' }}>{selected?.isOnline ? '● Online' : 'Offline'}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: m.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.from === 'me' ? 'var(--gradient-orange)' : 'var(--bg-card)', border: m.from === 'me' ? 'none' : '1px solid var(--border)', fontSize: 14, lineHeight: 1.5 }}>
              {m.text}
              <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: m.from === 'me' ? 'right' : 'left' }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
        <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder={isSubscribed ? 'Send a message...' : 'Subscribe to message'} disabled={!isSubscribed} style={{ borderRadius: 999 }} />
        <button onClick={sendMsg} disabled={!isSubscribed} style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: isSubscribed ? 'var(--gradient-orange)' : 'var(--bg-hover)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Send size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 40px)', maxWidth: 900, margin: '0 auto' }} className="fade-up">
      {(!isMobile || !showChat) && <ConvList />}
      {(!isMobile || showChat) && <ChatPanel />}
    </div>
  );
}
