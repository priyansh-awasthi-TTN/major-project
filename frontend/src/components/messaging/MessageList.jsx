import DropdownMenu from '../DropdownMenu';

export default function MessageList({
  messages,
  selected,
  onSelect,
  openMenu,
  setOpenMenu,
  menuItemsFor,
  showArchived,
  setShowArchived,
  search,
  setSearch,
}) {
  const inbox    = messages.filter(m => !m.isArchived);
  const archived = messages.filter(m =>  m.isArchived);
  const pool     = showArchived ? archived : inbox;

  const filtered = pool.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
      {/* Search + filters */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 mb-3">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            placeholder="Search messages"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${!showArchived ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Inbox ({inbox.length})
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${showArchived ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Archived ({archived.length})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map(msg => (
          <div
            key={msg.id}
            onClick={() => onSelect(msg)}
            className={`group flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition relative
              ${selected?.id === msg.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}
              ${msg.isMuted ? 'opacity-60' : ''}`}
          >
            {msg.isPinned && (
              <div className="absolute top-2 right-6 text-blue-500">
                <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M9 4v6l-2 4h10l-2-4V4M12 14v6M8 4h8"/></svg>
              </div>
            )}
            {msg.isStarred && (
              <div className="absolute top-2 right-2 text-yellow-400">
                <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
            )}

            <div className={`w-10 h-10 rounded-full ${msg.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {msg.avatar}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className={`text-sm truncate ${!msg.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                  {msg.name}
                  {msg.isMuted && <span className="ml-1 text-gray-400 font-normal">🔇</span>}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <p className="text-xs text-gray-400">{msg.time}</p>
                  <div className="relative">
                    <button
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === msg.id ? null : msg.id); }}
                      className="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                      </svg>
                    </button>
                    {openMenu === msg.id && (
                      <div className="absolute right-0 top-8 z-50">
                        <DropdownMenu items={menuItemsFor(msg)} onClose={() => setOpenMenu(null)} position="right" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className={`text-xs truncate ${!msg.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                {msg.preview}
              </p>
            </div>

            {!msg.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
            )}
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-sm">No messages found</p>
            {showArchived && (
              <button onClick={() => setShowArchived(false)} className="text-xs text-blue-600 hover:underline mt-1">
                Back to inbox
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
