import type {
  TrucNguoiInfo,
  VangChiTiet,
  ReportItemInput,
  CreateReportResponse,
  ChiTietVangQuanNhan,
  ReportRow,
} from "../types/dailyReport";

export const EMPTY_VANG: VangChiTiet = {
  hoiThaiNgoaiSuDoan: 0,
  hoiThaiEF: 0,
  xayDungNgoaiSuDoan: 0,
  xayDungEF: 0,
  choHuu: 0,
  nghiTranhThu: 0,
  phep: 0,
  vienNgoaiSuDoan: 0,
  vienEF: 0,
  congTacNgoaiSuDoan: 0,
  congTacSuDoan: 0,
  hocSQ: 0,
  hocCS: 0,
  lyDoVangKhac: 0,
};

export function sumVang(rows: { vang: VangChiTiet }[]): VangChiTiet {
  return rows.reduce<VangChiTiet>(
    (acc, r) => {
      (Object.keys(acc) as (keyof VangChiTiet)[]).forEach((k) => {
        acc[k] += r.vang[k] ?? 0;
      });
      return acc;
    },
    { ...EMPTY_VANG },
  );
}

export function todayIsoDate(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function normalizeRoleName(role: string | undefined): string {
  if (!role) return "";
  const r = role.toLowerCase();
  if (r.includes("trực ban tác chiến")) return "Trực ban tác chiến";
  if (r.includes("trực ban nội vụ")) return "Trực ban nội vụ";
  if (r.includes("trực chỉ huy") || r.includes("chỉ huy"))
    return "Trực chỉ huy";
  if (r.includes("quản trị viên") || r.includes("admin"))
    return "Quản Trị Viên";
  return role;
}

export function mapItemToRow(item: ReportItemInput): ReportRow {
  let vang: VangChiTiet = { ...EMPTY_VANG };
  let chiTietVangList: ChiTietVangQuanNhan[] = [];

  try {
    vang = JSON.parse(item.thongTinVang) as VangChiTiet;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error("Error parsing thongTinVang:", e);
    }
  }

  try {
    if (item.chiTietVang) {
      chiTietVangList = JSON.parse(item.chiTietVang) as ChiTietVangQuanNhan[];
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error("Error parsing chiTietVang:", e);
    }
  }

  return {
    idDonBaoCao: item.idDonBaoCao,
    donVi: item.donVi.maDonVi,
    tenDonVi: item.donVi.tenDonvi,
    kyhieuDonVi: item.donVi.kyhieuDonvi,
    quanSoTong: item.quanSoTong,
    quanSoHienDien: item.quanSoHienDien,
    quanSoVang: item.quanSoVang,
    vang,
    chiTietVangList,
    status: item.status,
    ghiChu: (item.ghiChu ?? "") || "",
    rawItem: item as unknown as CreateReportResponse["Result"],
  };
}

export const LY_DO_OPTIONS: { value: keyof VangChiTiet; label: string }[] = [
  { value: "hoiThaiNgoaiSuDoan", label: "Hội thao - Ngoài Sư đoàn" },
  { value: "hoiThaiEF", label: "Hội thao - e, f" },
  { value: "xayDungNgoaiSuDoan", label: "Xây dựng - Ngoài Sư đoàn" },
  { value: "xayDungEF", label: "Xây dựng - e, f" },
  { value: "vienNgoaiSuDoan", label: "Viện - Ngoài Sư đoàn" },
  { value: "vienEF", label: "Viện - e, f" },
  { value: "congTacNgoaiSuDoan", label: "Công tác - Ngoài Sư đoàn" },
  { value: "congTacSuDoan", label: "Công tác - Sư đoàn" },
  { value: "hocSQ", label: "Học - Sĩ quan" },
  { value: "hocCS", label: "Học - Chiến sĩ" },
  { value: "choHuu", label: "Chờ hưu" },
  { value: "nghiTranhThu", label: "Nghỉ tranh thủ" },
  { value: "phep", label: "Phép" },
  { value: "lyDoVangKhac", label: "Lý do khác" },
];

export const CAP_BAC_OPTIONS = [
  "Binh nhất",
  "Binh nhì",
  "Hạ sĩ",
  "Trung sĩ",
  "Thượng sĩ",
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
  "Đại tá",
  "Thiếu úy QNCN",
  "Trung úy QNCN",
  "Thượng úy QNCN",
  "Đại úy QNCN",
  "Thiếu tá QNCN",
  "Trung tá QNCN",
  "Thượng tá QNCN",
];

export const CAP_BAC_CHI_HUY_DEFAULT = [
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
  "Thượng tá",
  "Đại tá",
];

export const CAP_BAC_TAC_CHIEN_DEFAULT = [
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
];

export const CAP_BAC_CHI_HUY_DAI_DOI = [
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
];

