import axios from "axios";
import { API_URLS } from "../config/apiConfig.js";

export const axiosInstanceDoctorService = axios.create({
  baseURL: `${API_URLS.DOCTOR_SERVICE}/doctors`,
  timeout: 7000,
});

axiosInstanceDoctorService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstanceDoctorService;
