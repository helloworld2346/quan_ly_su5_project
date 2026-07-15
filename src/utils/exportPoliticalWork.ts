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

  // ── Góc trên bên TRÁI (cột 1-3): Sư đoàn 5 + tên đơn vị ──
  merge(ws, 1, 1, 1, 3, "SƯ ĐOÀN 5");
  cell(ws, 1, 1).font = { name: FONT, bold: true, size: 12 };
  cell(ws, 1, 1).alignment = { horizontal: "center" };

  merge(ws, 2, 1, 2, 3, (tenDonVi || "").toUpperCase());
  cell(ws, 2, 1).font = { name: FONT, bold: true, size: 12 };
  cell(ws, 2, 1).alignment = { horizontal: "center" };

  // ── Góc trên bên PHẢI (cột 4-6): quốc hiệu + tiêu ngữ + địa danh/ngày ──
  merge(ws, 1, 4, 1, 6, "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM");
  cell(ws, 1, 4).font = { name: FONT, bold: true, size: 12 };
  cell(ws, 1, 4).alignment = { horizontal: "center" };

  merge(ws, 2, 4, 2, 6, "Độc lập - Tự do - Hạnh phúc");
  cell(ws, 2, 4).font = { name: FONT, bold: true, italic: true, size: 12 };
  cell(ws, 2, 4).alignment = { horizontal: "center" };

  merge(ws, 3, 4, 3, 6, formatPlace(reportDate));
  cell(ws, 3, 4).font = { name: FONT, italic: true, size: 12 };
  cell(ws, 3, 4).alignment = { horizontal: "center" };

  let r = 5;

  // Tiêu đề
  merge(ws, r, 1, r, COL_COUNT, "BÁO CÁO CÔNG TÁC ĐẢNG - CÔNG TÁC CHÍNH TRỊ");
  cell(ws, r, 1).font = { name: FONT, bold: true, size: 15 };
  cell(ws, r, 1).alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(r).height = 24;
  r += 2;

  // 1. Quân số (không kẻ khung)
  sectionTitle(ws, r, "1. Quân số");
  r++;

  const tong = quanSo.siQuan + quanSo.qncn + quanSo.hsqBs;
  qsHeader(ws, r);
  r++;
  qsRow(ws, r, tong, quanSo.siQuan, quanSo.qncn, quanSo.hsqBs);
  r += 2;

  // 2. Tình hình hoạt động
  r = textBlock(ws, r, "2. Tình hình hoạt động", row.tinhHinh);
  // 3. Kết quả
  r = textBlock(ws, r, "3. Kết quả", row.ketQua);
  // 4. Vụ việc đột xuất (rỗng -> 2 hàng chấm)
  r = textBlock(ws, r, "4. Vụ việc đột xuất", row.noiDungDotXuat, true);
  // 5. Kiến nghị, đề xuất (rỗng -> 2 hàng chấm)
  r = textBlock(ws, r, "5. Kiến nghị, đề xuất", row.kienNghi, true);

  r++;

  // Hai cột ký: Trực ban nội vụ | Trực ban CTĐ-CTCT
  const noiVu = parseTrucNguoi(row.trucBanNoiVu);
  const ctd = parseTrucNguoi(row.trucBanCtDangCt);

  merge(ws, r, 1, r, 3, "TRỰC BAN NỘI VỤ");
  merge(ws, r, 4, r, 6, "TRỰC BAN CTĐ - CTCT");
  [1, 4].forEach((c) => {
    cell(ws, r, c).font = { name: FONT, bold: true, size: 12 };
    cell(ws, r, c).alignment = { horizontal: "center" };
  });
  r++;

  merge(ws, r, 1, r, 3, "(Ký, ghi rõ họ tên)");
  merge(ws, r, 4, r, 6, "(Ký, ghi rõ họ tên)");
  [1, 4].forEach((c) => {
    cell(ws, r, c).font = { name: FONT, italic: true, size: 11 };
    cell(ws, r, c).alignment = { horizontal: "center" };
  });
  r += 3;

  merge(ws, r, 1, r, 3, formatTruc(noiVu));
  merge(ws, r, 4, r, 6, formatTruc(ctd));
  [1, 4].forEach((c) => {
    cell(ws, r, c).font = { name: FONT, bold: true, size: 12 };
    cell(ws, r, c).alignment = { horizontal: "center" };
  });

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

// Quân số: KHÔNG kẻ khung
function qsHeader(ws: ExcelJS.Worksheet, r: number) {
  const labels = ["", "Tổng quân số", "Sĩ quan", "QNCN", "HSQ/BS", ""];
  labels.forEach((label, i) => {
    if (i === 0 || i === 5) return;
    const c = cell(ws, r, i + 1);
    c.value = label;
    c.font = { name: FONT, bold: true, size: 12 };
    c.alignment = { horizontal: "center", vertical: "middle" };
  });
}

function qsRow(
  ws: ExcelJS.Worksheet,
  r: number,
  tong: number,
  sq: number,
  qncn: number,
  hsqBs: number,
) {
  const values = [null, tong, sq, qncn, hsqBs, null];
  values.forEach((v, i) => {
    if (v === null) return;
    const c = cell(ws, r, i + 1);
    c.value = v;
    c.font = { name: FONT, size: 12 };
    c.alignment = { horizontal: "center", vertical: "middle" };
  });
}

function textBlock(
  ws: ExcelJS.Worksheet,
  r: number,
  title: string,
  content: string,
  dottedIfEmpty = false,
): number {
  sectionTitle(ws, r, title);
  r++;

  const hasContent = Boolean(content && content.trim());

  // Mục rỗng + cần dấu chấm -> 2 hàng chấm kéo dài hết ô
  if (!hasContent && dottedIfEmpty) {
    for (let i = 0; i < 2; i++) {
      merge(ws, r, 1, r, COL_COUNT, dottedLine());
      cell(ws, r, 1).font = { name: FONT, size: 12 };
      cell(ws, r, 1).alignment = { horizontal: "left", vertical: "middle" };
      ws.getRow(r).height = 20;
      r++;
    }
    return r + 1;
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

// Chuỗi dấu chấm dài hơn bề rộng ô để tràn kín, không chừa khoảng trắng bên phải
function dottedLine(): string {
  return ".".repeat(Math.round(TOTAL_CHAR_WIDTH * 2));
}

// Ước lượng số dòng khi wrap trong vùng merge 6 cột.
// Width cột của ExcelJS ứng với nhiều ký tự hơn con số width (font Times 12
// hẹp hơn ký tự "0" chuẩn), nên nhân hệ số ~1.25 để không đếm dư dòng.
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

function formatTruc(t: {
  capBac: string;
  hoTen: string;
  chucVu: string;
}): string {
  return [t.capBac, t.hoTen, t.chucVu].filter(Boolean).join(" - ");
}
