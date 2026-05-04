import axiosInstance from "./axiosInstance";

const notificationService = {
  getNotifications: () =>
    axiosInstance.get("/notifications").then((r) => r.data),

  markAsRead: (id) =>
    axiosInstance.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    axiosInstance.patch("/notifications/read-all").then((r) => r.data),
};

export default notificationService;
