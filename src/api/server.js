import { getApiClient } from './client';

export const serverApi = {
  async getStatus() {
    const api = getApiClient();
    const response = await api.get('/panel/api/server/status');
    return response.data;
  },

  async getCpuHistory(bucket = '30m') {
    const api = getApiClient();
    const response = await api.get(`/panel/api/server/cpuHistory/${bucket}`);
    return response.data;
  },

  async getHistory(metric = 'cpu', bucket = '1h') {
    const api = getApiClient();
    const response = await api.get(`/panel/api/server/history/${metric}/${bucket}`);
    return response.data;
  },

  async getLogs(count = 50) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/server/logs/${count}`);
    return response.data;
  },

  async getXrayLogs(count = 50) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/server/xraylogs/${count}`);
    return response.data;
  },

  async getConfigJson() {
    const api = getApiClient();
    const response = await api.get('/panel/api/server/getConfigJson');
    return response.data;
  },

  async getXrayMetricsState() {
    const api = getApiClient();
    const response = await api.get('/panel/api/server/xrayMetricsState');
    return response.data;
  },
};
