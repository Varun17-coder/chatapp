import React, { useState, useRef, useEffect } from 'react';
import type { User, Room, ChatMessage } from '../types';

interface ChatRoomProps {
  user: User | null;
  room: Room | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onLeaveRoom: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  user,
  room,
  messages,
  onSendMessage,
  onLeaveRoom
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      setIsTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'sender' ? 'Sender' : 'Receiver';
  };

  const getMessageBubbleStyle = (message: ChatMessage) => {
    const isOwn = message.from === user?.role;

    if (isOwn) {
      return {
        container: 'justify-end',
        bubble: 'bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-md',
        time: 'text-blue-200'
      };
    } else {
      return {
        container: 'justify-start',
        bubble: 'bg-gray-200 text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-md',
        time: 'text-gray-500'
      };
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Chat Room
                </h1>
                <p className="text-sm text-gray-500">
                  Room ID: {room?.id} • You are: {user ? getRoleDisplayName(user.role) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onLeaveRoom}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Start the conversation</h3>
              <p className="text-gray-500">Send your first message to get started!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const style = getMessageBubbleStyle(message);
            return (
              <div key={message.id} className={`flex ${style.container} mb-4`}>
                <div className="max-w-xs lg:max-w-md">
                  <div className={`px-4 py-3 ${style.bubble} shadow-md`}>
                    <p className="text-sm font-medium whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  </div>
                  <div className={`text-xs ${style.time} mt-1 px-2`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gray-200 text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-md px-4 py-3 shadow-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 px-2">
                Other user is typing...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              maxLength={500}
            />
            <div className="absolute right-3 top-3 text-xs text-gray-400">
              {inputMessage.length}/500
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;