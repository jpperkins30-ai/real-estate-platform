import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: User['role'];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: User['role'];
  status?: User['status'];
}

export interface UserFilters {
  search?: string;
  role?: User['role'];
  status?: User['status'];
  page?: number;
  limit?: number;
}

export interface UserResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export const userService = {
  async getUsers(filters: UserFilters = {}): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/users', { params: filters });
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async updateUserStatus(id: string, status: User['status']): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/status`, { status });
    return response.data;
  },

  async updateUserRole(id: string, role: User['role']): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },
}; 