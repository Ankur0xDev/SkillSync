import React, { useState } from 'react';
import { ChatList } from '../components/ChatList';
import { Chat } from '../components/Chat';

export const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<{
    chatId: string;
    otherUser: {
      _id: string;
      name: string;
      profilePicture?: string;
    };
  } | null>(null);
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 h-[600px]">
            {/* Chat list */}
            <div className="col-span-4 border-r">
              <ChatList
                onSelectChat={(chatId, otherUser) =>
                  setSelectedChat({ chatId, otherUser })
                }
              />
            </div>

            {/* Chat area */}
            <div className="col-span-8">
              {selectedChat ? (
                <Chat
                  chatId={selectedChat.chatId}
                  otherUser={selectedChat.otherUser}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 