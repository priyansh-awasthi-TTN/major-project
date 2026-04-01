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
            const isMe = conv.lastMessage.senderId === user.id;
            const dateObj = new Date(conv.lastMessage.timestamp || conv.lastMessage.createdAt);
            initMap[conv.userId] = [{
              from: isMe ? 'me' : 'them',
              text: conv.lastMessage.content,
              time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: dateObj
            }];
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
          
          const dateObj = new Date(dto.timestamp || dto.createdAt || new Date());
          const incomingEntry = {
            from: isMe ? 'me' : 'them',
            text: dto.content,
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: dateObj
          };
          
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
      const mappedChats = historyData.map(dto => {
        const dateObj = new Date(dto.timestamp || dto.createdAt);
        return {
          from: dto.senderId === user.id ? 'me' : 'them',
          text: dto.content,
          time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: dateObj
        };
      });
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
      preview: lastChat ? lastChat.text : 'Click to start chatting...',
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

  const sendMessage = useCallback((recipientId, text) => {
    if (stompClient.current && stompClient.current.active && user) {
      const payload = { senderId: user.id, recipientId: recipientId, content: text };
      stompClient.current.publish({ destination: '/app/chat.send', body: JSON.stringify(payload) });
      
      // Real-time optimistic update is no longer strictly needed if the server bounces it back to our topic!
      // But we can still do it, or wait for the stomp subscriber. The socket broadcast covers both!
      // Here we wait for server broadcast to avoid double messages.
    } else {
      console.error('STOMP client is not connected');
    }
  }, [user]);

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
