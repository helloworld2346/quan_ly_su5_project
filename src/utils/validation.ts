export const loginValidation = {
  username: (value: string): string | null => {
    if (!value.trim()) return "Vui lòng nhập tên đăng nhập";
    return null;
  },
  password: (value: string): string | null => {
    if (!value.trim()) return "Vui lòng nhập mật khẩu";
    return null;
  },
};
