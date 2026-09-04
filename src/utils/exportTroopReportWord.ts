import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
  TableLayoutType,
  HeightRule,
} from "docx";
import JSZip from "jszip";
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

const FONT = "Times New Roman";
const COLUMN_COUNT = 18;

const HEADER_FILL = "2E75B6";
const ZEBRA_FILL = "EAF1FB";
const TOTAL_FILL = "FFF2CC";

const UPPERCASE_UNIT_LABELS: Record<string, string> = {
  ptm: "PTM",
  pct: "PCT",
  phckt: "PHC-KT",
};

// Chiều rộng cột (twips): cột 1 rộng cho tên đơn vị, còn lại chia đều.
const COL1_WIDTH = 1400;
const COL_WIDTH = 738;
const COLUMN_WIDTHS = [
  COL1_WIDTH,
  ...Array.from({ length: COLUMN_COUNT - 1 }, () => COL_WIDTH),
];

// Chiều cao tối thiểu cho mỗi dòng trong bảng số liệu (twips)
const ROW_HEIGHT = 220;

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
// Viền ô: không nét
const noCellBorder = {
  top: NONE,
  bottom: NONE,
  left: NONE,
  right: NONE,
};
// Viền bảng: bỏ cả nét trong (insideHorizontal/insideVertical) để hết nét đứt
const noTableBorder = {
  ...noCellBorder,
  insideHorizontal: NONE,
  insideVertical: NONE,
};

export async function exportTroopReportToWord({
  displayRows,
  displayTotals,
  reportDate,
  matkhau,
  trucChiHuy,
  trucBanTacChien,
  donViName,
  parentUnitName,
}: ExportArgs): Promise<void> {
  const leftTop = (parentUnitName ?? "Quân khu 7").toUpperCase();
  const leftBottom = (donViName ?? "Sư đoàn 5").toUpperCase();

  // ── Header quốc hiệu / đơn vị: dùng CHUNG lưới cột với bảng số liệu ──
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: COLUMN_WIDTHS, // trùng khít mép trái/phải với dataTable
    borders: noTableBorder,
    rows: [
      new TableRow({
        children: [
          // Trái: 2 cột đầu (Đơn vị + Tổng quân số) — đủ rộng để "QUÂN KHU 7" không bị xuống dòng,
          // vẫn căn giữa 2 dòng theo nhau và gần mép trái
          new TableCell({
            columnSpan: 2,
            borders: noCellBorder,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              center(boldRun(leftTop)),
              center(boldRun(leftBottom, { underline: true })),
            ],
          }),
          // Giữa: 9 cột trống làm khoảng cách
          new TableCell({
            columnSpan: 9,
            borders: noCellBorder,
            children: [empty()],
          }),
          // Phải: 7 cột cuối — quốc hiệu, giữ nguyên
          new TableCell({
            columnSpan: 7,
            borders: noCellBorder,
            children: [
              center(boldRun("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM")),
              center(
                boldRun("Độc lập - Tự do - Hạnh phúc", { underline: true }),
              ),
              center(
                new TextRun({
                  text: formatPlace(reportDate),
                  font: FONT,
                  italics: true,
                  size: 24,
                }),
              ),
            ],
          }),
        ],
      }),
    ],
  });

  // ── Header bảng số liệu: 3 tầng gộp ô như Excel ──
  const headerRow1 = new TableRow({
    tableHeader: true,
    height: { value: ROW_HEIGHT, rule: HeightRule.ATLEAST },
    children: [
      headerCell("Đơn vị", { rowSpan: 3 }),
      headerCell("Tổng quân số", { rowSpan: 3 }),
      headerCell("Hiện diện", { rowSpan: 3 }),
      headerCell("Tổng vắng", { rowSpan: 3 }),
      headerCell("Quân số vắng", { columnSpan: 14 }),
    ],
  });

  const headerRow2 = new TableRow({
    tableHeader: true,
    height: { value: ROW_HEIGHT, rule: HeightRule.ATLEAST },
    children: [
      headerCell("Hội thao", { columnSpan: 2 }),
      headerCell("Xây dựng", { columnSpan: 2 }),
      headerCell("Chờ hưu", { rowSpan: 2 }),
      headerCell("Nghỉ tranh thủ", { rowSpan: 2 }),
      headerCell("Phép", { rowSpan: 2 }),
      headerCell("Viện", { columnSpan: 2 }),
      headerCell("Công tác", { columnSpan: 2 }),
      headerCell("Học", { columnSpan: 2 }),
      headerCell("Lý do khác", { rowSpan: 2 }),
    ],
  });

  const headerRow3 = new TableRow({
    tableHeader: true,
    height: { value: ROW_HEIGHT, rule: HeightRule.ATLEAST },
    children: [
      headerCell("Ngoài Sư đoàn"), // Hội thao
      headerCell("Trung đoàn, Sư đoàn"),
      headerCell("Ngoài Sư đoàn"), // Xây dựng
      headerCell("Trung đoàn, Sư đoàn"),
      headerCell("Ngoài Sư đoàn"), // Viện
      headerCell("Trung đoàn, Sư đoàn"),
      headerCell("Ngoài Sư đoàn"), // Công tác
      headerCell("Sư đoàn"),
      headerCell("SQ"), // Học
      headerCell("CS"),
    ],
  });

  const bodyRows = displayRows.map((row, i) =>
    dataRow(
      reportRowToExportCells(row),
      false,
      i % 2 === 1 ? ZEBRA_FILL : undefined,
    ),
  );
  const totalRow = dataRow(
    totalsToExportCells(displayTotals),
    true,
    TOTAL_FILL,
  );

  const dataTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: COLUMN_WIDTHS,
    rows: [headerRow1, headerRow2, headerRow3, ...bodyRows, totalRow],
  });

  const children: (Paragraph | Table)[] = [
    headerTable,
    empty(),
    center(boldRun("BÁO CÁO QUÂN SỐ", { size: 32 })),
    empty(),
    dataTable,
    empty(),
    center(boldRun(`MẬT KHẨU: ${(matkhau ?? "").toUpperCase()}`, { size: 36 })),
    center(
      new TextRun({
        text: `Trực chỉ huy: ${formatTruc(trucChiHuy)}`,
        font: FONT,
        size: 24,
      }),
    ),
    center(
      new TextRun({
        text: `Trực ban tác chiến: ${formatTruc(trucBanTacChien)}`,
        font: FONT,
        size: 24,
      }),
    ),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { size: { orientation: "landscape" as never } },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const readonlyBlob = await applyReadonly(blob);
  saveAs(readonlyBlob, `ThongKeQuanSo_${reportDate}.docx`);
}

