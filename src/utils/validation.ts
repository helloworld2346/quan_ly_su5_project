export const loginValidation = {
  username: (value: string): string | null => {
    if (!value.trim()) return "Vui lòng nhập tên đăng nhập";
    if (value.length < 3) return "Tên đăng nhập phải có ít nhất 3 ký tự";
    return null;
  },
  password: (value: string): string | null => {
    if (!value.trim()) return "Vui lòng nhập mật khẩu";
    if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    return null;
  },
};
