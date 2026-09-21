import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { searchUsersApi } from '../../services/api/users';

export const MemberModal = ({
  isOpen,
  onClose,
  onAddMember,
  existingMemberIds = [],
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError('');
    try {
      const res = await searchUsersApi(query.trim());
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Project Member">
      <div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input
            type="text"
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or email..."
            required
          />
          <Button type="submit" variant="primary" isLoading={searching}>
            Search
          </Button>
        </form>

        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '250px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
              {query && !searching ? 'No matching users found' : 'Type a name or email to search users'}
            </p>
          ) : (
            results.map((user) => {
              const userId = user.id || user._id;
              const isAlreadyMember = existingMemberIds.includes(userId);

              return (
                <div
                  key={userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'var(--surface-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Avatar name={user.name} size={32} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user.name}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{user.email}</span>
                    </div>
                  </div>

                  {isAlreadyMember ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Already Member
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={isLoading}
                      onClick={() => onAddMember(userId)}
                    >
                      + Add
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
