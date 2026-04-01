import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from './types';
import { apiFetch, clearAccessToken, setAccessToken } from './client';

export const authService = {
  async login(req: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await apiFetch<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    if (res.success && res.data?.token) setAccessToken(res.data.token);
    return res;
  },

  async register(req: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await apiFetch<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    if (res.success && res.data?.token) setAccessToken(res.data.token);
    return res;
  },

  async logout(): Promise<ApiResponse<null>> {
    clearAccessToken();
    return apiFetch<ApiResponse<null>>('/auth/logout', { method: 'POST' });
  },

  async getMe(userId?: string): Promise<ApiResponse<any>> {
    // `userId` is kept for backward compatibility; server derives identity from JWT.
    return apiFetch<ApiResponse<any>>('/auth/me', { method: 'GET' });
  },

  async refresh(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const res = await apiFetch<ApiResponse<AuthResponse>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    if (res.success && res.data?.token) setAccessToken(res.data.token);
    return res;
  },
};
