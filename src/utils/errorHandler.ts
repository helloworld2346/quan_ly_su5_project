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
