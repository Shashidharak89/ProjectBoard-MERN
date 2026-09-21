import { apiRequest } from './client';

export const getUsersApi = ({ page = 1, size = 20, search = '' } = {}) => {
  const params = new URLSearchParams({ page, size, search: search.trim() });
  return apiRequest(`/api/users?${params.toString()}`);
};

export const searchUsersApi = (search) => {
  return getUsersApi({ page: 1, size: 20, search });
};

export const getUserByIdApi = (userId) => {
  return apiRequest(`/api/users/${userId}`);
};
