import { useEffect } from 'react';
import { useSocketContext } from '../contexts/SocketContext';

export const useSocket = (ticketId) => {
  const { isConnected, on, emit, joinRoom, leaveRoom } = useSocketContext();

  useEffect(() => {
    if (!ticketId) return;
    joinRoom(ticketId);
    return () => leaveRoom(ticketId);
  }, [ticketId, joinRoom, leaveRoom]);

  return { isConnected, on, emit };
};
