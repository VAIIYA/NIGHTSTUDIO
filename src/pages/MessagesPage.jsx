import { useState, useEffect } from 'react';
import { MessageSquare, Search, Send, Image, Hash, Settings, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MOCK_CHATS = [
  { id: 1, name: 'babyxmillie', lastMsg: 'I just posted a new video!', time: '2m', unread: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Millie' },
  { id: 2, name: 'anna.secret', lastMsg: 'Thanks for the tip! ❤️', time: '1h', unread: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' },
];

import { useMediaQuery } from '../hooks/useMediaQuery';
import { ArrowLeft } from 'lucide-react';

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const { isConnected } = useApp();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    document.title = 'Bunny Ranch — Messages';
  }, []);

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    if (isMobile) setShowChat(true);
  };

  if (!isConnected) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <MessageSquare size={32} color="var(--accent)" />
        </div>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', marginBottom: '12px' }}>Messages</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.5, marginBottom: '24px' }}>Connect your wallet to start messaging your favorite creators.</p>
        <button style={{ padding: '12px 32px', borderRadius: '999px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne' }}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: isMobile ? 'calc(100vh - 144px)' : '100vh', margin: '0 -20px', borderRight: isMobile ? 'none' : '1px solid var(--border)' }}>
      {/* Sidebar */}
      {(!isMobile || !showChat) && (
        <div style={{ width: isMobile ? '100%' : '350px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', margin: 0 }}>Messages</h1>
              <Settings size={20} color="var(--text-muted)" />
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search" style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', fontSize: '16px' }} />
            </div>
          </div>

          {MOCK_CHATS.length > 0 ? (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {MOCK_CHATS.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  style={{ display: 'flex', gap: '12px', padding: '16px 24px', cursor: 'pointer', background: activeChat?.id === chat.id ? 'var(--bg-hover)' : 'transparent', transition: 'background 0.2s' }}
                >
                  <img src={chat.avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{chat.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{chat.time}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: chat.unread ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: chat.unread ? 600 : 400, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{chat.lastMsg}</span>
                      {chat.unread > 0 && <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', alignSelf: 'center' }}></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                No messages yet. Subscribe to a creator to send them a message.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chat Area */}
      {(!isMobile || showChat) && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
          {activeChat ? (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isMobile && (
                  <button
                    onClick={() => setShowChat(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <img src={activeChat.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <div style={{ fontWeight: 700 }}>{activeChat.name}</div>
              </div>
              <div style={{ flex: 1, padding: '24px' }}>
                {/* Messages go here */}
              </div>
              <div style={{ padding: '24px', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '8px 16px', alignItems: 'center' }}>
                  <Image size={20} color="var(--text-muted)" />
                  <input type="text" placeholder="Type a message..." style={{ flex: 1, background: 'none', border: 'none', color: 'white', padding: '10px 0', outline: 'none', fontSize: '16px' }} />
                  <button style={{ background: 'var(--accent)', border: 'none', padding: '8px', borderRadius: '10px', color: 'white', cursor: 'pointer' }}><Send size={18} /></button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💭</div>
                <div style={{ fontWeight: 600 }}>Select a chat to start messaging</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
