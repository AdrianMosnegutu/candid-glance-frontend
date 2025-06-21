import { Candidate } from '@/types/candidate';
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const wsUrl = 'https://backend-chdf.onrender.com';
    this.socket = io(wsUrl);

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Set up event listeners
    this.socket.on('candidateAdded', (candidate: Candidate) => {
      this.emit('candidateAdded', candidate);
    });

    this.socket.on('candidateUpdated', (candidate: Candidate) => {
      this.emit('candidateUpdated', candidate);
    });

    this.socket.on('candidateDeleted', (data: { id: string }) => {
      this.emit('candidateDeleted', data);
    });

    this.socket.on('fakeDataGenerationComplete', (data: { count: number }) => {
      this.emit('fakeDataGenerationComplete', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  generateFakeData(count: number = 1) {
    if (this.socket?.connected) {
      this.socket.emit('generateFakeData', count);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService(); 