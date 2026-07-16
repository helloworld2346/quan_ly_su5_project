export interface TrucNguoi {
  hoTen: string;
  capBac: string;
  chucVu: string;
  soDienThoai: string;
}

const EMPTY_TRUC_NGUOI: TrucNguoi = {
  hoTen: "",
  capBac: "",
  chucVu: "",
  soDienThoai: "",
};

export function parseTrucNguoi(raw: string | undefined | null): TrucNguoi {
  if (!raw) return { ...EMPTY_TRUC_NGUOI };
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === "object" && "hoTen" in p) {
      return {
        hoTen: p.hoTen ?? "",
        capBac: p.capBac ?? "",
        chucVu: p.chucVu ?? "",
        soDienThoai: p.soDienThoai ?? "",
      };
    }
  } catch {
    // dữ liệu cũ: chuỗi tên trần
  }
  return { ...EMPTY_TRUC_NGUOI, hoTen: raw };
}

export function stringifyTrucNguoi(t: TrucNguoi): string {
  return JSON.stringify(t);
}
