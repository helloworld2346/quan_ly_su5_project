// Thông tin người trực (nội vụ / CTĐ-CTCT)
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

// Parse chuỗi trucBan (JSON {hoTen,capBac,chucVu,soDienThoai}).
// Tương thích ngược: dữ liệu cũ là tên trần -> coi nguyên chuỗi là hoTen.
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
