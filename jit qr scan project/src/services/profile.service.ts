import { apiClient } from './api';

export interface AdminProfileResponse {
  name: string;
  email: string;
  phone: string;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string;
  status?: string;
  updatedAt?: string;
}

export const profileService = {
  async getProfile(): Promise<AdminProfileResponse> {
    const response = await apiClient.get<AdminProfileResponse>('/admin/get/profile');
    return response.data;
  },

  async updateProfile(data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
  }): Promise<AdminProfileResponse> {
    const response = await apiClient.put<AdminProfileResponse>('/admin/update/profile', data);
    return response.data;
  },

  async deleteProfile(): Promise<void> {
    await apiClient.delete('/admin/delete/profile');
  },
};
