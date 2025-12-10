// utils/axiosClient.js
import axios from "axios";
import { useAuthStore } from "@/counterstore";
const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
});

// Add JWT token to all requests automatically
axiosClient.interceptors.request.use((config) => {

   const token = useAuthStore.getState().token;   // ✅ correct token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
