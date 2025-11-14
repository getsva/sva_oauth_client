import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, tokenService, APIError } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_email_verified: boolean;
  auth_provider: string;
  date_joined: string;
  last_login: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password2: string;
  }) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updateProfile: (data: { first_name?: string; last_name?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = tokenService.getUser();
      const token = tokenService.getAccessToken();

      if (savedUser && token) {
        try {
          // Verify token by fetching profile
          const profile = await api.getProfile();
          setUser(profile);
          tokenService.setUser(profile);
        } catch (error) {
          // Token invalid, clear storage
          tokenService.clearTokens();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      tokenService.setTokens(response.tokens.access, response.tokens.refresh);
      tokenService.setUser(response.user);
      setUser(response.user);
      toast.success(response.message || 'Login successful');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof APIError) {
        const errorMessage = error.data?.non_field_errors?.[0] || 
                            error.data?.email?.[0] || 
                            error.data?.password?.[0] || 
                            'Login failed. Please check your credentials.';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password2: string;
  }) => {
    try {
      const response = await api.register({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        password2: data.password2,
      });
      toast.success(response.message || 'Registration successful');
      navigate('/login', { state: { message: 'Please check your email to verify your account.' } });
    } catch (error) {
      if (error instanceof APIError) {
        const errorMessage = error.data?.email?.[0] || 
                            error.data?.password?.[0] || 
                            error.data?.non_field_errors?.[0] || 
                            'Registration failed. Please check your information.';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  const logout = () => {
    tokenService.clearTokens();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.verifyEmail(token);
      tokenService.setTokens(response.tokens.access, response.tokens.refresh);
      tokenService.setUser(response.user);
      setUser(response.user);
      toast.success(response.message || 'Email verified successfully');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.data?.token?.[0] || 'Verification failed. Token may be invalid or expired.');
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const response = await api.resendVerification(email);
      toast.success(response.message || 'Verification email sent');
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.data?.email?.[0] || 'Failed to send verification email');
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  const updateProfile = async (data: { first_name?: string; last_name?: string }) => {
    try {
      const response = await api.updateProfile(data);
      setUser(response.user);
      tokenService.setUser(response.user);
      toast.success(response.message || 'Profile updated successfully');
    } catch (error) {
      if (error instanceof APIError) {
        toast.error('Failed to update profile');
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
      tokenService.setUser(profile);
    } catch (error) {
      // If refresh fails, user might be logged out
      tokenService.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

