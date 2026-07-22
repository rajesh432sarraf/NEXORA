import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, User, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('nexora_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  const { success, error: showError } = useToast();

  // Load profile if token exists on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nexora_token');
      if (token) {
        try {
          const user = await authService.getMe();
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          console.error('Failed to load user session', err);
          localStorage.removeItem('nexora_token');
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const authTokens = await authService.login(credentials);
        localStorage.setItem('nexora_token', authTokens.access_token);

        const user = await authService.getMe();

        setState({
          user,
          token: authTokens.access_token,
          isAuthenticated: true,
          isLoading: false,
        });

        success('Welcome back', `Logged in as ${user.full_name}`);
      } catch (err: any) {
        setState((prev) => ({ ...prev, isLoading: false }));
        const message = err.response?.data?.detail || 'Invalid email or password';
        showError('Login Failed', message);
        throw err;
      }
    },
    [success, showError]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        await authService.register(data);
        
        // Auto login after registration
        await login({ username: data.email, password: data.password });
        success('Account Created', 'Registration successful!');
      } catch (err: any) {
        setState((prev) => ({ ...prev, isLoading: false }));
        const message = err.response?.data?.detail || 'Could not complete registration';
        showError('Registration Failed', message);
        throw err;
      }
    },
    [login, success, showError]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('nexora_token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    success('Logged out', 'You have been safely signed out.');
  }, [success]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
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
