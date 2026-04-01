import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiService from '../services/api';

const MessagingContext = createContext(null);

const LS_READ    = 'jh_readMessages';
const LS_BLOCKED = 'jh_blockedUsers';
const LS_META    = 'jh_messageMeta';

function loadLS(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function saveLS(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function getAttachmentFallbackLabel(messageType) {
  if (messageType === 'IMAGE') return 'Image attachment';
  if (messageType === 'VIDEO') return 'Video attachment';
  return 'File attachment';
}

function getPreviewText(entry) {
  if (!entry) return 'Click to start chatting...';
  if (entry.messageType === 'TEXT') return entry.text || 'Click to start chatting...';
  return entry.text || getAttachmentFallbackLabel(entry.messageType);
}

function createChatEntry(dto, currentUserId) {
  const dateObj = new Date(dto.timestamp || dto.createdAt || new Date());
  const messageType = dto.messageType || 'TEXT';

  return {
    from: dto.senderId === currentUserId ? 'me' : 'them',
    text: dto.content,
    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: dateObj,
    messageType,
    fileUrl: apiService.resolveFileUrl(dto.fileUrl),
  };
}

function getMessageTypeForFile(file) {
  if (file.type.startsWith('image/')) return 'IMAGE';
  if (file.type.startsWith('video/')) return 'VIDEO';
  return 'FILE';
}

const colors = ['bg-orange-400', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];

export function MessagingProvider({ children }) {
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [chatMap, setChatMap] = useState({}); // { [userId]: [{from, text, time, date}] }
  const [historyLoaded, setHistoryLoaded] = useState({}); // { [userId]: boolean }

  const [readMap, setReadMap] = useState(() => loadLS(LS_READ, {}));
  const [blockedIds, setBlockedIds] = useState(() => loadLS(LS_BLOCKED, []));
  const [metaMap, setMetaMap] = useState(() => loadLS(LS_META, {}));

  const stompClient = useRef(null);

  useEffect(() => { saveLS(LS_READ, readMap); }, [readMap]);
  useEffect(() => { saveLS(LS_BLOCKED, blockedIds); }, [blockedIds]);
  useEffect(() => { saveLS(LS_META, metaMap); }, [metaMap]);

  // Load existing conversations on mount
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      try {
        const data = await apiService.getChatConversations();
        setConversations(data);
        
        // Populate chatMap with lastMessages if available
        const initMap = {};
        const initRead = {...readMap};
        data.forEach(conv => {
          if (conv.lastMessage) {
            initMap[conv.userId] = [createChatEntry(conv.lastMessage, user.id)];
            if (conv.unreadCount > 0) initRead[conv.userId] = false;
          }
        });
        // Dont overwrite full chat history if already loaded
        setChatMap(prev => ({ ...initMap, ...prev }));
        setReadMap(prev => ({ ...initRead, ...prev }));
      } catch (e) {
        console.error('Failed to fetch conversations', e);
      }
    };
    fetchConversations();
  }, [user]);

  // Handle STOMP connection
  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem('accessToken');
    
    // Connect to WebSocket using the appropriate fallback logic
    const client = new Client({
      // We use base 8080 API port
      webSocketFactory: () => new SockJS(`http://localhost:8080/ws?token=${token}`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: () => {}, // Disable debug logs so it doesn't spam console
      onConnect: () => {
        // Subscribe to my user-specific STOMP topic
        client.subscribe(`/topic/messages/${user.id}`, (msg) => {
          const dto = JSON.parse(msg.body);
          const isMe = dto.senderId === user.id;
          const otherUserId = isMe ? dto.receiverId : dto.senderId;
          const otherUserName = isMe ? dto.receiverName : dto.senderName;
          const incomingEntry = createChatEntry(dto, user.id);
          
          setChatMap(prev => ({
            ...prev,
            [otherUserId]: [...(prev[otherUserId] || []), incomingEntry]
          }));
          
          if (!isMe) {
            setReadMap(prev => ({ ...prev, [otherUserId]: false }));
            // Add to conversation list if brand new chat!
            setConversations(prev => {
              if (prev.find(c => c.userId === otherUserId)) return prev;
              return [{ userId: otherUserId, userName: otherUserName, userEmail: dto.senderEmail, userType: 'COMPANY' }, ...prev];
            });
          }
        });
      },
      onStompError: (error) => {
        console.error('STOMP Error:', error);
      }
    });
    
    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, [user]);

  const loadHistoryForUser = useCallback(async (userId) => {
    if (historyLoaded[userId]) return;
    try {
      const historyData = await apiService.getChatMessages(userId);
      const mappedChats = historyData.map(dto => createChatEntry(dto, user.id));
      setChatMap(prev => ({ ...prev, [userId]: mappedChats }));
      setHistoryLoaded(prev => ({ ...prev, [userId]: true }));
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, [user, historyLoaded]);

  // Construct message format required by UI
  const messages = conversations.map(c => {
    const userChats = chatMap[c.userId] || [];
    const lastChat = userChats[userChats.length - 1];
    
    return {
      id: c.userId,
      name: c.userName || 'Unknown User',
      role: c.userType === 'COMPANY' ? 'Company' : 'Jobseeker',
      company: 'Platform User',
      avatar: (c.userName || 'AA').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
      avatarColor: colors[c.userId % colors.length],
      isRead: readMap[c.userId] ?? true,
      time: lastChat ? lastChat.time : '',
      preview: getPreviewText(lastChat),
      isPinned:   metaMap[c.userId]?.isPinned   ?? false,
      isStarred:  metaMap[c.userId]?.isStarred  ?? false,
      isMuted:    metaMap[c.userId]?.isMuted    ?? false,
      isArchived: metaMap[c.userId]?.isArchived ?? false,
      chat: userChats
    };
  });

  const visibleMessages  = messages.filter(m => !blockedIds.includes(m.id));
  const blockedMessages  = messages.filter(m =>  blockedIds.includes(m.id));

  // Compute total unread for UI badging across apps!
  const totalUnreadCount = useMemo(() => {
    return visibleMessages.filter(m => !m.isRead).length;
  }, [visibleMessages]);

  const markRead = useCallback((id) => {
    setReadMap(prev => ({ ...prev, [id]: true }));
    apiService.markMessagesAsRead(id).catch(err => console.error("Failed to mark read", err));
  }, []);

  const updateMeta = useCallback((id, patch) => {
    setMetaMap(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), ...patch },
    }));
  }, []);

  const publishMessage = useCallback((recipientId, text, options = {}) => {
    if (stompClient.current && stompClient.current.active && user) {
      const payload = {
        senderId: user.id,
        recipientId,
        content: text,
        messageType: options.messageType || 'TEXT',
        fileUrl: options.fileUrl || null,
      };
      stompClient.current.publish({ destination: '/app/chat.send', body: JSON.stringify(payload) });
    } else {
      throw new Error('STOMP client is not connected');
    }
  }, [user]);

  const sendMessage = useCallback((recipientId, text) => {
    publishMessage(recipientId, text, { messageType: 'TEXT' });
  }, [publishMessage]);

  const sendAttachment = useCallback(async (recipientId, file) => {
    const upload = await apiService.uploadFile(file);
    publishMessage(recipientId, upload.fileName || file.name, {
      messageType: getMessageTypeForFile(file),
      fileUrl: upload.url,
    });
  }, [publishMessage]);

  const blockUser = useCallback((id) => {
    setBlockedIds(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const unblockUser = useCallback((id) => {
    setBlockedIds(prev => prev.filter(x => x !== id));
  }, []);

  // Ability to manually start a chat with someone not in the conversation list yet
  const startNewChat = useCallback((userId, userName, userEmail, userType) => {
    setConversations(prev => {
      if (prev.find(c => c.userId === userId)) return prev;
      return [{ userId, userName, userEmail, userType }, ...prev];
    });
  }, []);

  return (
    <MessagingContext.Provider value={{
      messages: visibleMessages,
      blockedMessages,
      readMap,
      markRead,
      updateMeta,
      sendMessage,
      sendAttachment,
      blockUser,
      unblockUser,
      loadHistoryForUser,
      startNewChat,
      totalUnreadCount, // <-- new
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used within MessagingProvider');
  return ctx;
}
