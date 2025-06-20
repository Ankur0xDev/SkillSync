import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../Contexts/AuthContext';
import { Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  timestamp: string;
}

interface ChatProps {
  chatId: string;
  otherUser: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

export const Chat: React.FC<ChatProps> = ({ chatId, otherUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chat/${chatId}`);
        setMessages(response.data.messages);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load messages');
        setLoading(false);
      }
    };

    fetchMessages();

    // Listen for new messages
    socket?.on('newMessage', (message: Message) => {
      if (message.sender._id === otherUser._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket?.off('newMessage');
    };
  }, [chatId, otherUser._id, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`/api/chat/${chatId}/messages`, {
        content: newMessage
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      socket?.emit('sendMessage', {
        chatId,
        message: response.data
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white border-b p-4 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          {otherUser.profilePicture ? (
            <img
              src={otherUser.profilePicture}
              alt={otherUser.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-purple-600 font-medium">
              {otherUser.name[0].toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{otherUser.name}</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.sender._id === user?._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender._id === user?._id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender._id === user?._id
                    ? 'text-purple-200'
                    : 'text-gray-500'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}; 