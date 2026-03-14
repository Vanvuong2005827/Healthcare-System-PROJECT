import axios from "axios";
import { API_URLS } from "../config/apiConfig.js";

export const axiosInstanceInventoryService = axios.create({
  baseURL: `${API_URLS.INVENTORY_SERVICE}/pharmaceutical-inventory`,
  timeout: 7000,
});

axiosInstanceInventoryService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstanceInventoryService;
