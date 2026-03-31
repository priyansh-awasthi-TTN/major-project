import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import ApiService from '../services/api';
import webSocketService from '../services/websocket';
import Chat from './Chat';

export default function ChatIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    if (user) {
      const token = sessionStorage.getItem('accessToken');
      if (token && !webSocketService.isConnected()) {
        webSocketService.connect(token).catch(error => {
          console.error('Failed to connect to WebSocket:', error);
        });
      }
    }

    return () => {
      if (!user) {
        webSocketService.disconnect();
      }
    };
  }, [user]);

  // Load conversations and unread count
  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
      loadUnreadCount();
    }
  }, [user, isOpen]);

  // WebSocket message handler
  useEffect(() => {
    const handleNewMessage = (messageData) => {
      // Update unread count
      loadUnreadCount();
      
      // Update conversations if chat list is open
      if (isOpen) {
        loadConversations();
      }
      
      // Show notification if chat is not currently open with this user
      if (!selectedChat || selectedChat.userId !== messageData.senderId) {
        showToast(`New message from ${messageData.senderName}`, 'info');
      }
    };

    const unsubscribe = webSocketService.subscribe('messages', handleNewMessage);
    return unsubscribe;
  }, [isOpen, selectedChat, showToast]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getChatConversations();
      setConversations(response || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await ApiService.getUnreadMessageCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const openChat = (conversation) => {
    setSelectedChat({
      userId: conversation.userId,
      userName: conversation.userName,
      userEmail: conversation.userEmail
    });
    setIsOpen(false); // Close conversation list
  };

  const closeChat = () => {
    setSelectedChat(null);
    loadUnreadCount(); // Refresh unread count after closing chat
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        title="Messages"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Conversations List */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
              <h3 className="font-medium text-gray-900">Messages</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.userId}
                    onClick={() => openChat(conversation)}
                    className="w-full p-4 hover:bg-gray-50 border-b border-gray-100 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {conversation.userName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {conversation.userName || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-block mt-1 bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Chat */}
      {selectedChat && (
        <Chat
          isOpen={!!selectedChat}
          onClose={closeChat}
          otherUserId={selectedChat.userId}
          otherUserName={selectedChat.userName}
        />
      )}
    </>
  );
}