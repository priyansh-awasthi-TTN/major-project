import { useEffect, useMemo, useRef, useState } from 'react';

function normalizeOption(option) {
  return typeof option === 'string' ? option.trim() : '';
}

export default function SearchableFilterInput({
  value,
  onChange,
  options = [],
  placeholder,
  icon,
  disabled = false,
  noResultsLabel = 'No matches found',
  openOnFocus = false,
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const filteredOptions = useMemo(() => {
    const uniqueOptions = [...new Set(options.map(normalizeOption).filter(Boolean))];
    const query = value.trim().toLowerCase();

    if (!query) {
      return uniqueOptions.slice(0, 50);
    }

    return uniqueOptions
      .filter((option) => option.toLowerCase().startsWith(query))
      .slice(0, 50);
  }, [options, value]);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <div className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
      <span className={`shrink-0 text-sm ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>{icon}</span>
      <input
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue);
          if (!disabled) {
            setOpen(Boolean(nextValue.trim()));
          }
        }}
        onFocus={() => {
          if (!disabled && openOnFocus) {
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
          }

          if (event.key === 'Enter') {
            setOpen(false);
          }
        }}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 disabled:cursor-not-allowed disabled:text-gray-400"
        placeholder={placeholder}
      />
      {!disabled && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
          className="shrink-0 text-xs text-gray-400 hover:text-gray-600"
        >
          ▾
        </button>
      )}
      </div>
      {!disabled && open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option)}
                className={`block w-full px-4 py-2 text-left text-sm transition ${
                  option === value
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">{noResultsLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
