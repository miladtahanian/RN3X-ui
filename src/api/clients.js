import { getApiClient } from './client';

export const clientsApi = {
  async list() {
    const api = getApiClient();
    const response = await api.get('/panel/api/clients/list');
    return response.data;
  },

  async listPaged(page = 1, size = 20) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/clients/list/paged?page=${page}&size=${size}`);
    return response.data;
  },

  async get(email) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/clients/get/${encodeURIComponent(email)}`);
    return response.data;
  },

  async add(clientData) {
    const api = getApiClient();
    const response = await api.post('/panel/api/clients/add', clientData);
    return response.data;
  },

  async update(email, clientData) {
    const api = getApiClient();
    const response = await api.put(`/panel/api/clients/update/${encodeURIComponent(email)}`, clientData);
    return response.data;
  },

  async delete(email) {
    const api = getApiClient();
    const response = await api.delete(`/panel/api/clients/del/${encodeURIComponent(email)}`);
    return response.data;
  },

  async getTraffic(email) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/clients/traffic/${encodeURIComponent(email)}`);
    return response.data;
  },

  async resetTraffic(email) {
    const api = getApiClient();
    const response = await api.post(`/panel/api/clients/resetTraffic/${encodeURIComponent(email)}`);
    return response.data;
  },

  async getOnlines() {
    const api = getApiClient();
    const response = await api.get('/panel/api/clients/onlines');
    return response.data;
  },

  async getIps(email) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/clients/ips/${encodeURIComponent(email)}`);
    return response.data;
  },

  async clearIps(email) {
    const api = getApiClient();
    const response = await api.post(`/panel/api/clients/clearIps/${encodeURIComponent(email)}`);
    return response.data;
  },

  async getActiveInbounds() {
    const api = getApiClient();
    const response = await api.get('/panel/api/clients/activeInbounds');
    return response.data;
  },

  async bulkDelete(emails) {
    const api = getApiClient();
    const response = await api.post('/panel/api/clients/bulkDel', { emails });
    return response.data;
  },

  async bulkResetTraffic(emails) {
    const api = getApiClient();
    const response = await api.post('/panel/api/clients/bulkResetTraffic', { emails });
    return response.data;
  },

  async getClientIpsByGuid(guid) {
    const api = getApiClient();
    const response = await api.post('/panel/api/clients/clientIpsByGuid', { guid });
    return response.data;
  },

  async getOnlinesByGuid() {
    const api = getApiClient();
    const response = await api.get('/panel/api/clients/onlinesByGuid');
    return response.data;
  },

  async getLinks(email) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/clients/links/${encodeURIComponent(email)}`);
    return response.data;
  },
};
