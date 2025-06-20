import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Chat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    profilePicture?: string;
  }[];
  lastMessage: string;
}

interface ChatListProps {
  onSelectChat: (chatId: string, otherUser: Chat['participants'][0]) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('/api/chat');
        setChats(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error)
        toast.error('Failed to load chats');
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No conversations yet
        </div>
      ) : (
        <div className="divide-y">
          {chats.map((chat) => {
            const otherUser = chat.participants.find(
              (p) => p._id !== user?._id
            );
            if (!otherUser) return null;

            return (
              <button
                key={chat._id}
                onClick={() => onSelectChat(chat._id, otherUser)}
                className="w-full p-4 hover:bg-gray-50 flex items-center space-x-3"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  {otherUser.profilePicture ? (
                    <img
                      src={otherUser.profilePicture}
                      alt={otherUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-purple-600 font-medium text-lg">
                      {otherUser.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900">{otherUser.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(chat.lastMessage).toLocaleDateString()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};  
