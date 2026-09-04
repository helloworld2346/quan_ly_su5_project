import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { ReportRow } from "../types/dailyReport";
import {
  reportRowToExportCells,
  totalsToExportCells,
} from "../pages/DailyReport/utils/dailyTroopReportHelpers";
import type { DisplayTotals } from "../pages/DailyReport/utils/dailyTroopReportHelpers";

type TrucNguoi = {
  tenNguoitruc?: string;
  capbacNguoitruc?: string;
  chucvuNguoitruc?: string;
  sodienthoai?: string;
};

type ExportArgs = {
  displayRows: ReportRow[];
  displayTotals: DisplayTotals;
  reportDate: string;
  matkhau?: string;
  trucChiHuy?: TrucNguoi | null;
  trucBanTacChien?: TrucNguoi | null;
  donViName?: string;
  parentUnitName?: string;
};

const COLUMN_COUNT = 18;
const FONT = "Times New Roman";

const PROTECT_PASSWORD = "su5@2026";

const COLOR = {
  WHITE: "FFFFFFFF",
  TITLE_FILL: "FF1F4E78",
  HEADER_FILL: "FF2E75B6",
  ZEBRA_FILL: "FFEAF1FB",
  TOTAL_FILL: "FFFFF2CC",
} as const;

// Các đơn vị cần viết IN HOA + tên hiển thị mong muốn khi xuất
// Khóa là tên đã chuẩn hóa (lowercase, bỏ khoảng trắng và gạch nối)
const UPPERCASE_UNIT_LABELS: Record<string, string> = {
  ptm: "PTM",
  pct: "PCT",
  phckt: "PHC-KT",
};

export async function exportTroopReportToExcel({
  displayRows,
  displayTotals,
  reportDate,
  matkhau,
  trucChiHuy,
  trucBanTacChien,
  donViName,
  parentUnitName,
}: ExportArgs): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Thống kê quân số");

  ws.pageSetup = {
    orientation: "landscape",
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    },
  };

  const rightStart = 12;

  setMerged(
    ws,
    1,
    rightStart,
    1,
    COLUMN_COUNT,
    "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
  );
  ws.getCell(1, rightStart).font = { name: FONT, bold: true, size: 14 };
  ws.getCell(1, rightStart).alignment = { horizontal: "center" };

  setMerged(ws, 2, rightStart, 2, COLUMN_COUNT, "Độc lập - Tự do - Hạnh phúc");
  ws.getCell(2, rightStart).font = {
    name: FONT,
    bold: true,
    size: 14,
    underline: true,
  };
  ws.getCell(2, rightStart).alignment = { horizontal: "center" };

  // ── Góc trên bên TRÁI (merge cột 1-4): đơn vị cha + đơn vị, tự nới rộng theo tên ──
  const leftTop = (parentUnitName ?? "Quân khu 7").toUpperCase();
  const leftBottom = (donViName ?? "Sư đoàn 5").toUpperCase();

  setMerged(ws, 1, 1, 1, 4, leftTop);
  ws.getCell(1, 1).font = { name: FONT, bold: true, size: 14 };
  ws.getCell(1, 1).alignment = { horizontal: "center", vertical: "middle" };

  setMerged(ws, 2, 1, 2, 4, leftBottom);
  ws.getCell(2, 1).font = { name: FONT, bold: true, size: 14, underline: true };
  ws.getCell(2, 1).alignment = { horizontal: "center", vertical: "middle" };

  setMerged(ws, 3, rightStart, 3, COLUMN_COUNT, formatPlace(reportDate));
  ws.getCell(3, rightStart).font = { name: FONT, italic: true, size: 14 };
  ws.getCell(3, rightStart).alignment = { horizontal: "center" };

  ws.getRow(4).height = 10;

  setMerged(ws, 5, 1, 5, COLUMN_COUNT, `BÁO CÁO QUÂN SỐ`);
  ws.getCell(5, 1).font = {
    name: FONT,
    bold: true,
    size: 16,
  };
  ws.getCell(5, 1).alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(5).height = 26;

  ws.getRow(6).height = 6;

  const r1 = 7;
  const r2 = 8;
  const r3 = 9;

  setMerged(ws, r1, 1, r3, 1, "Đơn vị");
  setMerged(ws, r1, 2, r3, 2, "Tổng quân số");
  setMerged(ws, r1, 3, r3, 3, "Hiện diện");
  setMerged(ws, r1, 4, r3, 4, "Tổng vắng");
  setMerged(ws, r1, 5, r1, 18, "Quân số vắng");

  setMerged(ws, r2, 5, r2, 6, "Hội thao");
  setMerged(ws, r2, 7, r2, 8, "Xây dựng");
  setMerged(ws, r2, 9, r3, 9, "Chờ hưu");
  setMerged(ws, r2, 10, r3, 10, "Nghỉ tranh thủ");
  setMerged(ws, r2, 11, r3, 11, "Phép");
  setMerged(ws, r2, 12, r2, 13, "Viện");
  setMerged(ws, r2, 14, r2, 15, "Công tác");
  setMerged(ws, r2, 16, r2, 17, "Học");
  setMerged(ws, r2, 18, r3, 18, "Lý do khác");

  ws.getCell(r3, 5).value = "Ngoài Sư đoàn";
  ws.getCell(r3, 6).value = "Trung đoàn, Sư đoàn";
  ws.getCell(r3, 7).value = "Ngoài Sư đoàn";
  ws.getCell(r3, 8).value = "Trung đoàn, Sư đoàn";
  ws.getCell(r3, 12).value = "Ngoài Sư đoàn";
  ws.getCell(r3, 13).value = "Trung đoàn, Sư đoàn";
  ws.getCell(r3, 14).value = "Ngoài Sư đoàn";
  ws.getCell(r3, 15).value = "Sư đoàn";
  ws.getCell(r3, 16).value = "SQ";
  ws.getCell(r3, 17).value = "CS";

  styleHeaderRange(ws, r1, r3);

  let rowIdx = r3 + 1;
  displayRows.forEach((row, i) => {
    const zebra = i % 2 === 0 ? COLOR.WHITE : COLOR.ZEBRA_FILL;
    writeDataRow(ws, rowIdx, reportRowToExportCells(row), false, zebra);
    rowIdx++;
  });

  writeDataRow(
    ws,
    rowIdx,
    totalsToExportCells(displayTotals),
    true,
    COLOR.TOTAL_FILL,
  );

  rowIdx++;

  ws.getRow(rowIdx).height = 12;
  rowIdx++;

  // Cuối file: MẬT KHẨU / Trực chỉ huy / Trực ban tác chiến
  const passwordRow = rowIdx;
  setMerged(
    ws,
    passwordRow,
    1,
    passwordRow,
    COLUMN_COUNT,
    `MẬT KHẨU: ${(matkhau ?? "").toUpperCase()}`,
  );
  ws.getCell(passwordRow, 1).font = { name: FONT, bold: true, size: 18 };
  ws.getCell(passwordRow, 1).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  ws.getRow(passwordRow).height = 24;

  const chiHuyRow = passwordRow + 1;
  setMerged(
    ws,
    chiHuyRow,
    1,
    chiHuyRow,
    COLUMN_COUNT,
    `Trực chỉ huy: ${formatTruc(trucChiHuy)}`,
  );
  ws.getCell(chiHuyRow, 1).font = { name: FONT, size: 14 };
  ws.getCell(chiHuyRow, 1).alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  const tacChienRow = passwordRow + 2;
  setMerged(
    ws,
    tacChienRow,
    1,
    tacChienRow,
    COLUMN_COUNT,
    `Trực ban tác chiến: ${formatTruc(trucBanTacChien)}`,
  );
  ws.getCell(tacChienRow, 1).font = { name: FONT, size: 14 };
  ws.getCell(tacChienRow, 1).alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  // Cột 2-18 giữ 12 để bảng số liệu gọn; cột 1 tự nới theo tên đơn vị dài nhất.
  // Khối tên góc trái merge cột 1-4 => phần dư ngoài (cột 2-4 = 36) do cột 1 gánh.
  const longestLeftName = Math.max(leftTop.length, leftBottom.length);
  const neededLeftWidth = longestLeftName * 1.3;
  const col1Width = Math.max(12, neededLeftWidth - 36);
  ws.getColumn(1).width = col1Width;
  for (let c = 2; c <= COLUMN_COUNT; c++) ws.getColumn(c).width = 12;

  await ws.protect(PROTECT_PASSWORD, {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    insertRows: false,
    deleteRows: false,
    sort: false,
  });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `ThongKeQuanSo_${reportDate}.xlsx`,
  );
}

