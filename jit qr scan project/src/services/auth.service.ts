import { apiClient } from './api';

export const authService = {
  async login(email: string, password: string): Promise<string> {
    const response = await apiClient.post<{ token?: string; accessToken?: string }>('/admin/login', {
      email,
      password,
    });
    // Support either token or accessToken key in the response payload
    const token = response.data.token || response.data.accessToken || '';
    if (!token) {
      throw new Error('Authentication token not found in the response.');
    }
    return token;
  },
};
