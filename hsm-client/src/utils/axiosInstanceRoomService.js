import axios from "axios";
import { API_URLS } from "../config/apiConfig.js";

export const axiosInstanceRoomService = axios.create({
  baseURL: `${API_URLS.ROOM_SERVICE}/rooms`,
  timeout: 7000,
});

axiosInstanceRoomService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstanceRoomService;
