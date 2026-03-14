import axios from "axios";
import { API_URLS } from "../config/apiConfig";

const axiosInstanceCDSSService = axios.create({
  baseURL: `${API_URLS.CDSS_SERVICE}/recommendation`,
  timeout: 100000,
});

// Request interceptor
axiosInstanceCDSSService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstanceCDSSService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstanceCDSSService;
