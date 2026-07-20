import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAdminAuth, setAdminAuth, clearAdminAuth } from '../utils/storage';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAdminAuth();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const token = await authService.login(email, password);
      if (token) {
        setAdminAuth(token);
        setIsAuthenticated(true);
        toast.success('Login Successful');
        return true;
      }
      return false;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error(msg);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearAdminAuth();
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
