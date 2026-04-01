// ─────────────────────────────────────────────────────────────────────────────
// lib/api/auth.service.ts  — Mock Auth Service
// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION SWAP:
//   Replace the body of each function with `apiFetch(...)` calls to:
//     POST /api/v1/auth/login
//     POST /api/v1/auth/register
//     POST /api/v1/auth/logout
//     GET  /api/v1/auth/me
//     POST /api/v1/auth/refresh
// ─────────────────────────────────────────────────────────────────────────────

import { simulateDelay } from './client';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from './types';
import { mockDoctors, mockPatients, mockAdmin } from '@/lib/mock-data';
import { User } from '@/lib/types';

// In-memory "users" store that persists for the session.
// Real DB equivalent: MongoDB `users` collection.
const registeredUsers: User[] = [];

export const authService = {
  /**
   * POST /auth/login
   * Validates email against mock data (password is ignored in mock mode).
   * Production: bcrypt compare + JWT sign.
   */
  async login(req: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    await simulateDelay(500);

    void req.password; // ignored in mock — any password works

    let foundUser: User | null = null;

    if (req.email === mockAdmin.email) {
      foundUser = mockAdmin;
    } else {
      foundUser =
        mockDoctors.find((d) => d.email === req.email) ??
        mockPatients.find((p) => p.email === req.email) ??
        registeredUsers.find((u) => u.email === req.email) ??
        null;
    }

    if (!foundUser) {
      return {
        success: false,
        data: null as unknown as AuthResponse,
        error: 'Invalid email or password',
      };
    }

    // Persist token in localStorage so apiFetch can attach it
    const fakeToken = btoa(`mock:${foundUser.id}:${Date.now()}`);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hms_token', fakeToken);
      localStorage.setItem('hms_user', JSON.stringify(foundUser));
    }

    return {
      success: true,
      data: {
        user: foundUser as AuthResponse['user'],
        token: fakeToken,
        refreshToken: btoa(`refresh:${foundUser.id}`),
      },
    };
  },

  /**
   * POST /auth/register
   * Creates a new user in the in-memory store.
   * Production: hash password, insert into MongoDB, return JWT.
   */
  async register(req: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    await simulateDelay(600);

    // Simulate duplicate email check
    const allEmails = [
      mockAdmin.email,
      ...mockDoctors.map((d) => d.email),
      ...mockPatients.map((p) => p.email),
      ...registeredUsers.map((u) => u.email),
    ];

    if (allEmails.includes(req.email)) {
      return {
        success: false,
        data: null as unknown as AuthResponse,
        error: 'Email already registered',
      };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: req.email,
      name: req.name,
      role: req.role,
      phone: req.phone,
      createdAt: new Date().toISOString().split('T')[0],
    };

    registeredUsers.push(newUser);

    const fakeToken = btoa(`mock:${newUser.id}:${Date.now()}`);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hms_token', fakeToken);
      localStorage.setItem('hms_user', JSON.stringify(newUser));
    }

    return {
      success: true,
      data: {
        user: newUser as AuthResponse['user'],
        token: fakeToken,
        refreshToken: btoa(`refresh:${newUser.id}`),
      },
    };
  },

  /**
   * POST /auth/logout
   * Production: invalidate refresh token server-side.
   */
  async logout(): Promise<ApiResponse<null>> {
    await simulateDelay(200);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
    }

    return { success: true, data: null };
  },

  /**
   * GET /auth/me
   * Returns the currently authenticated user.
   * Production: decode JWT / session.
   */
  async getMe(): Promise<ApiResponse<User>> {
    await simulateDelay(200);

    if (typeof window === 'undefined') {
      return { success: false, data: null as unknown as User, error: 'Not authenticated' };
    }

    const stored = localStorage.getItem('hms_user');
    if (!stored) {
      return { success: false, data: null as unknown as User, error: 'Not authenticated' };
    }

    return { success: true, data: JSON.parse(stored) as User };
  },

  /**
   * POST /auth/refresh
   */
  async refresh(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    await simulateDelay(300);
    // basic mock refresh decoding
    if (!refreshToken.startsWith('refresh:')) {
      return { success: false, data: null as unknown as AuthResponse, error: 'Invalid refresh token' };
    }
    
    // Just return the same user we have in local storage if present
    const stored = typeof window !== 'undefined' ? localStorage.getItem('hms_user') : null;
    if (!stored) {
      return { success: false, data: null as unknown as AuthResponse, error: 'User not found' };
    }
    const user = JSON.parse(stored) as User;
    const fakeToken = btoa(`mock:${user.id}:${Date.now()}`);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hms_token', fakeToken);
    }
    return {
      success: true,
      data: {
        user: user as AuthResponse['user'],
        token: fakeToken,
        refreshToken: refreshToken,
      },
    };
  },
};
