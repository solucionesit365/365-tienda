import axios from "axios";
import { getCurrentUserToken } from "@/components/firebase/authentication";

console.log("Entorno:", import.meta.env.VITE_SERVICE_URL);

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVICE_URL,
  timeout: 30000,
  headers: { Authorization: "Bearer " },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getCurrentUserToken();

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Sustituir directamente por import.meta.env.SERVICE_URL
// export { SERVICE_URL };

