import type { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if ("response" in error && error.response) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const serverMessage = axiosError.response?.data?.message;

      if (serverMessage) {
        return serverMessage;
      }

      if (axiosError.response?.status === 401) {
        return "Tên đăng nhập hoặc mật khẩu không đúng";
      }

      if (axiosError.response?.status === 404) {
        return "Tên đăng nhập hoặc mật khẩu không đúng";
      }

      if (axiosError.response?.status === 400) {
        return "Dữ liệu không hợp lệ";
      }

      return "Đăng nhập thất bại. Vui lòng thử lại.";
    }

    return "Không thể kết nối đến server. Vui lòng thử lại.";
  }

  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export interface ErrorHandlerOptions {
  showError?: (message: string) => void;
  errorMessage?: string;
  clearData?: () => void;
  logError?: boolean;
}

export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {},
): boolean {
  const {
    showError,
    errorMessage = "Có lỗi xảy ra",
    clearData,
    logError = true,
  } = options;

  const axiosError = error as AxiosError<{ message?: string }>;
  const status = axiosError?.response?.status;

  if (status === 404) {
    if (clearData) {
      clearData();
    }
    return true;
  }

  if (logError) {
    console.error(error);
  }

  if (showError) {
    const message =
      axiosError?.response?.data?.message ||
      axiosError?.message ||
      errorMessage;
    showError(message);
  }

  if (clearData) {
    clearData();
  }

  return false;
}
