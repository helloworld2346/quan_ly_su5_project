export type PoliticalWorkStatus = "Nháp" | "Chờ_Duyệt" | "Đã_Duyệt" | "Từ_Chối";

export interface PoliticalWorkDonVi {
  maDonVi: string;
  tenDonvi: string;
  kyhieuDonvi?: string;
  capDonVi?: string | null;
}

export interface PoliticalWorkRequest {
  tinhHinh: string;
  noiDungDotXuat: string;
  ketQua: string;
  trucBanNoiVu: string;
  trucBanCtDangCt: string;
  kienNghi: string;
  donVi: string;
}

export interface PoliticalWorkForm {
  tinhHinh?: string;
  noiDungDotXuat?: string;
  ketQua?: string;
  trucBanNoiVu?: string;
  trucBanCtDangCt?: string;
  kienNghi?: string;
  donVi?: string;
}

export interface PoliticalWorkItem {
  idCongtac: string;
  tinhHinh: string;
  noiDungDotXuat: string;
  ketQua: string;
  trucBanNoiVu: string;
  trucBanCtDangCt: string;
  kienNghi: string;
  status: string;
  ghiChu?: string | null;
  donVi: PoliticalWorkDonVi;
}

export interface RefuseRequest {
  ghiChu: string;
}

export interface PoliticalWorkSingleResponse {
  success: boolean;
  code: number;
  message: string;
  Result: PoliticalWorkItem;
}

export interface PoliticalWorkListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: PoliticalWorkItem[];
}

export interface PoliticalWorkRow {  
  idCongtac: string;  
  donVi: string;
  tenDonVi: string;  
  kyhieuDonVi?: string;  
  tinhHinh: string;  
  noiDungDotXuat: string;  
  ketQua: string;  
  trucBanNoiVu: string;  
  trucBanCtDangCt: string;  
  kienNghi: string;  
  status: string;  
  ghiChu: string;  
  notSubmitted?: boolean;
  rawItem: PoliticalWorkItem;  
}