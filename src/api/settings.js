import { getApiClient } from './client';

export const settingsApi = {
  async getAll() {
    const api = getApiClient();
    const response = await api.post('/panel/api/setting/all');
    return response.data;
  },

  async update(settings) {
    const api = getApiClient();
    const response = await api.post('/panel/api/setting/update', settings);
    return response.data;
  },

  async updateUser(data) {
    const api = getApiClient();
    const response = await api.post('/panel/api/setting/updateUser', data);
    return response.data;
  },

  async getDefaultSettings() {
    const api = getApiClient();
    const response = await api.get('/panel/api/setting/defaultSettings');
    return response.data;
  },

  async restartPanel() {
    const api = getApiClient();
    const response = await api.post('/panel/api/setting/restartPanel');
    return response.data;
  },

  async testTgBot() {
    const api = getApiClient();
    const response = await api.post('/panel/api/setting/testTgBot');
    return response.data;
  },

  async testSmtp() {
    const api = getApiClient();
    const response = await api.post('/panel/api/setting/testSmtp');
    return response.data;
  },
};
