import axios from "axios";

export const axiosInstanceAnonymous = axios.create({
  baseURL: import.meta.env.VITE_SERVICE_URL,
  timeout: 30000,
});