function setMerged(
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

function styleHeaderRange(ws: ExcelJS.Worksheet, from: number, to: number) {
  for (let r = from; r <= to; r++) {
    for (let c = 1; c <= COLUMN_COUNT; c++) {
      const cell = ws.getCell(r, c);
      cell.font = {
        name: FONT,
        bold: true,
        size: 14,
        color: { argb: COLOR.WHITE },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = thinBorder();
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR.HEADER_FILL },
      };
    }
  }
}

function writeDataRow(
  ws: ExcelJS.Worksheet,
  rowIdx: number,
  values: (string | number)[],
  bold = false,
  fillArgb?: string,
) {
  values.forEach((v, i) => {
    const cell = ws.getCell(rowIdx, i + 1);
    if (typeof v === "number") {
      cell.value = formatThousands(v);
    } else if (i === 0) {
      // Cột "Đơn vị": in hoa + đổi tên hiển thị nếu là ptm/pct/phc-kt
      cell.value = formatUnitName(v);
    } else {
      cell.value = v;
    }
    cell.border = thinBorder();
    cell.font = { name: FONT, bold, size: 14 };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    if (fillArgb) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillArgb },
      };
    }
  });
}

function thinBorder(): ExcelJS.Borders {
  const s = { style: "thin" as const };
  return { top: s, left: s, bottom: s, right: s } as ExcelJS.Borders;
}

function formatPlace(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y
    ? `Tây Ninh, ngày ${d} tháng ${m} năm ${y}`
    : "Tây Ninh, ngày ..... tháng ..... năm .....";
}

function formatTruc(t?: TrucNguoi | null): string {
  if (!t) return "";
  return [t.capbacNguoitruc, t.tenNguoitruc, t.chucvuNguoitruc]
    .filter(Boolean)
    .join(" - ");
}

function formatThousands(n: number): string {
  return n.toLocaleString("de-DE");
}

// In hoa toàn bộ tên đơn vị, trả về tên hiển thị mong muốn nếu thuộc nhóm ptm / pct / phc-kt
function formatUnitName(name: string): string {
  const normalized = name.toLowerCase().replace(/[\s-]/g, "");
  for (const key of Object.keys(UPPERCASE_UNIT_LABELS)) {
    if (normalized.includes(key)) {
      return UPPERCASE_UNIT_LABELS[key];
    }
  }
  return name;
}
