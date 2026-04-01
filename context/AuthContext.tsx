'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/lib/types';
import { authService } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  register: (data: RegisterData) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rehydrate from localStorage via the service layer (same as GET /auth/me)
    authService.getMe().then((res) => {
      if (res.success && res.data) {
        setUser(res.data);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    setIsLoading(true);
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      setUser(res.data.user as User);
      setIsLoading(false);
      return { success: true, user: res.data.user as User };
    }
    setIsLoading(false);
    return { success: false };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; user?: User }> => {
    setIsLoading(true);
    const res = await authService.register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone,
    });
    if (res.success && res.data) {
      setUser(res.data.user as User);
      setIsLoading(false);
      return { success: true, user: res.data.user as User };
    }
    setIsLoading(false);
    return { success: false };
  };

  /**
   * Calls authService.logout() — which hits POST /auth/logout in production.
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
