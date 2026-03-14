import axios from "axios";
import { API_URLS } from "../config/apiConfig.js";

const axiosInstanceAnalyticResearchService = axios.create({
  baseURL: `${API_URLS.ANALYTIC_RESEARCH_SERVICE}/research`,
  timeout: 10000,
});

axiosInstanceAnalyticResearchService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstanceAnalyticResearchService;
