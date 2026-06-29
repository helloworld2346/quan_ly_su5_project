import type { NguoiTrucDetail } from "../types/duty";

export function formatNguoiTrucLabel(
  p: Pick<
    NguoiTrucDetail,
    "capbacNguoitruc" | "tenNguoitruc" | "chucvuNguoitruc"
  >,
): string {
  return `${p.capbacNguoitruc} ${p.tenNguoitruc} — ${p.chucvuNguoitruc}`;
}

export function buildAllowedOptions<T>(
  allowed: string[],
  source: T[],
  getName: (item: T) => string,
): { value: string; label: string }[] {
  const names = new Set(source.map(getName));
  return allowed
    .filter((name) => names.has(name))
    .map((name) => ({ value: name, label: name }));
}
