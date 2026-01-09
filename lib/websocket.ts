import { NextRequest } from 'next/server';
import WebSocket from 'ws';

// Store active WebSocket connections by user wallet
const connections = new Map<string, WebSocket>();

// Store connections by room/channel
const rooms = new Map<string, Set<WebSocket>>();

// WebSocket message types
interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'like' | 'comment' | 'follow' | 'notification';
  userId?: string;
  roomId?: string;
  data?: any;
}

export async function GET(request: NextRequest) {
  // This is a placeholder - Next.js API routes don't directly support WebSocket upgrades
  // We'll need to use a custom server approach or a WebSocket library
  return new Response('WebSocket endpoint not implemented', { status: 501 });
}

// WebSocket handler function (to be used with custom server)
export function handleWebSocket(ws: WebSocket, request: any) {
  console.log('WebSocket connection established');

  let userId: string | null = null;

  ws.on('message', (message: Buffer) => {
    try {
      const data: WSMessage = JSON.parse(message.toString());

      switch (data.type) {
        case 'subscribe':
          if (data.userId) {
            userId = data.userId;
            connections.set(userId, ws);
            console.log(`User ${userId} connected`);
          }
          if (data.roomId) {
            if (!rooms.has(data.roomId)) {
              rooms.set(data.roomId, new Set());
            }
            rooms.get(data.roomId)!.add(ws);
          }
          break;

        case 'unsubscribe':
          if (userId) {
            connections.delete(userId);
          }
          if (data.roomId && rooms.has(data.roomId)) {
            rooms.get(data.roomId)!.delete(ws);
          }
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (userId) {
      connections.delete(userId);
    }

    // Remove from all rooms
    for (const room of rooms.values()) {
      room.delete(ws);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

// Function to broadcast messages to specific users
export function broadcastToUser(userId: string, message: WSMessage) {
  const connection = connections.get(userId);
  if (connection && connection.readyState === WebSocket.OPEN) {
    connection.send(JSON.stringify(message));
  }
}

// Function to broadcast messages to a room
export function broadcastToRoom(roomId: string, message: WSMessage) {
  const room = rooms.get(roomId);
  if (room) {
    for (const ws of room) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }
}

// Function to broadcast to all connected users
export function broadcastToAll(message: WSMessage) {
  for (const ws of connections.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}