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

export async function exportTroopReportToExcel({
  displayRows,
  displayTotals,
  reportDate,
  matkhau,
  trucChiHuy,
  trucBanTacChien,
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
    italic: true,
    size: 14,
  };
  ws.getCell(2, rightStart).alignment = { horizontal: "center" };

  setMerged(ws, 3, rightStart, 3, COLUMN_COUNT, formatPlace(reportDate));
  ws.getCell(3, rightStart).font = { name: FONT, italic: true, size: 14 };
  ws.getCell(3, rightStart).alignment = { horizontal: "center" };

  setMerged(
    ws,
    4,
    1,
    4,
    COLUMN_COUNT,
    `MẬT KHẨU: ${(matkhau ?? "").toUpperCase()}`,
  );
  ws.getCell(4, 1).font = { name: FONT, bold: true, size: 18 };
  ws.getCell(4, 1).alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(4).height = 24;

  setMerged(
    ws,
    5,
    1,
    5,
    COLUMN_COUNT,
    `Trực chỉ huy: ${formatTruc(trucChiHuy)}`,
  );
  ws.getCell(5, 1).font = { name: FONT, size: 14 };
  ws.getCell(5, 1).alignment = { horizontal: "center", vertical: "middle" };

  setMerged(
    ws,
    6,
    1,
    6,
    COLUMN_COUNT,
    `Trực ban tác chiến: ${formatTruc(trucBanTacChien)}`,
  );
  ws.getCell(6, 1).font = { name: FONT, size: 14 };
  ws.getCell(6, 1).alignment = { horizontal: "center", vertical: "middle" };

  setMerged(
    ws,
    7,
    1,
    7,
    COLUMN_COUNT,
    `BÁO CÁO THỐNG KÊ QUÂN SỐ (Ngày ${formatDate(reportDate)})`,
  );
  ws.getCell(7, 1).font = {
    name: FONT,
    bold: true,
    size: 16,
    color: { argb: COLOR.WHITE },
  };
  ws.getCell(7, 1).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(7, 1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR.TITLE_FILL },
  };
  ws.getRow(7).height = 26;

  const r1 = 8;
  const r2 = 9;
  const r3 = 10;

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

const EXPLAIN_LINES = 4;
const explainStartRow = rowIdx;

ws.getCell(rowIdx, 1).value = "Giải trình\nquân số\nthay đổi\ntrong ngày";
ws.getCell(explainStartRow, 1).font = { name: FONT, bold: true, size: 12 };
ws.getCell(explainStartRow, 1).alignment = {
  horizontal: "center",
  vertical: "middle",
  wrapText: true,
};
setMerged(
  ws,
  explainStartRow,
  1,
  explainStartRow + EXPLAIN_LINES - 1,
  1,
  "Giải trình quân số thay đổi trong ngày",
);

for (let line = 0; line < EXPLAIN_LINES; line++) {
  const lineRow = explainStartRow + line;
  setMerged(ws, lineRow, 2, lineRow, COLUMN_COUNT, "");
  for (let c = 2; c <= COLUMN_COUNT; c++) {
    ws.getCell(lineRow, c).border = {
      bottom: { style: "dotted" },
    };
  }
  ws.getRow(lineRow).height = 18;
}

rowIdx = explainStartRow + EXPLAIN_LINES;

  ws.getColumn(1).width = 12;
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
    cell.value = v;
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

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
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
