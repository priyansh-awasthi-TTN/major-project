import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { messages as mockMessages } from '../data/mockData';

const MessagingContext = createContext(null);

const LS_READ    = 'jh_readMessages';
const LS_BLOCKED = 'jh_blockedUsers';
const LS_META    = 'jh_messageMeta'; // pinned, starred, muted, archived per id

function loadLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function MessagingProvider({ children }) {
  // { [id]: true }
  const [readMap, setReadMap]     = useState(() => loadLS(LS_READ, {}));
  // [id, id, ...]
  const [blockedIds, setBlockedIds] = useState(() => loadLS(LS_BLOCKED, []));
  // { [id]: { isPinned, isStarred, isMuted, isArchived } }
  const [metaMap, setMetaMap]     = useState(() => loadLS(LS_META, {}));
  // extra chat messages sent by user: { [id]: [{from,text,time}] }
  const [chatMap, setChatMap]     = useState({});

  // Persist to localStorage whenever state changes
  useEffect(() => { saveLS(LS_READ,    readMap);    }, [readMap]);
  useEffect(() => { saveLS(LS_BLOCKED, blockedIds); }, [blockedIds]);
  useEffect(() => { saveLS(LS_META,    metaMap);    }, [metaMap]);

  // Derive full message list by merging mock data with persisted state
  const messages = mockMessages.map(msg => ({
    ...msg,
    isRead:     readMap[msg.id]    ?? !msg.unread,
    isPinned:   metaMap[msg.id]?.isPinned   ?? false,
    isStarred:  metaMap[msg.id]?.isStarred  ?? false,
    isMuted:    metaMap[msg.id]?.isMuted    ?? false,
    isArchived: metaMap[msg.id]?.isArchived ?? false,
    chat: [...msg.chat, ...(chatMap[msg.id] ?? [])],
  }));

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

  const sendMessage = useCallback((id, text) => {
    const entry = {
      from: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMap(prev => ({ ...prev, [id]: [...(prev[id] ?? []), entry] }));
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
