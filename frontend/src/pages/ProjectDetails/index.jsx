import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProjectByIdApi,
  updateProjectApi,
  deleteProjectApi,
  addMemberApi,
  removeMemberApi,
} from '../../services/api/projects';
import {
  getProjectTasksApi,
  createTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
  deleteTaskApi,
} from '../../services/api/tasks';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { ProjectModal } from '../../components/projects/ProjectModal';
import { TaskModal } from '../../components/tasks/TaskModal';
import { MemberModal } from '../../components/projects/MemberModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState(null);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [taskPagination, setTaskPagination] = useState({ page: 1, size: 20, total: 0, totalPages: 1 });
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Modals state
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Confirm dialogs
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Action loaders
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const res = await getProjectByIdApi(projectId);
      if (res.success) {
        setProject(res.data);
      }
    } catch (err) {
      setProjectError(err.message || 'Failed to load project');
    } finally {
      setLoadingProject(false);
    }
  }, [projectId]);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoadingTasks(true);
    try {
      const params = {
        page,
        size: 20,
        search: taskSearch,
        status: overdueFilter ? '' : taskStatusFilter,
        overdue: overdueFilter ? 'true' : '',
      };
      const res = await getProjectTasksApi(projectId, params);
      if (res.success) {
        setTasks(res.data);
        setTaskPagination(res.pagination);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, [projectId, taskSearch, taskStatusFilter, overdueFilter, showToast]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    if (project) {
      fetchTasks(1);
    }
  }, [project, fetchTasks]);

  // Project Mutations
  const handleUpdateProject = async (data) => {
    setActionLoading(true);
    try {
      const res = await updateProjectApi(projectId, data);
      if (res.success) {
        setProject(res.data);
        showToast('Project updated successfully', 'success');
        setIsEditProjectOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update project', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    setActionLoading(true);
    try {
      const res = await deleteProjectApi(projectId);
      if (res.success) {
        showToast('Project deleted successfully', 'success');
        navigate('/projects');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setActionLoading(false);
      setIsDeleteProjectOpen(false);
    }
  };

  // Member Mutations
  const handleAddMember = async (targetUserId) => {
    setActionLoading(true);
    try {
      const res = await addMemberApi(projectId, targetUserId);
      if (res.success) {
        showToast('Member added to project', 'success');
        fetchProjectDetails();
        setIsAddMemberOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMemberId) return;
    setActionLoading(true);
    try {
      const res = await removeMemberApi(projectId, removingMemberId);
      if (res.success) {
        showToast('Member removed from project', 'success');
        fetchProjectDetails();
        fetchTasks(taskPagination.page);
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove member', 'error');
    } finally {
      setActionLoading(false);
      setRemovingMemberId(null);
    }
  };

  // Task Mutations
  const handleSaveTask = async (taskData) => {
    setActionLoading(true);
    try {
      if (editingTask) {
        const res = await updateTaskApi(editingTask._id, taskData);
        if (res.success) {
          showToast('Task updated successfully', 'success');
        }
      } else {
        const res = await createTaskApi(projectId, taskData);
        if (res.success) {
          showToast('Task created successfully', 'success');
        }
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      fetchTasks(1);
      fetchProjectDetails();
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await updateTaskStatusApi(taskId, newStatus);
      if (res.success) {
        showToast('Task status updated', 'success');
        fetchTasks(taskPagination.page);
        fetchProjectDetails();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    setActionLoading(true);
    try {
      const res = await deleteTaskApi(deletingTaskId);
      if (res.success) {
        showToast('Task deleted successfully', 'success');
        fetchTasks(taskPagination.page);
        fetchProjectDetails();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setActionLoading(false);
      setDeletingTaskId(null);
    }
  };

  if (loadingProject) {
    return (
      <div>
        <Skeleton height="160px" style={{ marginBottom: '2rem' }} />
        <Skeleton height="300px" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <ErrorState
        title="Project Not Found"
        message={projectError || 'Unable to access project information.'}
        onRetry={() => navigate('/projects')}
      />
    );
  }

  const isOwner = project.isOwner;
  const existingMemberIds = (project.members || []).map((m) => m._id || m);

  return (
    <div>
      {/* Project Banner & Details */}
      <div className="project-details-header">
        <div className="project-details-title-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{project.name}</h1>
              {isOwner && <span className="badge badge-default" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>Owner</span>}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px' }}>
              {project.description || 'No description provided.'}
            </p>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Start Date: {new Date(project.startDate).toLocaleDateString()} • Created by {project.createdBy?.name || 'Owner'}
            </div>
          </div>

          {isOwner && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" size="sm" onClick={() => setIsEditProjectOpen(true)}>
                ✏️ Edit Project
              </Button>
              <Button variant="danger" size="sm" onClick={() => setIsDeleteProjectOpen(true)}>
                🗑️ Delete Project
              </Button>
            </div>
          )}
        </div>

        {/* Progress & Task Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            backgroundColor: 'var(--surface)',
            padding: '1.2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginTop: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL TASKS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{project.totalTasks || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>COMPLETED</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{project.completedTasks || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--warning)', fontWeight: 600 }}>PENDING</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)' }}>{project.pendingTasks || 0}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <ProgressBar progress={project.progress || 0} />
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Project Members ({(project.members || []).length})</h3>
          {isOwner && (
            <Button variant="secondary" size="sm" onClick={() => setIsAddMemberOpen(true)}>
              + Add Member
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(project.members || []).map((member) => {
            const memberId = member._id || member;
            const isProjectOwner = memberId === (project.createdBy?._id || project.createdBy);

            return (
              <div
                key={memberId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.8rem',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Avatar name={member.name || 'User'} size={26} />
                <span>{member.name || 'User'}</span>
                {isProjectOwner && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>(Owner)</span>}
                {isOwner && !isProjectOwner && (
                  <button
                    onClick={() => setRemovingMemberId(memberId)}
                    style={{ color: 'var(--danger)', fontSize: '0.8rem', marginLeft: '0.3rem' }}
                    title="Remove member"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks Management Section */}
      <div>
        <div className="task-filters-bar">
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Tasks</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <SearchInput
              value={taskSearch}
              onChange={(val) => setTaskSearch(val)}
              placeholder="Search tasks..."
            />

            <Button variant="primary" onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}>
              + Create Task
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="task-filter-pills" style={{ marginBottom: '1.25rem' }}>
          <button
            className={`filter-pill ${!taskStatusFilter && !overdueFilter ? 'active' : ''}`}
            onClick={() => { setTaskStatusFilter(''); setOverdueFilter(false); }}
          >
            All Tasks
          </button>
          <button
            className={`filter-pill ${taskStatusFilter === 'in-progress' && !overdueFilter ? 'active' : ''}`}
            onClick={() => { setTaskStatusFilter('in-progress'); setOverdueFilter(false); }}
          >
            ⏳ In Progress
          </button>
          <button
            className={`filter-pill ${taskStatusFilter === 'review' && !overdueFilter ? 'active' : ''}`}
            onClick={() => { setTaskStatusFilter('review'); setOverdueFilter(false); }}
          >
            🔍 Review
          </button>
          <button
            className={`filter-pill ${taskStatusFilter === 'completed' && !overdueFilter ? 'active' : ''}`}
            onClick={() => { setTaskStatusFilter('completed'); setOverdueFilter(false); }}
          >
            ✓ Completed
          </button>
          <button
            className={`filter-pill ${overdueFilter ? 'active' : ''}`}
            style={{ borderColor: overdueFilter ? 'var(--danger)' : undefined }}
            onClick={() => { setOverdueFilter(true); setTaskStatusFilter(''); }}
          >
            ⚠️ Overdue
          </button>
        </div>

        {/* Tasks List */}
        {loadingTasks ? (
          <div className="task-list">
            <Skeleton height="70px" count={4} />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No tasks found"
            description="There are no tasks matching your selected filters."
            actionLabel="+ Create Task"
            onAction={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
          />
        ) : (
          <div className="task-list">
            {tasks.map((task) => {
              const isOverdue = task.isOverdue || (new Date(task.deadline) < new Date() && task.status !== 'completed');
              const assignedUsers = task.assignedUsers || [];

              return (
                <div key={task._id} className={`task-card ${isOverdue ? 'overdue' : ''}`}>
                  <div className="task-main">
                    <div className="task-description">{task.description}</div>
                    <div className="task-meta-row">
                      <StatusBadge status={task.status} isOverdue={isOverdue} />

                      <span>
                        Deadline: <strong>{new Date(task.deadline).toLocaleDateString()}</strong>
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Assigned:</span>
                        <div className="avatar-group">
                          {assignedUsers.length === 0 ? (
                            <span style={{ fontStyle: 'italic' }}>Unassigned</span>
                          ) : (
                            assignedUsers.map((u) => <Avatar key={u._id || u} name={u.name || 'User'} size={24} />)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="task-actions">
                    {/* Status inline selector */}
                    <select
                      className="form-select"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem', width: 'auto' }}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      className="btn-icon"
                      onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                      title="Edit Task"
                    >
                      ✏️
                    </button>

                    <button
                      className="btn-icon"
                      onClick={() => setDeletingTaskId(task._id)}
                      title="Delete Task"
                      style={{ color: 'var(--danger)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination pagination={taskPagination} onPageChange={(page) => fetchTasks(page)} />
      </div>

      {/* Modals & Confirmation Dialogs */}
      <ProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={handleUpdateProject}
        initialData={project}
        isLoading={actionLoading}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSubmit={handleSaveTask}
        members={project.members || []}
        initialData={editingTask}
        isLoading={actionLoading}
      />

      <MemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
        existingMemberIds={existingMemberIds}
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project?"
        message="Deleting this project will permanently remove all associated tasks and members. This action cannot be undone."
        confirmText="Delete Project"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task?"
        message="Are you sure you want to delete this task?"
        confirmText="Delete Task"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!removingMemberId}
        onClose={() => setRemovingMemberId(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member?"
        message="Are you sure you want to remove this member from the project? They will also be unassigned from any project tasks."
        confirmText="Remove Member"
        isLoading={actionLoading}
      />
    </div>
  );
}
