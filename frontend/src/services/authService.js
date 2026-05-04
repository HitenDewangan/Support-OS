import axiosInstance from "./axiosInstance";

const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
    }
    return response.data;
  },
  registerBusiness: async (userData) => {
    const response = await axiosInstance.post(
      "/auth/register/business",
      userData,
    );
    return response.data;
  },
  registerAgent: async ({ token, password }) => {
    const response = await axiosInstance.post("/auth/register/agent", {
      token,
      password,
    });
    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
    }
    return response.data;
  },
  registerCustomer: async (userData) => {
    const response = await axiosInstance.post(
      "/auth/register/customer",
      userData,
    );
    // Don't auto-login — customer must go through login to select a business
    return response.data;
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      // swallow logout errors so frontend can still clear local state
    }
    localStorage.removeItem("token");
    localStorage.removeItem("supportos_user");
  },
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },
  refreshToken: async () => {
    const response = await axiosInstance.post("/auth/refresh");
    return response.data;
  },
  getBusinesses: async () => {
    const response = await axiosInstance.get("/auth/businesses");
    return response.data;
  },
};

export default authService;
