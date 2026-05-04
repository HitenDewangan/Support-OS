import axiosInstance from './axiosInstance';

const tenantService = {
  getTenants: async () => {
    const response = await axiosInstance.get('/admin/businesses');
    return response.data;
  },
  getPendingTenants: async () => {
    const response = await axiosInstance.get('/admin/pending');
    return response.data;
  },
  getStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },
  approveTenant: async (id) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/approve`);
    return response.data;
  },
  rejectTenant: async (id) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/reject`);
    return response.data;
  },
  createTenant: async (data) => {
    const response = await axiosInstance.post('/admin/create-tenant', data);
    return response.data;
  },
};

export default tenantService;
