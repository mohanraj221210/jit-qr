import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAdminAuth, setAdminAuth, clearAdminAuth } from '../utils/storage';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@jit.ac.in';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_TOKEN = 'jit-admin-token-2026';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAdminAuth();
    if (token === ADMIN_TOKEN) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAdminAuth(ADMIN_TOKEN);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    clearAdminAuth();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
