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

export function createEmptyPoliticalWorkRow({
  maDonVi,
  tenDonVi,
  kyhieuDonVi,
}: {
  maDonVi: string;
  tenDonVi: string;
  kyhieuDonVi?: string;
}): PoliticalWorkRow {
  return {
    idCongtac: maDonVi,
    donVi: maDonVi,
    tenDonVi,
    kyhieuDonVi,
    tinhHinh: "",
    noiDungDotXuat: "",
    ketQua: "",
    trucBanNoiVu: "",
    trucBanCtDangCt: "",
    kienNghi: "",
    status: "Chưa_Nộp",
    ghiChu: "",
    notSubmitted: true,
    rawItem: null as unknown as PoliticalWorkItem,
  };
}
