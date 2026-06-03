export interface VangChiTiet {
  // Hội thao (2)
  hoiThaiNgoaiSuDoan: number;
  hoiThaiEF: number;
  // Xây dựng (2)
  xayDungNgoaiSuDoan: number;
  xayDungEF: number;
  // Khác (3)
  choHuu: number;
  nghiTranhThu: number;
  phep: number;
  // Viện (2)
  vienNgoaiSuDoan: number;
  vienEF: number;
  // Công tác (2)
  congTacNgoaiSuDoan: number;
  congTacSuDoan: number;
  // Học (2)
  hocSQ: number;
  hocCS: number;
}

export interface CreateReportRequest {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  thoiGianBaoCao: string;
  thongTinVang: string;
  donVi: string;
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
    status: string;
    thoiGianBaoCao: string;
    thongTinVang: string;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: {
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
    };
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
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: {
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
    };
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
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: {
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
    };
  }>;
}
