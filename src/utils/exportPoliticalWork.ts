import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { PoliticalWorkRow } from "../types/politicalWork";
import { parseTrucNguoi } from "../pages/PoliticalWorkReport/utils/trucNguoi";

type QuanSo = {
  siQuan: number;
  qncn: number;
  hsqBs: number;
};

type ExportArgs = {
  row: PoliticalWorkRow;
  reportDate: string;
  tenDonVi: string;
  quanSo: QuanSo;
  donViName?: string;
  parentUnitName?: string;
  hideNoiVu?: boolean;
};

const FONT = "Times New Roman";
const COL_COUNT = 6;
// Tổng bề rộng (ký tự) của 6 cột, dùng để ước lượng số dòng wrap
const TOTAL_CHAR_WIDTH = 5 + 22 + 16 + 16 + 16 + 16;

export async function exportPoliticalWorkToExcel({
  row,
  reportDate,
  tenDonVi,
  quanSo,
  donViName,
  parentUnitName,
  hideNoiVu = false,
}: ExportArgs): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Báo cáo CTĐ-CTCT");

  ws.pageSetup = {
    orientation: "portrait",
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    },
  };

  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 22;
  ws.getColumn(3).width = 16;
  ws.getColumn(4).width = 16;
  ws.getColumn(5).width = 16;
  ws.getColumn(6).width = 16;

  // ── Góc trên bên TRÁI (cột 1-2): đơn vị cha + tên đơn vị ──
  merge(ws, 1, 1, 1, 2, (parentUnitName ?? "Quân khu 7").toUpperCase());
  cell(ws, 1, 1).font = { name: FONT, bold: true, size: 12 };
  cell(ws, 1, 1).alignment = { horizontal: "center", shrinkToFit: true };

  merge(ws, 2, 1, 2, 2, (donViName ?? tenDonVi ?? "Sư đoàn 5").toUpperCase());
  cell(ws, 2, 1).font = { name: FONT, bold: true, underline: true, size: 12 };
  cell(ws, 2, 1).alignment = { horizontal: "center", shrinkToFit: true };

  // ── Góc trên bên PHẢI (cột 4-6): quốc hiệu + tiêu ngữ + địa danh/ngày ──
  merge(ws, 1, 4, 1, 6, "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM");
  cell(ws, 1, 4).font = { name: FONT, bold: true, size: 12 };
  cell(ws, 1, 4).alignment = { horizontal: "center" };

  merge(ws, 2, 4, 2, 6, "Độc lập - Tự do - Hạnh phúc");
  cell(ws, 2, 4).font = { name: FONT, bold: true, underline: true, size: 12 };
  cell(ws, 2, 4).alignment = { horizontal: "center" };

  merge(ws, 3, 4, 3, 6, formatPlace(reportDate));
  cell(ws, 3, 4).font = { name: FONT, italic: true, size: 12 };
  cell(ws, 3, 4).alignment = { horizontal: "center" };

  let r = 5;

  // Tiêu đề: 2 dòng — "BÁO CÁO" và "HOẠT ĐỘNG CÔNG TÁC ĐẢNG - CÔNG TÁC CHÍNH TRỊ"
  merge(
    ws,
    r,
    1,
    r,
    COL_COUNT,
    "BÁO CÁO\nHOẠT ĐỘNG CÔNG TÁC ĐẢNG - CÔNG TÁC CHÍNH TRỊ",
  );
  cell(ws, r, 1).font = { name: FONT, bold: true, size: 15 };
  cell(ws, r, 1).alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  ws.getRow(r).height = 48;
  r += 2;

  // 1. Quân số (không kẻ khung) — xếp DỌC: mỗi chỉ tiêu một hàng
  sectionTitle(ws, r, "1. Quân số");
  r++;

  const tong = quanSo.siQuan + quanSo.qncn + quanSo.hsqBs;
  r = qsVertical(ws, r, tong, quanSo.siQuan, quanSo.qncn, quanSo.hsqBs);
  r++;

  // 2. Tình hình hoạt động
  r = textBlock(ws, r, "2. Tình hình hoạt động", row.tinhHinh);
  // 3. Kết quả
  r = textBlock(ws, r, "3. Kết quả", row.ketQua);
  // 4. Vụ việc đột xuất (rỗng -> "Không")
  r = textBlock(ws, r, "4. Vụ việc đột xuất", row.noiDungDotXuat, true);
  // 5. Kiến nghị, đề xuất (rỗng -> "Không")
  r = textBlock(ws, r, "5. Kiến nghị, đề xuất", row.kienNghi, true);

  r++;

  // Cột ký: dòng 1 = tên vai trò, dòng 2 = chức vụ, cuối = cấp bậc + họ tên.
  // Nếu ẩn Trực ban nội vụ (đại đội / dbo) thì chỉ hiển thị
  // cột "Trực ban CTĐ - CTCT" (nằm bên phải, cột 4-6).
  const noiVu = parseTrucNguoi(row.trucBanNoiVu);
  const ctd = parseTrucNguoi(row.trucBanCtDangCt);

  if (hideNoiVu) {
    merge(ws, r, 4, r, 6, "TRỰC BAN CTĐ - CTCT");
    cell(ws, r, 4).font = { name: FONT, bold: true, size: 12 };
    cell(ws, r, 4).alignment = { horizontal: "center" };
    r++;

    merge(ws, r, 4, r, 6, ctd.chucVu);
    cell(ws, r, 4).font = { name: FONT, size: 12 };
    cell(ws, r, 4).alignment = { horizontal: "center" };
    r += 4; // ← đổi từ 3 thành 4 (3 dòng trống)

    merge(ws, r, 4, r, 6, formatCapBacTen(ctd));
    cell(ws, r, 4).font = { name: FONT, bold: true, size: 12 };
    cell(ws, r, 4).alignment = { horizontal: "center" };
  } else {
    merge(ws, r, 1, r, 3, "TRỰC BAN NỘI VỤ");
    merge(ws, r, 4, r, 6, "TRỰC BAN CTĐ - CTCT");
    [1, 4].forEach((c) => {
      cell(ws, r, c).font = { name: FONT, bold: true, size: 12 };
      cell(ws, r, c).alignment = { horizontal: "center" };
    });
    r++;

    merge(ws, r, 1, r, 3, noiVu.chucVu);
    merge(ws, r, 4, r, 6, ctd.chucVu);
    [1, 4].forEach((c) => {
      cell(ws, r, c).font = { name: FONT, size: 12 };
      cell(ws, r, c).alignment = { horizontal: "center" };
    });
    r += 4; // ← đổi từ 3 thành 4 (3 dòng trống)

    merge(ws, r, 1, r, 3, formatCapBacTen(noiVu));
    merge(ws, r, 4, r, 6, formatCapBacTen(ctd));
    [1, 4].forEach((c) => {
      cell(ws, r, c).font = { name: FONT, bold: true, size: 12 };
      cell(ws, r, c).alignment = { horizontal: "center" };
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `BaoCaoCTD_CTCT_${reportDate}.xlsx`,
  );
}

function sectionTitle(ws: ExcelJS.Worksheet, r: number, text: string) {
  merge(ws, r, 1, r, COL_COUNT, text);
  cell(ws, r, 1).font = { name: FONT, bold: true, size: 13 };
  cell(ws, r, 1).alignment = { horizontal: "left", vertical: "middle" };
}

// Quân số xếp DỌC: mỗi chỉ tiêu một hàng (nhãn ở cột 2, số ở cột 3), KHÔNG kẻ khung
function qsVertical(
  ws: ExcelJS.Worksheet,
  r: number,
  tong: number,
  sq: number,
  qncn: number,
  hsqBs: number,
): number {
  const items: Array<[string, number]> = [
    ["Tổng quân số", tong],
    ["Sĩ quan", sq],
    ["QNCN", qncn],
    ["HSQ/BS", hsqBs],
  ];
  items.forEach(([label, value]) => {
    const lc = cell(ws, r, 2);
    lc.value = label;
    lc.font = { name: FONT, bold: true, size: 12 };
    lc.alignment = { horizontal: "left", vertical: "middle" };

    const vc = cell(ws, r, 3);
    vc.value = value.toLocaleString("de-DE");
    vc.font = { name: FONT, size: 12 };
    vc.alignment = { horizontal: "left", vertical: "middle" };

    r++;
  });
  return r;
}

function textBlock(
  ws: ExcelJS.Worksheet,
  r: number,
  title: string,
  content: string,
  emptyAsKhong = false,
): number {
  sectionTitle(ws, r, title);
  r++;

  const hasContent = Boolean(content && content.trim());

  // Mục rỗng + cần hiển thị "Không" -> ghi chữ "Không" thay vì dấu chấm
  if (!hasContent && emptyAsKhong) {
    merge(ws, r, 1, r, COL_COUNT, "Không");
    cell(ws, r, 1).font = { name: FONT, size: 12 };
    cell(ws, r, 1).alignment = { horizontal: "left", vertical: "middle" };
    ws.getRow(r).height = 20;
    return r + 2;
  }

  const text = hasContent ? content : "";
  merge(ws, r, 1, r, COL_COUNT, text);
  cell(ws, r, 1).font = { name: FONT, size: 12 };
  cell(ws, r, 1).alignment = { vertical: "top", wrapText: true };

  // Autofit: chiều cao sát số dòng thực tế của nội dung
  const lines = estimateLines(text);
  ws.getRow(r).height = lines * 12 + 4;

  return r + 2;
}

// Ước lượng số dòng khi wrap trong vùng merge 6 cột.
function estimateLines(text: string): number {
  if (!text) return 1;
  const charsPerLine = Math.max(Math.round(TOTAL_CHAR_WIDTH * 1.25), 20);
  return text.split(/\r?\n/).reduce((sum, line) => {
    const len = line.trim().length;
    return sum + Math.max(1, Math.ceil(len / charsPerLine));
  }, 0);
}

function merge(
  ws: ExcelJS.Worksheet,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  value: string,
) {
  ws.mergeCells(r1, c1, r2, c2);
  ws.getCell(r1, c1).value = value;
}

function cell(ws: ExcelJS.Worksheet, r: number, c: number) {
  return ws.getCell(r, c);
}

// Giống export daily report: "Tây Ninh, ngày ... tháng ... năm ..."
function formatPlace(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y
    ? `Tây Ninh, ngày ${d} tháng ${m} năm ${y}`
    : "Tây Ninh, ngày ..... tháng ..... năm .....";
}

// Dòng cuối khối ký: cấp bậc + họ tên (vd "Đại úy Nguyễn Minh Phi")
function formatCapBacTen(t: {
  capBac: string;
  hoTen: string;
  chucVu: string;
}): string {
  return [t.capBac, t.hoTen].filter(Boolean).join(" ");
}
