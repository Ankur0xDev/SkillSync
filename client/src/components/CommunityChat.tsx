import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { MessageSquare } from 'lucide-react';
// import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';

interface Message {
  id: string;
  content: string;
  user: {
    id?: string;
    _id?: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
}

// interface User {
//   _id: string;
//   name: string;
//   profilePicture?: string;
// }

export const CommunityChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const chatContainerRef = useRef<HTMLDivElement>(null);
  const { socket, messages, sendMessage } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('message', (message: Message) => {
        messages.push(message);
      });

      socket.emit('getMessages');

      socket.on('messages', (messages: Message[]) => {
        messages.push(...messages);
      });
    }

    return () => {
      if (socket) {
        socket.off('message');
        socket.off('messages');
      }
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // const isCurrentUser = (messageUserId: string) => {
  //   return user && '_id' in user && user._id === messageUserId;
  // };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={toggleChat}
          className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Community Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user._id === user?._id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.user._id === user?._id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.user.avatar ? (
                      <img
                        src={message.user.avatar}
                        alt={message.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">
                        {message.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{message.user.name}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 