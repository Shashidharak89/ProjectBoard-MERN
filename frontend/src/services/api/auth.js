import { apiRequest } from './client';

export const registerApi = (data) => apiRequest('/api/auth/register', { method: 'POST', body: data });
export const loginApi = (data) => apiRequest('/api/auth/login', { method: 'POST', body: data });
export const getMeApi = () => apiRequest('/api/users/me');
export const updateMeApi = (data) => apiRequest('/api/users/me', { method: 'PATCH', body: data });
