import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('adminToken');
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data.user;
  },
}; 