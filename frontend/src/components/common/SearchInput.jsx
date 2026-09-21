import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export const SearchInput = ({
  value: externalValue = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}) => {
  const [searchTerm, setSearchTerm] = useState(externalValue);

  useEffect(() => {
    setSearchTerm(externalValue);
  }, [externalValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== externalValue) {
        onChange(searchTerm);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [searchTerm, debounceMs, onChange, externalValue]);

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '360px' }}>
      <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
        <FiSearch />
      </span>
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: '34px', paddingRight: searchTerm ? '32px' : '12px' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          style={{ position: 'absolute', right: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
          title="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};
