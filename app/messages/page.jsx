'use client';
import { useState, useEffect } from 'react';
import { Search, Send, ArrowLeft, MoreVertical, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { supabase } from '../../lib/supabase';
import WalletConnect from '../../components/WalletConnect';

export default function MessagesPage() {
  const { isConnected, wallet, subscriptions } = useApp();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isSubscribed = selected ? subscriptions.has(selected.wallet_address) : false;

  useEffect(() => {
    document.title = 'STUDIO — Messages';
    if (isConnected) fetchConversations();
  }, [isConnected, wallet]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Logic for fetching conversations from Supabase
      // For now, we'll fetch followed creators as potential conversations
      const { data: follows } = await supabase
        .from('follows')
        .select('creator_id')
        .eq('follower_wallet', wallet);

      if (follows && follows.length > 0) {
        const ids = follows.map(f => f.creator_id);
        const { data: creators } = await supabase
          .from('creators')
          .select('*')
          .in('id', ids);

        setConversations(creators || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConv = (conv) => {
    setSelected(conv);
    setShowChat(true);
    // Fetch actual messages for this conversation...
    setMessages([
      { id: 1, from: 'them', text: `Hi! Thanks for following. I'll be posting new content soon!`, time: '10:30 AM' },
      { id: 2, from: 'me', text: `Looking forward to it!`, time: '10:32 AM' }
    ]);
  };

  const sendMsg = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'me', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
  };

  if (!isConnected) return <WalletConnect message="Connect your wallet to chat with creators." />;

  const ConvList = () => (
    <div style={{
      width: isMobile ? '100%' : 340,
      flexShrink: 0,
      borderRight: isMobile ? 'none' : '1px solid #E8E8E8',
      display: 'flex',
      flexDirection: 'column',
      background: 'white'
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #E8E8E8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#24272A' }}>Messages</h2>
          <button style={{ background: '#F8F8F8', border: 'none', padding: 8, borderRadius: '50%', color: '#6A737D' }}><Plus size={20} /></button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9FA6AE' }} />
          <input
            placeholder="Search conversations..."
            style={{ paddingLeft: 44, borderRadius: 100, background: '#F8F8F8', border: '1px solid #E8E8E8', height: 44, fontSize: 14 }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {conversations.map(c => (
          <div key={c.id} onClick={() => selectConv(c)} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            background: selected?.id === c.id ? '#FFF4EB' : 'transparent',
            borderLeft: `4px solid ${selected?.id === c.id ? '#F6851B' : 'transparent'}`,
            transition: 'all 0.2s',
            borderBottom: '1px solid #F8F8F8'
          }} onMouseEnter={(e) => { if (selected?.id !== c.id) e.currentTarget.style.background = '#F8F8F8' }} onMouseLeave={(e) => { if (selected?.id !== c.id) e.currentTarget.style.background = 'transparent' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={c.avatar_url || 'https://via.placeholder.com/150'} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              {c.is_online && <span style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, background: '#28A745', borderRadius: '50%', border: '2px solid white' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#24272A' }}>{c.display_name}</span>
                <span style={{ fontSize: 11, color: '#9FA6AE' }}>12:45 PM</span>
              </div>
              <div style={{ fontSize: 13, color: '#6A737D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Hey, thanks for the support! Check out my latest...
              </div>
            </div>
          </div>
        ))}
        {conversations.length === 0 && !loading && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9FA6AE' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <p style={{ fontSize: 14 }}>No conversations found. Follow creators to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );

  const ChatPanel = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8F8F8' }}>
      {!selected ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9FA6AE' }}>
          <div style={{ width: 80, height: 80, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <MessageSquare size={32} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#24272A' }}>Your Messages</h3>
          <p style={{ fontSize: 14, marginTop: 8 }}>Select a conversation to start chatting.</p>
        </div>
      ) : (
        <>
          <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
            {isMobile && <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: '#F6851B', marginRight: 8 }}><ArrowLeft size={20} /></button>}
            <img src={selected.avatar_url || 'https://via.placeholder.com/150'} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#24272A' }}>{selected.display_name}</div>
              <div style={{ fontSize: 12, color: selected.is_online ? '#28A745' : '#9FA6AE' }}>{selected.is_online ? '● Online' : 'Active 2h ago'}</div>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#9FA6AE' }}><MoreVertical size={20} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: m.from === 'me' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: m.from === 'me' ? '#F6851B' : 'white',
                  color: m.from === 'me' ? 'white' : '#24272A',
                  fontSize: 15,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  {m.text}
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: m.from === 'me' ? 'right' : 'left' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '20px 24px', background: 'white', borderTop: '1px solid #E8E8E8', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                placeholder={isSubscribed ? 'Type a message...' : 'Only subscribers can message'}
                disabled={!isSubscribed}
                style={{ borderRadius: 100, height: 48, background: '#F8F8F8', border: '1px solid #E8E8E8', paddingLeft: 20, fontSize: 15 }}
              />
              {!isSubscribed && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <Lock size={16} color="#9FA6AE" />
                </div>
              )}
            </div>
            <button
              onClick={sendMsg}
              disabled={!isSubscribed || !message.trim()}
              style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none',
                background: isSubscribed && message.trim() ? '#F6851B' : '#E8E8E8',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s'
              }}
            >
              <Send size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'white' }} className="fade-up">
      {(!isMobile || !showChat) && <ConvList />}
      {(!isMobile || showChat) && <ChatPanel />}
    </div>
  );
}

function MessageSquare({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
