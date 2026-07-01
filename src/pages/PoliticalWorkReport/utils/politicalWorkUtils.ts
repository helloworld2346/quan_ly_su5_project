import type {
  PoliticalWorkItem,
  PoliticalWorkRow,
} from "../../../types/politicalWork";

export function mapItemToRow(item: PoliticalWorkItem): PoliticalWorkRow {
  return {
    idCongtac: item.idCongtac,
    donVi: item.donVi.maDonVi,
    tenDonVi: item.donVi.tenDonvi,
    kyhieuDonVi: item.donVi.kyhieuDonvi,
    tinhHinh: item.tinhHinh ?? "",
    noiDungDotXuat: item.noiDungDotXuat ?? "",
    ketQua: item.ketQua ?? "",
    trucBanNoiVu: item.trucBanNoiVu ?? "",
    trucBanCtDangCt: item.trucBanCtDangCt ?? "",
    kienNghi: item.kienNghi ?? "",
    status: item.status,
    ghiChu: (item.ghiChu ?? "") || "",
    rawItem: item,
  };
}

export function createEmptyPoliticalWorkRow(args: {
  maDonVi: string;
  tenDonVi: string;
  kyhieuDonVi?: string;
}): PoliticalWorkRow {
  return {
    idCongtac: args.maDonVi,
    donVi: args.maDonVi,
    tenDonVi: args.tenDonVi,
    kyhieuDonVi: args.kyhieuDonVi,
    tinhHinh: "",
    noiDungDotXuat: "",
    ketQua: "",
    trucBanNoiVu: "",
    trucBanCtDangCt: "",
    kienNghi: "",
    status: "Chưa_Nộp",
    ghiChu: "",
    notSubmitted: true,
    rawItem: {} as PoliticalWorkItem,
  };
}
