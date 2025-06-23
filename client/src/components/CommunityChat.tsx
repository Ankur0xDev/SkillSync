import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useTheme } from '../Contexts/ThemeContext';
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
  const { theme } = useTheme();
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
          className={`${theme === 'dark' ? 'bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors' : 'bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors'}`}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Community Chat</h2>
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
                      ? `${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}`
                      : `${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'}`
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
                      <div className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-green-500' : 'bg-purple-500'} flex items-center justify-center text-white text-xs`}>
                        {message.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{message.user.name}</span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{message.content}</p>
                  <span className={`text-xs opacity-75 mt-1 block ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className={`flex-1 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} bg-white ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} text-gray-900 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              <button
                type="submit"
                className={`${theme === 'dark' ? 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'}`}
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