"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'like' | 'comment' | 'follow' | 'notification';
  userId?: string;
  roomId?: string;
  data?: any;
}

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = typeof window !== 'undefined' ? `ws://${window.location.hostname}:${window.location.port || '3000'}` : '',
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const { publicKey, connected } = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Subscribe to user-specific updates if wallet is connected
        if (publicKey) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            userId: publicKey.toString(),
          }));
        }

        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();

        // Auto-reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, publicKey, onConnect, onDisconnect, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const send = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Connect when component mounts and wallet is available
  useEffect(() => {
    if (connected && publicKey) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connected, publicKey, connect, disconnect]);

  // Handle wallet disconnection
  useEffect(() => {
    if (!connected) {
      disconnect();
    }
  }, [connected, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    connect,
    disconnect,
  };
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const { isConnected, send } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'notification') {
        setNotifications(prev => [message.data, ...prev]);
      }
    },
  });

  return {
    notifications,
    isConnected,
    clearNotifications: () => setNotifications([]),
  };
}

// Hook for real-time post updates (likes, comments)
export function useRealtimePostUpdates(postId: string) {
  const [postUpdates, setPostUpdates] = useState<any[]>([]);

  const { isConnected } = useWebSocket({
    onMessage: (message) => {
      if (message.data?.postId === postId) {
        setPostUpdates(prev => [message, ...prev]);
      }
    },
  });

  return {
    postUpdates,
    isConnected,
  };
}