import { getApiClient } from './client';

export const nodesApi = {
  async list() {
    const api = getApiClient();
    const response = await api.get('/panel/api/nodes/list');
    return response.data;
  },

  async get(id) {
    const api = getApiClient();
    const response = await api.get(`/panel/api/nodes/get/${id}`);
    return response.data;
  },

  async add(nodeData) {
    const api = getApiClient();
    const response = await api.post('/panel/api/nodes/add', nodeData);
    return response.data;
  },

  async update(id, nodeData) {
    const api = getApiClient();
    const response = await api.put(`/panel/api/nodes/update/${id}`, nodeData);
    return response.data;
  },

  async delete(id) {
    const api = getApiClient();
    const response = await api.delete(`/panel/api/nodes/del/${id}`);
    return response.data;
  },

  async getInbounds() {
    const api = getApiClient();
    const response = await api.get('/panel/api/nodes/inbounds');
    return response.data;
  },
};
