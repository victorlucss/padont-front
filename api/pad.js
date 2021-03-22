import api from './api';

export const padService = {
  async get(path) {
    const { data } = await api.get(`/${path}`)

    return data

  },

  async put(path, content) {
    const response = await api.put(`/${path}`, content)

    return response
  }
}