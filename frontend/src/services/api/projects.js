import { apiRequest } from './client';

export const getProjectsApi = ({ page = 1, size = 20, search = '' } = {}) => {
  const query = new URLSearchParams({
    page,
    size,
    search: search.trim(),
  }).toString();
  return apiRequest(`/api/projects?${query}`);
};

export const getProjectByIdApi = (projectId) => apiRequest(`/api/projects/${projectId}`);

export const createProjectApi = (data) => apiRequest('/api/projects', { method: 'POST', body: data });

export const updateProjectApi = (projectId, data) => apiRequest(`/api/projects/${projectId}`, { method: 'PATCH', body: data });

export const deleteProjectApi = (projectId) => apiRequest(`/api/projects/${projectId}`, { method: 'DELETE' });

export const addMemberApi = (projectId, userId) => apiRequest(`/api/projects/${projectId}/members`, { method: 'POST', body: { userId } });

export const removeMemberApi = (projectId, userId) => apiRequest(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' });

export const getProjectMembersApi = (projectId, { page = 1, size = 20, search = '' } = {}) => {
  const query = new URLSearchParams({ page, size, search: search.trim() }).toString();
  return apiRequest(`/api/projects/${projectId}/members?${query}`);
};
