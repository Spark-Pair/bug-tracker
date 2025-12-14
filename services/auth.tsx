import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { api } from './api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const [loading, setLoading] = useState(true);

  // ✅ Rehydrate auth on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');

    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setState({ user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('current_user');
        setState({ user: null, isAuthenticated: false });
      }
    }

    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const user = await api.login(username, password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    localStorage.setItem('current_user', JSON.stringify(user));
    setState({ user, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('current_user');
    setState({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        loading,
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
