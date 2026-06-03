import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const apiNoPrefix = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

type ToastErrorHandler = (message: string) => void;
let toastErrorHandler: ToastErrorHandler | null = null;

export function setToastErrorHandler(handler: ToastErrorHandler) {
  toastErrorHandler = handler;
}

function setupInterceptors(axiosInstance: typeof api) {
  axiosInstance.interceptors.request.use((config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && storage.getToken()) {
        storage.removeToken();
        storage.clearNavState();
        window.location.href = "/login";
      }

      if (toastErrorHandler && error.response?.status !== 401) {
        const message =
          error.response?.data?.message || error.message || "Có lỗi xảy ra";
        toastErrorHandler(message);
      }

      return Promise.reject(error);
    },
  );
}

setupInterceptors(api);
setupInterceptors(apiNoPrefix);

export default api;
export { apiNoPrefix };
