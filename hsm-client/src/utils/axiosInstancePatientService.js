import axios from "axios";
import { API_URLS } from "../config/apiConfig.js";

export const axiosInstancePatientService = axios.create({
  baseURL: `${API_URLS.PATIENT_SERVICE}/patients`,
  timeout: 1000,
});

axiosInstancePatientService.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstancePatientService;
