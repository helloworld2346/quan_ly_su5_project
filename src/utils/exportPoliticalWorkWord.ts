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
} from "docx";
import { saveAs } from "file-saver";
import type { PoliticalWorkRow } from "../types/politicalWork";
import { parseTrucNguoi } from "../pages/PoliticalWorkReport/utils/trucNguoi";

type QuanSo = { siQuan: number; qncn: number; hsqBs: number };

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

// Viền cho từng ô (chỉ 4 cạnh)
const noCellBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// Viền cho bảng (thêm insideHorizontal/insideVertical để bỏ nét đứt bên trong)
const noTableBorder = {
  ...noCellBorder,
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// Lưới 18 cột giống mẫu dailyReport (FIXED + width 100%), mỗi cột bề rộng bằng nhau.
// Khối tên đơn vị span 4 cột đầu (sát mép trái), spacer 3 cột giữa,
// quốc hiệu span 11 cột cuối (sát mép phải). Tổng = 18.
const HEADER_COL_COUNT = 18;
const HEADER_COL_WIDTHS = Array<number>(HEADER_COL_COUNT).fill(500);
const HEADER_SPAN_LEFT = 4;
const HEADER_SPAN_MID = 3;
const HEADER_SPAN_RIGHT = 11;

export async function exportPoliticalWorkToWord({
  row,
  reportDate,
  tenDonVi,
  quanSo,
  donViName,
  parentUnitName,
  hideNoiVu = false,
}: ExportArgs): Promise<void> {
  const leftTop = (parentUnitName ?? "Quân khu 7").toUpperCase();
  const leftBottom = (donViName ?? tenDonVi ?? "Sư đoàn 5").toUpperCase();

  const noiVu = parseTrucNguoi(row.trucBanNoiVu);
  const ctd = parseTrucNguoi(row.trucBanCtDangCt);
  const tong = quanSo.siQuan + quanSo.qncn + quanSo.hsqBs;

  // ── Header: lưới 18 cột không viền, span 4/3/11 giống dailyReport ──
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: HEADER_COL_WIDTHS,
    borders: noTableBorder,
    rows: [
      new TableRow({
        children: [
          // Trái: tên đơn vị cha + đơn vị, hai dòng căn giữa theo nhau, sát mép trái
          new TableCell({
            columnSpan: HEADER_SPAN_LEFT,
            borders: noCellBorder,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              center(bold(leftTop)),
              center(bold(leftBottom, { underline: true })),
            ],
          }),
          // Giữa: spacer trống
          new TableCell({
            columnSpan: HEADER_SPAN_MID,
            borders: noCellBorder,
            children: [empty()],
          }),
          // Phải: quốc hiệu + tiêu ngữ + địa danh/ngày
          new TableCell({
            columnSpan: HEADER_SPAN_RIGHT,
            borders: noCellBorder,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              center(bold("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM")),
              center(bold("Độc lập - Tự do - Hạnh phúc", { underline: true })),
              center(
                new TextRun({
                  text: formatPlace(reportDate),
                  font: FONT,
                  size: 24,
                  italics: true,
                }),
              ),
            ],
          }),
        ],
      }),
    ],
  });

  const children: (Paragraph | Table)[] = [
    headerTable,
    empty(),
    // Tiêu đề 2 dòng
    center(bold("BÁO CÁO", { size: 30 })),
    center(bold("HOẠT ĐỘNG CÔNG TÁC ĐẢNG - CÔNG TÁC CHÍNH TRỊ", { size: 30 })),
    empty(),
    // 1. Quân số
    sectionTitle("1. Quân số"),
    qsLine("Tổng quân số", tong),
    qsLine("Sĩ quan", quanSo.siQuan),
    qsLine("QNCN", quanSo.qncn),
    qsLine("HSQ/BS", quanSo.hsqBs),
    empty(),

    // 2-5
    ...textBlock("2. Tình hình hoạt động", row.tinhHinh),
    empty(),

    ...textBlock("3. Kết quả", row.ketQua),
    empty(),

    ...textBlock("4. Vụ việc đột xuất", row.noiDungDotXuat, true),
    empty(),

    ...textBlock("5. Kiến nghị, đề xuất", row.kienNghi, true),
    empty(),
  ];

  // ── Khối ký ──
  if (hideNoiVu) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noTableBorder,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: noCellBorder,
                children: [empty()],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: noCellBorder,
                children: signCell("TRỰC BAN CTĐ - CTCT", ctd),
              }),
            ],
          }),
        ],
      }),
    );
  } else {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noTableBorder,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: noCellBorder,
                children: signCell("TRỰC BAN NỘI VỤ", noiVu),
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: noCellBorder,
                children: signCell("TRỰC BAN CTĐ - CTCT", ctd),
              }),
            ],
          }),
        ],
      }),
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `BaoCaoCTD_CTCT_${reportDate}.docx`);
}

// ── Helpers ──
function bold(
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

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, bold: true, size: 26 })],
  });
}

function qsLine(label: string, value: number): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, font: FONT, bold: true, size: 24 }),
      new TextRun({
        text: value.toLocaleString("de-DE"),
        font: FONT,
        size: 24,
      }),
    ],
  });
}

function textBlock(
  title: string,
  content: string,
  emptyAsKhong = false,
): Paragraph[] {
  const hasContent = Boolean(content && content.trim());
  const body = hasContent ? content : emptyAsKhong ? "Không" : "";
  return [
    sectionTitle(title),
    new Paragraph({
      children: [new TextRun({ text: body, font: FONT, size: 24 })],
    }),
  ];
}

function signCell(
  role: string,
  t: { capBac: string; hoTen: string; chucVu: string },
): Paragraph[] {
  return [
    center(bold(role)),
    center(new TextRun({ text: t.chucVu, font: FONT, size: 24 })),
    empty(),
    empty(),
    empty(),
    center(bold([t.capBac, t.hoTen].filter(Boolean).join(" "))),
  ];
}

function formatPlace(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y
    ? `Tây Ninh, ngày ${d} tháng ${m} năm ${y}`
    : "Tây Ninh, ngày ..... tháng ..... năm .....";
}
