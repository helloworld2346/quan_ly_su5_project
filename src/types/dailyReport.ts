export interface TrucNguoiInfo {
  idNguoitruc?: string;
  tenNguoitruc: string;
  capbacNguoitruc: string;
  chucvuNguoitruc: string;
  sodienthoai: string;
}

export interface CaTrucInfo {
  idCatruc?: string;
  matkhau?: string;
  ghichu?: string;
  ngaytruc?: string;
  trucChiHuy?: {
    capbacNguoitruc: string;
    chucvuNguoitruc: string;
    tenNguoitruc: string;
  };
  trucBanTacChien?: {
    capbacNguoitruc: string;
    chucvuNguoitruc: string;
    tenNguoitruc: string;
  };
}

export interface VangChiTiet {
  hoiThaiNgoaiSuDoan: number;
  hoiThaiEF: number;
  xayDungNgoaiSuDoan: number;
  xayDungEF: number;
  choHuu: number;
  nghiTranhThu: number;
  phep: number;
  vienNgoaiSuDoan: number;
  vienEF: number;
  congTacNgoaiSuDoan: number;
  congTacSuDoan: number;
  hocSQ: number;
  hocCS: number;
  lyDoVangKhac: number;
}

export interface AbsentRow {
  id: string;
  hoTen: string;
  capBac: string;
  chucVu: string;
  lyDoVang: keyof VangChiTiet;
  ghiChu: string;
}

export type ReportItemInput = {
  idDonBaoCao: string;
  quanSoHienDien: number;
  quanSoTong: number;
  quanSoVang: number;
  status: string;
  thoiGianBaoCao: string;
  thongTinVang: string;
  chiTietVang?: string;
  ghiChu?: string | null;
  trucBanChiHuy?: string;
  trucBanTacChien?: string;
  donVi: { maDonVi: string; tenDonvi: string; kyhieuDonvi?: string };
  caTruc: CaTrucInfo;
};

export interface CreateReportRequest {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  thoiGianBaoCao: string;
  thongTinVang: string;
  chiTietVang?: string;
  donVi: string;
  trucBanChiHuy?: string;
  trucBanTacChien?: string;
}

export interface CreateReportResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    idDonBaoCao: string;
    quanSoHienDien: number;
    quanSoTong: number;
    quanSoVang: number;
    ghiChu?: string;
    status: string;
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang?: string;
    trucBanChiHuy?: string;
    trucBanTacChien?: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
      kyhieuDonvi?: string;
    };
    caTruc: CaTrucInfo;
  };
}

export interface UpdateReportRequest {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  thoiGianBaoCao: string;
  thongTinVang: string;
  chiTietVang?: string;
  account: string;
  donVi: string;
  trucBanChiHuy?: string;
  trucBanTacChien?: string;
}

export interface UpdateReportResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    idDonBaoCao: string;
    quanSoHienDien: number;
    quanSoTong: number;
    quanSoVang: number;
    status: string;
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang?: string;
    trucBanChiHuy?: string;
    trucBanTacChien?: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
      kyhieuDonvi?: string;
    };
    caTruc: CaTrucInfo;
  };
}

export interface ApproveResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    idDonBaoCao: string;
    quanSoHienDien: number;
    quanSoTong: number;
    quanSoVang: number;
    status: string;
    thoiGianBaoCao: string;
    thongTinVang: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
      kyhieuDonvi?: string;
    };
    caTruc: CaTrucInfo;
  };
}

export interface RefuseRequest {
  ghiChu: string;
}

export interface RefuseResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    idDonBaoCao: string;
    quanSoHienDien: number;
    quanSoTong: number;
    quanSoVang: number;
    ghiChu: string;
    status: string;
    thoiGianBaoCao: string;
    thongTinVang: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
      kyhieuDonvi?: string;
    };
    caTruc: CaTrucInfo;
  };
}

export interface SearchReportResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    idDonBaoCao: string;
    quanSoHienDien: number;
    quanSoTong: number;
    quanSoVang: number;
    status: string;
    ghiChu?: string | null;
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang?: string;
    trucBanChiHuy?: string;
    trucBanTacChien?: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
      kyhieuDonvi?: string;
    };
    caTruc: CaTrucInfo;
  };
}

export interface SearchChildrenResponse {
  success: boolean;
  code: number;
  message: string;
  Result: Array<{
    idDonBaoCao: string;
    quanSoHienDien: number;
    quanSoTong: number;
    quanSoVang: number;
    status: string;
    ghiChu?: string | null;
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang?: string;
    trucBanChiHuy?: string;
    trucBanTacChien?: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
      kyhieuDonvi?: string;
    };
    caTruc: CaTrucInfo;
  }>;
}

export interface SearchByRangeResponse {
  success: boolean;
  code: number;
  message: string;
  Result: Array<{
    idDonBaoCao: string;
    quanSoTong: number;
    quanSoHienDien: number;
    quanSoVang: number;
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang?: string;
    trucBanChiHuy?: string;
    trucBanTacChien?: string;
    ghiChu?: string | null;
    status: string;
    donVi: { maDonVi: string; tenDonvi: string; kyhieuDonvi?: string };
    caTruc: CaTrucInfo;
  }>;
}

export interface SubmitReportResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    idDonBaoCao: string;
    status: string;
    quanSoTong: number;
    quanSoHienDien: number;
    quanSoVang: number;
    thoiGianBaoCao: string;
    thongTinVang: string;
    donVi: { maDonVi: string; tenDonvi: string; kyhieuDonvi?: string };
    caTruc: CaTrucInfo;
  };
}

export interface RecallReportResponse {
  success: boolean;
  code: number;
  message: string;
  Result: {
    idDonBaoCao: string;
    status: string;
    quanSoTong: number;
    quanSoHienDien: number;
    quanSoVang: number;
    thoiGianBaoCao: string;
    thongTinVang: string;
    donVi: { maDonVi: string; tenDonvi: string; kyhieuDonvi?: string };
    caTruc: CaTrucInfo;
  };
}