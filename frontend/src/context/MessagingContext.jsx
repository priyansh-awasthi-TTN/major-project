import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
  
  const [networkUsers, setNetworkUsers] = useState([]);
  const [chatMap, setChatMap] = useState({}); // { [userId]: [{from, text, time, date}] }
  const [historyLoaded, setHistoryLoaded] = useState({}); // { [userId]: boolean }

  const [readMap, setReadMap] = useState(() => loadLS(LS_READ, {}));
  const [blockedIds, setBlockedIds] = useState(() => loadLS(LS_BLOCKED, []));
  const [metaMap, setMetaMap] = useState(() => loadLS(LS_META, {}));

  const stompClient = useRef(null);

  useEffect(() => { saveLS(LS_READ, readMap); }, [readMap]);
  useEffect(() => { saveLS(LS_BLOCKED, blockedIds); }, [blockedIds]);
  useEffect(() => { saveLS(LS_META, metaMap); }, [metaMap]);

  // Load Network Users
  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch('http://localhost:8081/api/network/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNetworkUsers(data);
        }
      } catch (e) {
        console.error('Failed to fetch network users', e);
      }
    };
    fetchUsers();
  }, [user]);

  // Handle STOMP connection
  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem('accessToken');
    
    // Connect to WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS(`http://localhost:8081/ws?token=${token}`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: () => {}, // Disable debug logs
      onConnect: () => {
        // Subscribe to my queue
        client.subscribe(`/user/queue/messages`, (msg) => {
          const dto = JSON.parse(msg.body);
          // It's from them (senderId is the other user)
          const dateObj = new Date(dto.timestamp);
          const incomingEntry = {
            from: 'them',
            text: dto.content,
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: dateObj
          };
          const otherUserId = dto.senderId;
          
          setChatMap(prev => ({
            ...prev,
            [otherUserId]: [...(prev[otherUserId] || []), incomingEntry]
          }));
          setReadMap(prev => ({ ...prev, [otherUserId]: false }));
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
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8081/api/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const historyData = await res.json();
        const mappedChats = historyData.map(dto => {
          const dateObj = new Date(dto.timestamp);
          return {
            from: dto.senderId === user.id ? 'me' : 'them',
            text: dto.content,
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: dateObj
          };
        });
        setChatMap(prev => ({ ...prev, [userId]: mappedChats }));
        setHistoryLoaded(prev => ({ ...prev, [userId]: true }));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, [user, historyLoaded]);

  const messages = networkUsers.map((u, i) => {
    const userChats = chatMap[u.id] || [];
    const lastChat = userChats[userChats.length - 1];
    
    return {
      id: u.id,
      name: u.fullName,
      role: 'Jobseeker',
      company: 'Platform',
      avatar: u.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
      avatarColor: colors[u.id % colors.length],
      isRead: readMap[u.id] ?? true,
      time: lastChat ? lastChat.time : '',
      preview: lastChat ? lastChat.text : 'Click to start chatting...',
      isPinned:   metaMap[u.id]?.isPinned   ?? false,
      isStarred:  metaMap[u.id]?.isStarred  ?? false,
      isMuted:    metaMap[u.id]?.isMuted    ?? false,
      isArchived: metaMap[u.id]?.isArchived ?? false,
      chat: userChats
    };
  });

  // Since we create conversations for ALL network users, we might want to sort them 
  // or only show users we actually have chats with, but for now we list all.
  const visibleMessages  = messages.filter(m => !blockedIds.includes(m.id));
  const blockedMessages  = messages.filter(m =>  blockedIds.includes(m.id));

  const markRead = useCallback((id) => {
    setReadMap(prev => ({ ...prev, [id]: true }));
  }, []);

  const updateMeta = useCallback((id, patch) => {
    setMetaMap(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), ...patch },
    }));
  }, []);

  const sendMessage = useCallback((recipientId, text) => {
    if (stompClient.current && stompClient.current.active) {
      const payload = { recipientId: recipientId, content: text };
      stompClient.current.publish({ destination: '/app/chat', body: JSON.stringify(payload) });
      
      const outgoingEntry = {
        from: 'me',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date()
      };
      setChatMap(prev => ({ ...prev, [recipientId]: [...(prev[recipientId] || []), outgoingEntry] }));
    } else {
      console.error('STOMP client is not connected');
    }
  }, []);

  const blockUser = useCallback((id) => {
    setBlockedIds(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const unblockUser = useCallback((id) => {
    setBlockedIds(prev => prev.filter(x => x !== id));
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
