import type { Account } from "../types/account";

export function getAvatarInitials(account: Account | null): string {
  if (!account) return "QT";
  const name = account.tenDangNhap || account.tenTaiKhoan || "";
  if (!name) return "QT";
  return name.split("_")[0].toUpperCase();
}
