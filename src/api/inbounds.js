import { getApiClient } from './client';

export const inboundsApi = {
  async list() {
    const api = getApiClient();
    const response = await api.get('/panel/api/inbounds/list');
    return response.data;
  },

  async listSlim() {
    const api = getApiClient();
    const response = await api.get('/panel/api/inbounds/list/slim');
    return response.data;
  },

  async get(id) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/inbounds/get/${id}`);
    return response.data;
  },

  async add(inboundData) {
    const api = getApiClient();
    const response = await api.post('/panel/api/inbounds/add', inboundData);
    return response.data;
  },

  async update(id, inboundData) {
    const api = getApiClient();
    const response = await api.post(`/panel/api/inbounds/update/${id}`, inboundData);
    return response.data;
  },

  async delete(id) {
    const api = getApiClient();
    const response = await api.post(`/panel/api/inbounds/del/${id}`);
    return response.data;
  },

  async setEnable(id, enable) {
    const api = getApiClient();
    const response = await api.post(`/panel/api/inbounds/setEnable/${id}?enable=${enable}`);
    return response.data;
  },

  async resetAllTraffic() {
    const api = getApiClient();
    const response = await api.post('/panel/api/inbounds/resetAllTraffics');
    return response.data;
  },

  async getOptions() {
    const api = getApiClient();
    const response = await api.get('/panel/api/inbounds/options');
    return response.data;
  },
};
