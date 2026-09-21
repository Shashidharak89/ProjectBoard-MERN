import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjectsApi } from '../../services/api/projects';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Avatar } from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProjectsApi({ page: 1, size: 50 });
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute overall stats across all user projects
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.progress < 100).length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.totalTasks || 0), 0);
  const completedTasks = projects.reduce((acc, p) => acc + (p.completedTasks || 0), 0);
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.name}! 👋</h1>
        <p className="dashboard-subtitle">
          Here is an overview of your projects, tasks, and progress.
        </p>
      </div>

      {loading ? (
        <div>
          <div className="stats-grid">
            <Skeleton height="90px" count={4} />
          </div>
          <Skeleton height="240px" style={{ marginTop: '1.5rem' }} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDashboardData} />
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--light-accent)' }}>
                📁
              </div>
              <div>
                <div className="stat-val">{totalProjects}</div>
                <div className="stat-label">Total Projects</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                ⚡
              </div>
              <div>
                <div className="stat-val">{activeProjects}</div>
                <div className="stat-label">Active Projects</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                📋
              </div>
              <div>
                <div className="stat-val">{totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                ✓
              </div>
              <div>
                <div className="stat-val">{completedTasks}</div>
                <div className="stat-label">Tasks Completed</div>
              </div>
            </div>
          </div>

          {/* Projects Progress Overview */}
          <div className="dashboard-sections-grid">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Recent Projects & Progress
                </h3>
                <Link to="/projects" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
                  View All →
                </Link>
              </div>

              {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                  <p style={{ marginBottom: '1rem' }}>No projects created yet.</p>
                  <Link to="/projects" className="btn btn-primary btn-sm">
                    + Create First Project
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project._id}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <Link
                            to={`/projects/${project._id}`}
                            style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}
                          >
                            {project.name}
                          </Link>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {project.completedTasks || 0} / {project.totalTasks || 0} tasks completed
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {project.createdBy?.name ? `Owner: ${project.createdBy.name}` : ''}
                        </span>
                      </div>
                      <ProgressBar progress={project.progress || 0} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions & Overview */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  Quick Project Overview
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pending Tasks</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--warning)' }}>{pendingTasks}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overall Completion</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)' }}>
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <Link to="/projects" className="btn btn-primary" style={{ width: '100%' }}>
                  🚀 Go to Projects Workspace
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
