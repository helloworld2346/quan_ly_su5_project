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
  chiTietVang: string;
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
    ghiChu: string | null;
    status: string;
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang: string | null;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: {
      idCatruc: string;
      ngaytruc: string;
      matkhau: string;
      ghichu: string;
      trucBanTacChien: {
        createdAt: string;
        updatedAt: string;
        isDeleted: boolean;
        deletedAt: string | null;
        idNguoitruc: string;
        tenNguoitruc: string;
        capbacNguoitruc: string;
        chucvuNguoitruc: string;
        sodienthoai: string;
      };
      trucChiHuy: {
        createdAt: string;
        updatedAt: string;
        isDeleted: boolean;
        deletedAt: string | null;
        idNguoitruc: string;
        tenNguoitruc: string;
        capbacNguoitruc: string;
        chucvuNguoitruc: string;
        sodienthoai: string;
      };
    };
  };
}

export interface UpdateReportRequest {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  thoiGianBaoCao: string;
  thongTinVang: string;
  chiTietVang: string;
  account: string;
  donVi: string;
}

export type UpdateReportResponse = CreateReportResponse;
export type ApproveResponse = CreateReportResponse;
export type SearchReportResponse = CreateReportResponse;

export interface RefuseRequest {
  ghiChu: string;
}

export type RefuseResponse = CreateReportResponse;

export interface SearchChildrenResponse {
  success: boolean;
  code: number;
  message: string;
  Result: Array<{
    idDonBaoCao: string;
    quanSoHienDien: number;
    quanSoTong: number;
    quanSoVang: number;
    ghiChu: string | null;
    status: string;
    thoiGianBaoCao: string;
    thongTinVang: string;
    chiTietVang: string | null;
    donVi: {
      maDonVi: string;
      tenDonvi: string;
    };
    caTruc: {
      idCatruc: string;
      ngaytruc: string;
      matkhau: string;
      ghichu: string;
      trucBanTacChien: {
        createdAt: string;
        updatedAt: string;
        isDeleted: boolean;
        deletedAt: string | null;
        idNguoitruc: string;
        tenNguoitruc: string;
        capbacNguoitruc: string;
        chucvuNguoitruc: string;
        sodienthoai: string;
      };
      trucChiHuy: {
        createdAt: string;
        updatedAt: string;
        isDeleted: boolean;
        deletedAt: string | null;
        idNguoitruc: string;
        tenNguoitruc: string;
        capbacNguoitruc: string;
        chucvuNguoitruc: string;
        sodienthoai: string;
      };
    };
  }>;
}

export interface ChiTietVangQuanNhan {
  id: string;
  hoTen: string;
  capBac: string;
  chucVu: string;
  lyDoVang: string;
  ghiChu: string;
}