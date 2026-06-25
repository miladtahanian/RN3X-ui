import { getApiClient, setSessionCookie } from './client';
import { storage } from '../utils/storage';

export const authApi = {
  async login(username, password) {
    const api = getApiClient();
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    let csrfToken = null;
    try {
      const csrfResponse = await api.get('/csrf-token');
      if (csrfResponse.data?.obj) {
        csrfToken = csrfResponse.data.obj;
        formData.append('_csrf', csrfToken);
      }
    } catch (e) {
      // CSRF token fetch failed; attempt login without it
    }

    const response = await api.post('/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
    });

    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
      setSessionCookie(cookie);
      await storage.saveSession(cookie);
    }

    return response.data;
  },

  async logout() {
    const api = getApiClient();
    const response = await api.post('/logout');
    await storage.clearAll();
    return response.data;
  },

  async getCsrfToken() {
    const api = getApiClient();
    const response = await api.get('/csrf-token');
    return response.data;
  },

  async getTwoFactorStatus() {
    const api = getApiClient();
    const response = await api.get('/getTwoFactorEnable');
    return response.data;
  },
};
