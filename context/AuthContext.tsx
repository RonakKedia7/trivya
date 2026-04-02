"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "@/lib/types";
import { authService } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
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
    // Rehydrate from sessionStorage via the service layer (GET /auth/me)
    authService.getMe().then((res) => {
      if (res.success && res.data) {
        setUser(res.data as User);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data?.user) {
        const loggedInUser = res.data.user as User;
        setUser(loggedInUser);
        setIsLoading(false);
        return { success: true, user: loggedInUser };
      }
      setIsLoading(false);
      // Surface the exact error message returned by the API
      return {
        success: false,
        error: res.error || res.message || "Invalid email or password",
      };
    } catch (err) {
      console.error("[AuthContext] login error:", err);
      setIsLoading(false);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  const register = async (
    data: RegisterData,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as "doctor" | "patient",
        phone: data.phone,
      });
      if (res.success && res.data?.user) {
        const newUser = res.data.user as User;
        setUser(newUser);
        setIsLoading(false);
        return { success: true, user: newUser };
      }
      setIsLoading(false);
      // Surface the exact error returned by the API (e.g. "Email already registered",
      // password policy failure, etc.)
      return {
        success: false,
        error:
          res.error || res.message || "Registration failed. Please try again.",
      };
    } catch (err) {
      console.error("[AuthContext] register error:", err);
      setIsLoading(false);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
