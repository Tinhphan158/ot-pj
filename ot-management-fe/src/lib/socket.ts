import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';

// The REST base looks like `http://host:5000/api`; the socket lives on the
// same origin without the `/api` suffix (`http://host:5000`).
const SOCKET_URL = env.backendApiUrl.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

/** Lazily-created shared socket connection. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}
