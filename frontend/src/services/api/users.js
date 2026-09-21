import { apiRequest } from './client';

export const searchUsersApi = (search) => {
  const query = new URLSearchParams({ search: search.trim() }).toString();
  return apiRequest(`/api/users?${query}`);
};
