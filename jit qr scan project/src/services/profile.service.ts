import { apiClient } from './api';

export interface AdminProfile {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string;
  status?: string;
  updatedAt?: string;
}

export interface AdminProfileResponse {
  message?: string;
  admin: AdminProfile;
}

export const profileService = {
  async getProfile(): Promise<AdminProfile> {
    const response = await apiClient.get<AdminProfileResponse>('/admin/get/profile');
    return response.data.admin || (response.data as unknown as AdminProfile);
  },

  async updateProfile(data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
  }): Promise<AdminProfile> {
    const response = await apiClient.put<AdminProfileResponse>('/admin/update/profile', data);
    return response.data.admin || (response.data as unknown as AdminProfile);
  },

  async deleteProfile(): Promise<void> {
    await apiClient.delete('/admin/delete/profile');
  },
};
