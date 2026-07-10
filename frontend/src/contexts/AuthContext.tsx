import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Fetch fresh user profile details
          const response = await api.get('/auth/me');
          if (response.data?.success) {
            setUser(response.data.data);
          } else {
            // Token is invalid/expired
            logout();
          }
        } catch (error) {
          console.error('Error fetching user context:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.success) {
        const { user: loggedInUser, accessToken } = response.data.data;
        setUser(loggedInUser);
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      if (response.data?.success) {
        const { user: registeredUser, accessToken } = response.data.data;
        setUser(registeredUser);
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        registerUser,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
