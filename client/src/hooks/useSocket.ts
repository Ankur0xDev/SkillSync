import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const sentMessages = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('https://skillsync-hq3x.onrender.com', {
      auth: {
        token: localStorage.getItem('skillsync_token')
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to chat server');
    });

    newSocket.on('message', (message) => {
      // Only add message if we haven't seen it before
      if (!sentMessages.current.has(message.id)) {
        setMessages(prev => [...prev, message]);
        // Add to sent messages set
        sentMessages.current.add(message.id);
        // Remove from set after 5 seconds
        setTimeout(() => {
          sentMessages.current.delete(message.id);
        }, 5000);
      }
    });

    newSocket.on('previousMessages', (previousMessages) => {
      setMessages(previousMessages);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.close();
      }
    };
  }, []);

  const sendMessage = (content: string, room: string = 'global') => {
    if (!socket) return;
    
    // Generate a unique ID for this message
    const messageId = `${Date.now()}-${Math.random()}`;
    
    // Add to sent messages set
    sentMessages.current.add(messageId);
    
    // Send message with ID
    socket.emit('message', { content, room, messageId });
    
    // Remove from set after 5 seconds
    setTimeout(() => {
      sentMessages.current.delete(messageId);
    }, 5000);
  };

  return { socket, messages, sendMessage };
}; 