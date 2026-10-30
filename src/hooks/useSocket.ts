import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(showtimeId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to current host
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (showtimeId) {
        socket.emit('join-showtime', showtimeId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (showtimeId) {
        socket.emit('leave-showtime', showtimeId);
      }
      socket.disconnect();
    };
  }, [showtimeId]);

  return {
    socket: socketRef.current,
    isConnected
  };
}
