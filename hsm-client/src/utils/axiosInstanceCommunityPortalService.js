import axios from "axios";
import { API_URLS } from "../config/apiConfig.js";

export const axiosInstanceCommunityPortalService = axios.create({
  baseURL: `${API_URLS.COMMUNITY_PORTAL_SERVICE}/community-portal`,
  timeout: 7000,
});

axiosInstanceCommunityPortalService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstanceCommunityPortalService;
