import { useEffect, useRef } from 'react';

export default function DropdownMenu({ items, onClose, position = 'right' }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref}
      className={`absolute z-50 top-8 ${position === 'left' ? 'left-0' : 'right-0'} bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-44`}>
      {items.map((item, i) =>
        item === 'divider' ? (
          <div key={i} className="my-1 border-t border-gray-100" />
        ) : (
          <button key={i} onClick={() => { item.action(); onClose(); }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700'}`}>
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
