import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import ApiService from '../services/api';
import webSocketService from '../services/websocket';

export default function Chat({ isOpen, onClose, otherUserId, otherUserName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when chat opens
  useEffect(() => {
    if (isOpen && otherUserId) {
      loadMessages();
      markMessagesAsRead();
    }
  }, [isOpen, otherUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket message handler
  useEffect(() => {
    if (!isOpen) return;

    const handleNewMessage = (messageData) => {
      // Only add message if it's between current user and the chat partner
      if (
        (messageData.senderId === user?.id && messageData.receiverId === otherUserId) ||
        (messageData.senderId === otherUserId && messageData.receiverId === user?.id)
      ) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(msg => msg.id === messageData.id);
          if (exists) return prev;
          return [...prev, messageData];
        });

        // Mark as read if message is from other user
        if (messageData.senderId === otherUserId) {
          setTimeout(() => markMessagesAsRead(), 500);
        }
      }
    };

    const unsubscribe = webSocketService.subscribe('messages', handleNewMessage);
    return unsubscribe;
  }, [isOpen, otherUserId, user?.id]);

  const loadMessages = async () => {
    if (!otherUserId) return;
    
    setLoading(true);
    try {
      const response = await ApiService.getChatMessages(otherUserId);
      setMessages(response || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!otherUserId) return;
    
    try {
      await ApiService.markMessagesAsRead(otherUserId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !otherUserId) return;

    setSending(true);
    try {
      // Send via WebSocket for real-time delivery
      const success = webSocketService.sendMessage(otherUserId, newMessage.trim());
      
      if (success) {
        setNewMessage('');
      } else {
        showToast('Failed to send message. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
      <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {otherUserName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">{otherUserName || 'Unknown User'}</h3>
              <p className="text-xs text-gray-500">
                {webSocketService.isConnected() ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}