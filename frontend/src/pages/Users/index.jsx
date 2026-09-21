import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { UserInspectModal } from '../../components/users/UserInspectModal';
import { getUsersApi } from '../../services/api/users';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiEye, FiMail, FiCalendar } from 'react-icons/fi';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inspect Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const fetchUsers = useCallback((page = 1, searchQuery = search) => {
    setLoading(true);
    setError(null);
    getUsersApi({ page, size: 20, search: searchQuery })
      .then((res) => {
        if (res.success) {
          setUsers(res.data);
          setPagination(res.pagination);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load user directory');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search]);

  useEffect(() => {
    fetchUsers(1, search);
  }, [search, fetchUsers]);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage, search);
  };

  const handleInspectUser = (userToInspect) => {
    setSelectedUser(userToInspect);
    setInspectModalOpen(true);
  };

  return (
    <div className="animate-page-entrance">
      <PageHeader
        title="Users"
        subtitle="Browse registered members on ProjectBoard and inspect account details."
        action={
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
          />
        }
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <Skeleton height="140px" count={6} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchUsers(pagination.page, search)} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<FiUsers />}
          title={search ? 'No users match your search' : 'No users found'}
          description={
            search
              ? `No users found matching "${search}". Try clearing your search keyword.`
              : 'There are no registered users found.'
          }
          actionLabel={search ? 'Clear Search' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {users.map((u) => {
              const isSelf = u.id === currentUser?.id || u._id === currentUser?.id;

              return (
                <div key={u.id || u._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <Avatar name={u.name} size={44} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 750, fontSize: 'var(--font-base)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.name}
                        </span>
                        {isSelf && (
                          <span className="badge badge-owner" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                            You
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <FiMail style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                      </span>
                      {u.createdAt && (
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                          <FiCalendar style={{ flexShrink: 0 }} />
                          <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInspectUser(u)}
                      style={{ gap: '0.4rem', width: '100%', justifyContent: 'center' }}
                    >
                      <FiEye />
                      <span>Inspect Account</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}

      {/* Account Inspect Modal */}
      <UserInspectModal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        userId={selectedUser?.id || selectedUser?._id}
        initialUser={selectedUser}
      />
    </div>
  );
}
