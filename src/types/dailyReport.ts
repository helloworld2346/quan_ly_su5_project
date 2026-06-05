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
}

export interface AbsentRow {
  id: string;
  hoTen: string;
  capBac: string;
  chucVu: string;
  lyDoVang: keyof VangChiTiet;
  ghiChu: string;
}

export interface CreateReportRequest {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  thoiGianBaoCao: string;
  thongTinVang: string;
  chiTietVang?: string;
  donVi: string;
}

interface CaTruc {
  ngaytruc?: string;
  matkhau?: string;
  ghichu?: string;
  trucBanTacChien: {
    capbacNguoitruc: string;
    chucvuNguoitruc: string;
    tenNguoitruc: string;
  };
  trucChiHuy: {
    capbacNguoitruc: string;
    chucvuNguoitruc: string;
    tenNguoitruc: string;
  };
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
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: CaTruc;
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
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: CaTruc;
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
    };
    caTruc: CaTruc;
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
    };
    caTruc: CaTruc;
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
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang?: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: CaTruc;
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
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang?: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: CaTruc;
  }>;
}
