import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

class SocketService {
  public socket: Socket | null = null;

  public connect(roomId: string, userId: string) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        // THIS IS THE FORCE WEBSOCKET STRATEGY:
        // It skips HTTP polling and immediately establishes a raw TCP connection.
        transports: ['websocket'],
        upgrade: false, //By writing transports: ['websocket'], upgrade: false, you are telling the frontend: "Do not send letters. Do not ask for an upgrade. Immediately pick up the phone and dial
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log(`🟢 [Socket] Connected directly via WebSocket: ${this.socket?.id}`);
        this.socket?.emit('join-room', roomId, userId);
      });

      this.socket.on('connect_error', (err) => {
        console.error(`🔴 [Socket] Connection Error:`, err.message);
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 [Socket] Disconnected from server');
      });
    }
    return this.socket;
  }

  public disconnect(roomId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId, userId);
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();