import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createApiClient, setSessionCookie, getApiClient } from '../api/client';
import { authApi } from '../api/auth';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const savedUrl = await storage.getServerUrl();
      const savedUsername = await storage.getUsername();

      if (savedUrl) {
        setServerUrl(savedUrl);
        await createApiClient(savedUrl);

        const session = await storage.getSession();
        if (session) {
          setSessionCookie(session);
          setIsAuthenticated(true);
          setUsername(savedUsername || '');
        }
      }
    } catch (e) {
      console.log('Init error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (url, user, password) => {
    await storage.clearAll();
    await createApiClient(url);
    await authApi.login(user, password);
    await storage.saveServerUrl(url);
    await storage.saveUsername(user);
    setServerUrl(url);
    setUsername(user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.log('Logout error:', e);
    }
    await storage.clearAll();
    setIsAuthenticated(false);
    setUsername('');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, serverUrl, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
