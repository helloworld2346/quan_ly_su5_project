export function formatDateLong(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const WEEKDAYS = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export function formatFullDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${WEEKDAYS[date.getDay()]}, ${d}/${m}/${y}`;
}

export function shiftDay(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

export function toDateParam(date: Date): string {
  return date.toISOString().split("T")[0];
}
