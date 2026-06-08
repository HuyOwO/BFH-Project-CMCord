import api from './api';

export const authService = {
  register: async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    return data.data;
  },
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};

export const serverService = {
  getAll: async () => {
    const { data } = await api.get('/servers');
    return data.data;
  },
  create: async (name, description) => {
    const { data } = await api.post('/servers', { name, description });
    return data.data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/servers/${id}`);
    return data.data;
  },
  join: async (inviteCode) => {
    const { data } = await api.post('/servers/join', { inviteCode });
    return data.data;
  },
  remove: async (id) => {
    await api.delete(`/servers/${id}`);
  },
};

export const channelService = {
  getAll: async (serverId) => {
    const { data } = await api.get(`/servers/${serverId}/channels`);
    return data.data;
  },
  create: async (serverId, name) => {
    const { data } = await api.post(`/servers/${serverId}/channels`, { name });
    return data.data;
  },
  remove: async (serverId, channelId) => {
    await api.delete(`/servers/${serverId}/channels/${channelId}`);
  },
};

export const messageService = {
  getAll: async (channelId, page = 1) => {
    const { data } = await api.get(`/channels/${channelId}/messages?page=${page}`);
    return data.data;
  },
  send: async (channelId, content, file = null) => {
    const form = new FormData();
    if (content) form.append('content', content);
    if (file) form.append('file', file);
    const { data } = await api.post(`/channels/${channelId}/messages`, form);
    return data.data;
  },
  remove: async (messageId) => {
    await api.delete(`/channels/messages/${messageId}`);
  },
};
