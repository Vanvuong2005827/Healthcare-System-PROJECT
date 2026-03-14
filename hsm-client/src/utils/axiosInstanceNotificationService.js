import axios from "axios";
import { API_URLS } from "../config/apiConfig.js";

export const axiosInstanceNotificationService = axios.create({
  baseURL: `${API_URLS.NOTIFICATION_SERVICE}/notifications`,
  timeout: 7000,
});

axiosInstanceNotificationService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstanceNotificationService;
