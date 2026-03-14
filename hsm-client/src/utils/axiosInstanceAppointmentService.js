import axios from "axios";
import { API_URLS } from "../config/apiConfig.js";

export const axiosInstanceAppointmentService = axios.create({
  baseURL: `${API_URLS.APPOINTMENT_SERVICE}/appointments`,
  timeout: 7000,
});

axiosInstanceAppointmentService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstanceAppointmentService;
