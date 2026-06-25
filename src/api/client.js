import axios from 'axios';
import { storage } from '../utils/storage';

let apiClient = null;
let baseURL = '';
let onUnauthorized = null;

export const setOnUnauthorized = (callback) => {
  onUnauthorized = callback;
};

const parseCookieFromResponse = (response) => {
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    const match = cookie.match(/3x-ui=([^;]+)/);
    if (match) return `3x-ui=${match[1]}`;
  }
  return null;
};

export const createApiClient = async (url) => {
  const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  baseURL = normalizedUrl;

  apiClient = axios.create({
    baseURL: normalizedUrl,
    timeout: 15000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  apiClient.interceptors.response.use(
    (response) => {
      const url = response.config?.url || '';
      if (!url.endsWith('/login')) {
        const cookie = parseCookieFromResponse(response);
        if (cookie) {
          storage.saveSession(cookie);
        }
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        storage.clearAll();
        if (onUnauthorized) onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  const sessionCookie = await storage.getSession();
  if (sessionCookie) {
    apiClient.defaults.headers.Cookie = sessionCookie;
  }

  return apiClient;
};

export const getApiClient = () => {
  if (!apiClient) throw new Error('API client not initialized');
  return apiClient;
};

export const setSessionCookie = (cookie) => {
  if (apiClient) {
    apiClient.defaults.headers.Cookie = cookie;
  }
};

export const getBaseURL = () => baseURL;
