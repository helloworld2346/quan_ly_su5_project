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
  vienF: number;
  // Công tác (3)
  congTacNgoaiSuDoan: number;
  congTacSQ: number;
  congTacCS: number;
  // Học (2)
  hocNgoaiSuDoan: number;
  hocSQ: number;
}

export interface CreateReportRequest {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  thoiGianBaoCao: string;
  thongTinVang: string; // JSON string của VangChiTiet
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
