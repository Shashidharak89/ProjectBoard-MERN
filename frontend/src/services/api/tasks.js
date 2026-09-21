import { apiRequest } from './client';

export const getProjectTasksApi = (projectId, { page = 1, size = 20, search = '', status = '', assignedUser = '', overdue = '' } = {}) => {
  const params = { page, size, search: search.trim() };
  if (status) params.status = status;
  if (assignedUser) params.assignedUser = assignedUser;
  if (overdue) params.overdue = overdue;

  const query = new URLSearchParams(params).toString();
  return apiRequest(`/api/projects/${projectId}/tasks?${query}`);
};

export const getTaskByIdApi = (taskId) => apiRequest(`/api/tasks/${taskId}`);

export const createTaskApi = (projectId, data) => apiRequest(`/api/projects/${projectId}/tasks`, { method: 'POST', body: data });

export const updateTaskApi = (taskId, data) => apiRequest(`/api/tasks/${taskId}`, { method: 'PATCH', body: data });

export const updateTaskStatusApi = (taskId, status) => apiRequest(`/api/tasks/${taskId}/status`, { method: 'PATCH', body: { status } });

export const deleteTaskApi = (taskId) => apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