export const CAP_BAC_TAC_CHIEN_DAI_DOI = [
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
];

export const CAP_BAC_CHI_HUY_TIEU_DOAN = [
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
];

export const CAP_BAC_TAC_CHIEN_TIEU_DOAN = [
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Thiếu úy QNCN",
  "Trung úy QNCN",
  "Thượng úy QNCN",
  "Đại úy QNCN",
  "Thiếu tá QNCN",
  "Trung tá QNCN",
  "Thượng tá QNCN",
];

export const CAP_BAC_CHI_HUY_TRUNG_DOAN = [
  "Thiếu tá",
  "Trung tá",
  "Thượng tá",
];

export const CAP_BAC_TAC_CHIEN_TRUNG_DOAN = [
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
];

export const CAP_BAC_CHI_HUY_SU_DOAN = [
  "Trung tá",
  "Thượng tá",
  "Đại tá",
];

export const CAP_BAC_TAC_CHIEN_SU_DOAN = [
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
];

export const getCapBacOptions = (
  capDonVi?: string,
  isTacChien?: boolean,
  isSuDoan?: boolean
): string[] => {
  if (isSuDoan) {
    return isTacChien ? CAP_BAC_TAC_CHIEN_SU_DOAN : CAP_BAC_CHI_HUY_SU_DOAN;
  }

  switch (capDonVi) {
    case "DAI_DOI":
      return isTacChien ? CAP_BAC_TAC_CHIEN_DAI_DOI : CAP_BAC_CHI_HUY_DAI_DOI;
    case "TIEU_DOAN":
      return isTacChien ? CAP_BAC_TAC_CHIEN_TIEU_DOAN : CAP_BAC_CHI_HUY_TIEU_DOAN;
    case "TRUNG_DOAN":
      return isTacChien ? CAP_BAC_TAC_CHIEN_TRUNG_DOAN : CAP_BAC_CHI_HUY_TRUNG_DOAN;
    default:
      return isTacChien ? CAP_BAC_TAC_CHIEN_DEFAULT : CAP_BAC_CHI_HUY_DEFAULT;
  }
};


export const getCapBacVangOptions = (capDonVi?: string): string[] => {
  switch (capDonVi) {
    case "DAI_DOI":

      return [
        "Binh nhất",
        "Binh nhì",
        "Hạ sĩ",
        "Trung sĩ",
        "Thượng sĩ",
        "Thiếu úy",
        "Trung úy",
        "Thượng úy",
        "Đại úy",
        "Thiếu tá",
        "Thiếu úy QNCN",
        "Trung úy QNCN",
        "Thượng úy QNCN",
        "Đại úy QNCN",
      ];
    case "TIEU_DOAN":
      return [
        "Binh nhất",
        "Binh nhì",
        "Hạ sĩ",
        "Trung sĩ",
        "Thượng sĩ",
        "Thiếu úy",
        "Trung úy",
        "Thượng úy",
        "Đại úy",
        "Thiếu tá",
        "Trung tá",
        "Thiếu úy QNCN",
        "Trung úy QNCN",
        "Thượng úy QNCN",
        "Đại úy QNCN",
        "Thiếu tá QNCN",
      ];
    case "TRUNG_DOAN":
    
      return [
        "Binh nhất",
        "Binh nhì",
        "Hạ sĩ",
        "Trung sĩ",
        "Thượng sĩ",
        "Thiếu úy",
        "Trung úy",
        "Thượng úy",
        "Đại úy",
        "Thiếu tá",
        "Trung tá",
        "Thiếu úy QNCN",
        "Trung úy QNCN",
        "Thượng úy QNCN",
        "Đại úy QNCN",
        "Thiếu tá QNCN",
        "Trung tá QNCN",
      ];
    case "SU_DOAN":
    default:
     
      return CAP_BAC_OPTIONS;
  }
};

export const EMPTY_TRUC: TrucNguoiInfo = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};

type CaTrucNguoi = {
  tenNguoitruc?: string;
  capbacNguoitruc?: string;
  chucvuNguoitruc?: string;
  sodienthoai?: string;
};

export function trucFromCaTrucInfo(t?: CaTrucNguoi | null): TrucNguoiInfo {
  if (!t) return { ...EMPTY_TRUC };
  return {
    tenNguoitruc: t.tenNguoitruc ?? "",
    capbacNguoitruc: t.capbacNguoitruc ?? "",
    chucvuNguoitruc: t.chucvuNguoitruc ?? "",
    sodienthoai: t.sodienthoai ?? "",
  };
}

export function parseTrucNguoi(raw?: string): TrucNguoiInfo {
  if (!raw) return { ...EMPTY_TRUC };
  try {
    return JSON.parse(raw) as TrucNguoiInfo;
  } catch {
    return { ...EMPTY_TRUC };
  }
}