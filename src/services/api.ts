import axios from "axios";
import { storage } from "../utils/storage";

declare module "axios" {  
  export interface AxiosRequestConfig {  
    skipErrorToast?: boolean;  
  }  
}

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

type ToastErrorHandler = (message: string) => void;
let toastErrorHandler: ToastErrorHandler | null = null;

export function setToastErrorHandler(handler: ToastErrorHandler) {
  toastErrorHandler = handler;
}

function setupInterceptors(instance: typeof api) {
  instance.interceptors.request.use((config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && storage.getToken()) {
        storage.removeToken();
        storage.clearNavState();
        window.location.href = "/login";
      }

      if (
        toastErrorHandler &&
        error.response?.status !== 401 &&
        error.response?.status !== 404 &&
        !error.config?.skipErrorToast
      ) {
        const message =
          error.response?.data?.message || error.message || "Có lỗi xảy ra";
        toastErrorHandler(message);
      }

      return Promise.reject(error);
    },
  );
}

setupInterceptors(api);

export default api;
