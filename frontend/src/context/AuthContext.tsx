import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isOAuthConfigured: boolean;
  githubClientId: string;
  loginWithCode: (code: string) => Promise<User>;
  loginDev: (username?: string) => Promise<User>;
  logout: () => void;
  verifyCollegeEmail: (email: string) => Promise<User>;
  redirectToGitHub: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foss_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [githubClientId, setGithubClientId] = useState<string>('');
  const [isOAuthConfigured, setIsOAuthConfigured] = useState<boolean>(false);

  // Initialize Auth & Config
  useEffect(() => {
    const initAuth = async () => {
      try {
        const config = await api.getAuthConfig();
        setGithubClientId(config.github_client_id);
        setIsOAuthConfigured(config.is_oauth_configured);

        const savedToken = localStorage.getItem('foss_auth_token');
        if (savedToken) {
          const profile = await api.getMe();
          setUser(profile);
        }
      } catch (err) {
        console.warn('[Auth] Session expired or invalid, logging out.');
        localStorage.removeItem('foss_auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginWithCode = async (code: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.loginWithGitHub(code);
      localStorage.setItem('foss_auth_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const loginDev = async (username: string = 'rit-developer'): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.devLogin(username);
      localStorage.setItem('foss_auth_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('foss_auth_token');
    setToken(null);
    setUser(null);
  };

  const verifyCollegeEmail = async (email: string): Promise<User> => {
    const updated = await api.verifyStudent(email);
    setUser(updated);
    return updated;
  };

  const redirectToGitHub = () => {
    if (!githubClientId) {
      console.warn('[Auth] GitHub Client ID not configured.');
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const scope = encodeURIComponent('read:user user:email');
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isOAuthConfigured,
      githubClientId,
      loginWithCode,
      loginDev,
      logout,
      verifyCollegeEmail,
      redirectToGitHub
    }}>
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
