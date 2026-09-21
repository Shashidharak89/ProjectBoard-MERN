import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Skeleton } from '../common/Skeleton';
import { getUserByIdApi } from '../../services/api/users';
import { FiUser, FiMail, FiCalendar, FiFolder, FiCheckSquare, FiAward } from 'react-icons/fi';

export const UserInspectModal = ({ isOpen, onClose, userId, initialUser = null }) => {
  const [userInfo, setUserInfo] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError(null);
      getUserByIdApi(userId)
        .then((res) => {
          if (res.success) {
            setUserInfo(res.data);
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load user profile details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const stats = userInfo?.stats || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Account Details"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close Inspection
        </Button>
      }
    >
      {loading && !userInfo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="80px" />
          <Skeleton height="160px" />
        </div>
      ) : error ? (
        <div style={{ color: 'var(--danger)', textAlign: 'center', padding: '1.5rem' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main User Card Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '1.25rem',
              backgroundColor: 'var(--pink-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}
          >
            <Avatar name={userInfo?.name || 'User'} size={60} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--rose-deep)' }}>
                {userInfo?.name}
              </div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FiMail style={{ color: 'var(--pink-700)' }} />
                <span>{userInfo?.email}</span>
              </div>
              {userInfo?.createdAt && (
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                  <FiCalendar />
                  <span>Joined {new Date(userInfo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Metrics Grid */}
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              Account Activity Metrics
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiFolder style={{ color: 'var(--rose-deep)' }} /> Projects Owned
                </div>
                <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--rose-deep)', marginTop: '0.3rem' }}>
                  {stats.projectsOwned || 0}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiUser style={{ color: 'var(--pink-700)' }} /> Projects Joined
                </div>
                <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--pink-700)', marginTop: '0.3rem' }}>
                  {stats.projectsJoined || 0}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiCheckSquare /> Tasks Assigned
                </div>
                <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--warning)', marginTop: '0.3rem' }}>
                  {stats.totalAssignedTasks || 0}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiAward /> Tasks Completed
                </div>
                <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--success)', marginTop: '0.3rem' }}>
                  {stats.completedTasks || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
