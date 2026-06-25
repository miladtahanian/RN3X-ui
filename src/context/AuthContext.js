import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createApiClient, setSessionCookie, setOnUnauthorized } from '../api/client';
import { authApi } from '../api/auth';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setOnUnauthorized(() => {
      setIsAuthenticated(false);
      setUsername('');
    });
    initApp();
  }, []);

  const loadAccounts = useCallback(async () => {
    const accs = await storage.getAccounts();
    setAccounts(accs);
  }, []);

  const initApp = async () => {
    try {
      await loadAccounts();
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

  const saveAccountCredentials = useCallback(async (url, user, password, name) => {
    const existing = accounts.find((a) => a.url === url && a.username === user);
    const account = {
      id: existing?.id || Date.now().toString(),
      name: name || user + '@' + url.replace(/^https?:\/\//, '').replace(/\/+$/, ''),
      url,
      username: user,
      password,
      lastUsed: new Date().toISOString(),
    };
    await storage.saveAccount(account);
    await loadAccounts();
    return account;
  }, [accounts, loadAccounts]);

  const removeAccount = useCallback(async (id) => {
    await storage.deleteAccount(id);
    await loadAccounts();
  }, [loadAccounts]);

  const login = useCallback(async (url, user, password, saveAccount = true) => {
    await storage.clearSession();
    await createApiClient(url);
    await authApi.login(user, password);
    await storage.saveServerUrl(url);
    await storage.saveUsername(user);
    setServerUrl(url);
    setUsername(user);
    setIsAuthenticated(true);
    if (saveAccount) {
      await saveAccountCredentials(url, user, password);
    }
  }, [saveAccountCredentials]);

  const loginWithAccount = useCallback(async (account) => {
    await login(account.url, account.username, account.password, false);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.log('Logout error:', e);
    }
    await storage.clearSession();
    setIsAuthenticated(false);
    setUsername('');
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, isLoading, serverUrl, username,
      accounts, loadAccounts,
      login, loginWithAccount, removeAccount, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
