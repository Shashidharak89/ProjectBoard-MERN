import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFolder } from 'react-icons/fi';
import { getProjectsApi, createProjectApi } from '../../services/api/projects';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Avatar } from '../../components/common/Avatar';
import { ProjectModal } from '../../components/projects/ProjectModal';

export default function Projects() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback((page = 1, searchQuery = search) => {
    setLoading(true);
    setError(null);
    getProjectsApi({ page, size: 20, search: searchQuery })
      .then((res) => {
        if (res.success) {
          setProjects(res.data);
          setPagination(res.pagination);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    loadProjects(1, search);
  }, [search, loadProjects]);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
  };

  const handlePageChange = (newPage) => {
    loadProjects(newPage, search);
  };

  const handleCreateProject = async (projectData) => {
    setCreating(true);
    try {
      const res = await createProjectApi(projectData);
      if (res.success) {
        showToast(`Project "${res.data.name}" created successfully!`, 'success');
        setIsCreateModalOpen(false);
        loadProjects(1, search);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-page-entrance">
      <div className="projects-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            Manage and view projects you own or contribute to.
          </p>
        </div>

        <div className="projects-actions">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search projects..."
          />
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} style={{ gap: '0.4rem' }}>
            <FiPlus />
            <span>Create Project</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="projects-grid">
          <Skeleton height="200px" count={6} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadProjects(pagination.page, search)} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FiFolder />}
          title={search ? 'No projects match your search' : 'No projects found'}
          description={
            search
              ? `No projects found matching "${search}". Try clearing your search term.`
              : 'You have not created or joined any projects yet.'
          }
          actionLabel={search ? 'Clear Search' : 'Create First Project'}
          onAction={search ? () => setSearch('') : () => setIsCreateModalOpen(true)}
        />
      ) : (
        <>
          <div className="projects-grid">
            {projects.map((project) => {
              const isOwner = project.createdBy?._id === user?.id || project.createdBy === user?.id;

              return (
                <div key={project._id} className="card card-hover project-card">
                  <div>
                    <div className="project-card-header">
                      <Link
                        to={`/projects/${project._id}`}
                        className="project-title"
                        title={project.name}
                      >
                        {project.name}
                      </Link>
                      {isOwner ? (
                        <span className="badge badge-owner">Owner</span>
                      ) : (
                        <span className="badge badge-member">Member</span>
                      )}
                    </div>

                    <p className="project-desc">
                      {project.description || 'No description provided.'}
                    </p>

                    <div style={{ marginTop: '1rem' }}>
                      <ProgressBar progress={project.progress || 0} />
                    </div>
                  </div>

                  <div>
                    <div className="project-meta">
                      <div className="avatar-group">
                        {(project.members || []).slice(0, 4).map((m) => (
                          <Avatar key={m._id || m} name={m.name || 'Member'} size={28} />
                        ))}
                        {(project.members || []).length > 4 && (
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                            +{(project.members || []).length - 4}
                          </div>
                        )}
                      </div>

                      <div>
                        <strong>{project.completedTasks || 0}</strong> / {project.totalTasks || 0} Tasks
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}

      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={creating}
      />
    </div>
  );
}
