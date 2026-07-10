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

export function formatDatePart(dateStr: string): string {  
  if (!dateStr) return "—";  
  const d = new Date(dateStr);  
  if (Number.isNaN(d.getTime())) return "—";  
  return d.toLocaleDateString("vi-VN", {  
    day: "2-digit",  
    month: "short",  
    year: "numeric",  
  });  
}  
  
export function formatTimePart(dateStr: string): string {  
  if (!dateStr) return "";  
  const d = new Date(dateStr);  
  if (Number.isNaN(d.getTime())) return "";  
  const hh = String(d.getHours()).padStart(2, "0");  
  const mm = String(d.getMinutes()).padStart(2, "0");  
  const ss = String(d.getSeconds()).padStart(2, "0");  
  return `${hh}:${mm}:${ss}`;  
}