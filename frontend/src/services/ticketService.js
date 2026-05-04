import axiosInstance from './axiosInstance';

const ticketService = {
  getTickets: async (params) => {
    const response = await axiosInstance.get('/tickets', { params });
    return response.data;
  },
  getTicketById: async (id) => {
    const response = await axiosInstance.get(`/tickets/${id}`);
    return response.data;
  },
  createTicket: async (ticketData) => {
    const response = await axiosInstance.post('/tickets', ticketData);
    return response.data;
  },
  updateTicket: async (id, ticketData) => {
    const response = await axiosInstance.patch(`/tickets/${id}`, ticketData);
    return response.data;
  },
  addMessage: async (ticketId, content) => {
    const response = await axiosInstance.post(`/tickets/${ticketId}/messages`, { content });
    return response.data;
  },
};

export default ticketService;
