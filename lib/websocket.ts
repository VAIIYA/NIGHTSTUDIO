// WebSocket functionality - stub implementation for Vercel serverless
// Real WebSocket functionality would require a separate WebSocket service

const connections = new Map<string, any>();
const rooms = new Map<string, Set<any>>();

// Stub functions that don't do anything in serverless environment
export function handleWebSocket(ws: any, request: any) {
    // Stub - no WebSocket support in Vercel serverless
    console.log('WebSocket connection attempted - not supported in serverless');
}

export function broadcastToUser(userId: string, message: any) {
    // Stub - no WebSocket support in serverless
    console.log('Broadcast to user:', userId, message);
}

export function broadcastToRoom(roomId: string, message: any) {
    // Stub - no WebSocket support in serverless
    console.log('Broadcast to room:', roomId, message);
}
