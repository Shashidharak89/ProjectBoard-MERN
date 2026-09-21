import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  members = [],
  initialData = null,
  isLoading = false,
}) => {
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      setDeadline(
        initialData.deadline
          ? new Date(initialData.deadline).toISOString().split('T')[0]
          : ''
      );
      setStatus(initialData.status || 'in-progress');
      const assignedIds = (initialData.assignedUsers || []).map((u) => u._id || u.id || u);
      setSelectedUsers(assignedIds);
    } else {
      setDescription('');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      setDeadline(tomorrow.toISOString().split('T')[0]);
      setStatus('in-progress');
      setSelectedUsers([]);
    }
    setError('');
  }, [initialData, isOpen]);

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Task description is required');
      return;
    }
    if (!deadline) {
      setError('Deadline date is required');
      return;
    }

    onSubmit({
      description: description.trim(),
      deadline,
      status,
      assignedUsers: selectedUsers,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create New Task'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Description <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            className={`form-textarea ${error ? 'error' : ''}`}
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Implement JWT Auth middleware"
            required
          />
          {error && <span className="form-error-msg">{error}</span>}
        </div>

        <div className="form-row">
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="in-progress">⏳ In Progress</option>
              <option value="review">🔍 Review</option>
              <option value="completed">✓ Completed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Assign Members (Select Multiple)</label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '180px',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem',
              backgroundColor: 'var(--surface-card)',
            }}
          >
            {members.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                No project members found
              </span>
            ) : (
              members.map((member) => {
                const memberId = member._id || member.id;
                const isSelected = selectedUsers.includes(memberId);
                return (
                  <label
                    key={memberId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--light-accent)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleUserSelection(memberId)}
                    />
                    <Avatar name={member.name} size={28} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {member.email}
                      </span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
