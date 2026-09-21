import React from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { FiCalendar, FiUser, FiClock, FiEdit3, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export const TaskPreviewModal = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onStatusChange,
  isOwner = false,
}) => {
  if (!task) return null;

  const isOverdue = task.isOverdue || (new Date(task.deadline) < new Date() && task.status !== 'completed');
  const assignedUsers = task.assignedUsers || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          {onEdit ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              style={{ gap: '0.4rem' }}
            >
              <FiEdit3 />
              <span>Edit Task</span>
            </Button>
          ) : <div />}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Status and Overdue Badge Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusBadge status={task.status} isOverdue={isOverdue} />
            {isOverdue && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.6rem',
                  backgroundColor: 'var(--overdue-badge-bg)',
                  color: 'var(--overdue-badge-text)',
                  border: '1px solid var(--overdue-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                }}
              >
                <FiAlertTriangle /> Overdue
              </span>
            )}
          </div>

          {/* Quick status updater */}
          {onStatusChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
              <select
                className="form-select"
                style={{ padding: '0.3rem 0.6rem', fontSize: 'var(--font-xs)', width: 'auto' }}
                value={task.status}
                onChange={(e) => onStatusChange(task._id, e.target.value)}
              >
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Task Description */}
        <div
          style={{
            backgroundColor: 'var(--pink-50)',
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
            Task Description
          </div>
          <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-primary)', lineHeight: 1.55, fontWeight: 500, margin: 0, whiteSpace: 'pre-wrap' }}>
            {task.description}
          </p>
        </div>

        {/* Meta Info (Deadline & Creation) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--pink-100)',
                color: 'var(--rose-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
              }}
            >
              <FiCalendar />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>Due Date</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {new Date(task.deadline).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {task.createdAt && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--pink-100)',
                  color: 'var(--rose-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                }}
              >
                <FiClock />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>Created On</div>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Members Details Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              paddingBottom: '0.4rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--rose-deep)' }}>
              <FiUser />
              <span>Assigned Members ({assignedUsers.length})</span>
            </div>
          </div>

          {assignedUsers.length === 0 ? (
            <div
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                backgroundColor: 'var(--pink-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-sm)',
              }}
            >
              No members assigned to this task.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '220px', overflowY: 'auto' }}>
              {assignedUsers.map((member) => {
                const memberName = member.name || 'Assigned User';
                const memberEmail = member.email || 'No email provided';

                return (
                  <div
                    key={member._id || member}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Avatar name={memberName} size={36} />
                      <div>
                        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {memberName}
                        </div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                          {memberEmail}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        backgroundColor: 'var(--pink-100)',
                        color: 'var(--rose-deep)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 700,
                        border: '1px solid var(--pink-300)',
                      }}
                    >
                      Assigned
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
