import axiosInstance from './axiosInstance';

const agentService = {
  getMyAgents: async () => {
    const response = await axiosInstance.get('/business/agents');
    return response.data;
  },
  inviteAgent: async (email) => {
    const response = await axiosInstance.post('/business/agents/invite', { email });
    return response.data;
  },
};

export default agentService;