// Chèn khóa "chỉ đọc" (không mật khẩu) vào word/settings.xml của file .docx.
// Mở bằng Word sẽ ở chế độ Restrict Editing (read only); bấm "Stop Protection"
// để mở khóa mà KHÔNG cần nhập mật khẩu.
async function applyReadonly(blob: Blob): Promise<Blob> {
  const zip = await JSZip.loadAsync(blob);
  const settingsPath = "word/settings.xml";
  const protection =
    '<w:documentProtection w:edit="readOnly" w:enforcement="1"/>';

  const file = zip.file(settingsPath);
  if (file) {
    let xml = await file.async("string");
    if (!xml.includes("w:documentProtection")) {
      // chèn ngay sau thẻ mở <w:settings ...>
      xml = xml.replace(/(<w:settings\b[^>]*>)/, `$1${protection}`);
    }
    zip.file(settingsPath, xml);
  } else {
    // hiếm khi thiếu; tạo settings.xml tối thiểu có documentProtection
    const xml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      protection +
      "</w:settings>";
    zip.file(settingsPath, xml);
  }

  return zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

function headerCell(
  text: string,
  opts: { rowSpan?: number; columnSpan?: number } = {},
): TableCell {
  return new TableCell({
    rowSpan: opts.rowSpan,
    columnSpan: opts.columnSpan,
    shading: { fill: HEADER_FILL },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            font: FONT,
            bold: true,
            size: 16,
            color: "FFFFFF",
          }),
        ],
      }),
    ],
  });
}

function dataRow(
  values: (string | number)[],
  boldRow: boolean,
  fill?: string,
): TableRow {
  return new TableRow({
    height: { value: ROW_HEIGHT, rule: HeightRule.ATLEAST },
    children: values.map((v, i) => {
      let text: string;
      if (typeof v === "number") text = v.toLocaleString("de-DE");
      else if (i === 0) text = formatUnitName(v);
      else text = v;
      return new TableCell({
        shading: fill ? { fill } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          center(new TextRun({ text, font: FONT, bold: boldRow, size: 16 })),
        ],
      });
    }),
  });
}

function boldRun(
  text: string,
  opts: { underline?: boolean; size?: number } = {},
): TextRun {
  return new TextRun({
    text,
    font: FONT,
    bold: true,
    size: opts.size ?? 24,
    underline: opts.underline ? {} : undefined,
  });
}

function center(run: TextRun): Paragraph {
  return new Paragraph({ alignment: AlignmentType.CENTER, children: [run] });
}

function empty(): Paragraph {
  return new Paragraph({ children: [] });
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

function formatUnitName(name: string): string {
  const normalized = name.toLowerCase().replace(/[\s-]/g, "");
  for (const key of Object.keys(UPPERCASE_UNIT_LABELS)) {
    if (normalized.includes(key)) return UPPERCASE_UNIT_LABELS[key];
  }
  return name;
}
