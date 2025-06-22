import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name?: string;
    profilePicture?: string;
  };
  content: string;
  timestamp: string;
}

interface User {
  _id: string;
  name?: string;
  profilePicture?: string;
}

interface Chat {
  _id: string;
  participants: User[];
  messages: Message[];
}

const DirectChat: React.FC = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // console.log('DirectChat mounted, userId:', userId);
  useEffect(() => {
    const fetchOrCreateChat = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch existing chat
        const res = await axios.get('/chat/user/' + userId);
        setChat(res.data);
      } catch (err: any) {
        // If not found, create a new chat
        if (err.response && err.response.status === 404) {
          try {
            const createRes = await axios.post('/chat/user/' + userId);
            setChat(createRes.data);
          } catch (createErr: any) {
            setError(createErr.response?.data?.message || 'Failed to start chat');
          }
        } else {
          setError(err.response?.data?.message || 'Failed to load chat');
        }
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchOrCreateChat();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chat) return;
    setSending(true);
    try {
      const res = await axios.post('/chat/' + chat._id + '/messages', { content: message });
      setChat({ ...chat, messages: [...chat.messages, res.data] });
      setMessage('');
    } catch (err) {
      // Optionally show error
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8">Loading chat...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!chat) return <div className="p-8">No chat found.</div>;

  // Find the other participant
  const otherUser = chat.participants.find((p) => p._id !== user?._id);

  return (
    <div className="flex flex-col h-screen max-h-[80vh] bg-white rounded-xl shadow-lg">
      <div className="p-4 border-b flex items-center space-x-3">
        {otherUser?.profilePicture ? (
          <img src={otherUser.profilePicture} alt={otherUser.name} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold">
            {otherUser?.name?.[0] || '?'}
          </div>
        )}
        <span className="font-semibold">{otherUser?.name || 'User'}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chat.messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs break-words shadow text-sm ${
                msg.sender._id === user?._id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.content}
              <div className="text-xs text-gray-400 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          disabled={sending || !message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default DirectChat; 