import { useState, useMemo, useCallback, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomSelect from "../../../components/ui/CustomSelect/CustomSelect";
import styles from "../CreateReportModal.module.css";
import type { AbsentRow, VangChiTiet } from "../../../types/dailyReport";
import { LY_DO_OPTIONS, CAP_BAC_OPTIONS } from "../../../utils/reportUtils";
import SearchBar from "../../../components/ui/SearchBar/SearchBar";  


const PAGE_SIZE = 20;

type Props = {
  rows: AbsentRow[];
  onUpdate: (id: string, field: keyof AbsentRow, value: string) => void;
  onRemove: (id: string) => void;
  capBacOptions?: string[];
};

type RowProps = {
  row: AbsentRow;
  index: number;
  rankOptions: { value: string; label: string }[];
  onUpdate: (id: string, field: keyof AbsentRow, value: string) => void;
  onRemove: (id: string) => void;
};

const AbsentRowItem = memo(
  function AbsentRowItem({
    row,
    index,
    rankOptions,
    onUpdate,
    onRemove,
  }: RowProps) {
    return (
      <tr>
        <td className={styles.textCenter}>{index}</td>
        <td>
          <input
            type="text"
            className={styles.tableInput}
            value={row.hoTen}
            onChange={(e) => onUpdate(row.id, "hoTen", e.target.value)}
            placeholder="Nhập họ và tên..."
            required
          />
        </td>
        <td>
          <CustomSelect
            options={rankOptions}
            value={row.capBac}
            onChange={(val) => onUpdate(row.id, "capBac", val)}
            variant="table"
            placeholder="-- Chọn cấp bậc --"
          />
        </td>
        <td>
          <input
            type="text"
            className={styles.tableInput}
            value={row.chucVu}
            onChange={(e) => onUpdate(row.id, "chucVu", e.target.value)}
            placeholder="Nhập chức vụ..."
          />
        </td>
        <td>
          <CustomSelect
            options={LY_DO_OPTIONS}
            value={row.lyDoVang}
            onChange={(val) =>
              onUpdate(row.id, "lyDoVang", val as keyof VangChiTiet)
            }
            variant="table"
            placeholder="-- Chọn lý do vắng --"
          />
        </td>
        <td>
          <input
            type="text"
            className={styles.tableInput}
            value={row.ghiChu}
            onChange={(e) => onUpdate(row.id, "ghiChu", e.target.value)}
            placeholder="Nơi đi công tác, bệnh xá, học viện..."
          />
        </td>
        <td className={styles.textCenter}>
          <button
            type="button"
            className={styles.btnDeleteRow}
            onClick={() => onRemove(row.id)}
            title="Xóa dòng"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    );
  },
  (prev, next) =>
    prev.row === next.row &&
    prev.index === next.index &&
    prev.rankOptions === next.rankOptions &&
    prev.onUpdate === next.onUpdate &&
    prev.onRemove === next.onRemove,
);

export default function AbsentRowsTable({
  rows,
  onUpdate,
  onRemove,
  capBacOptions,
}: Props) {
  const rankOptions = useMemo(() => {
    const base =
      capBacOptions && capBacOptions.length > 0
        ? capBacOptions
        : CAP_BAC_OPTIONS;
    return base.map((cb) => ({ value: cb, label: cb }));
  }, [capBacOptions]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Lọc theo họ tên / cấp bậc / chức vụ / ghi chú / đơn vị
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.hoTen, r.capBac, r.chucVu, r.ghiChu, r.tenDonVi ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  // Reset về trang 1 khi từ khoá thay đổi
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);
  if (safePage !== page) {
    setPage(safePage);
  }

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageRows = useMemo(
    () => filteredRows.slice(startIndex, startIndex + PAGE_SIZE),
    [filteredRows, startIndex],
  );

  const goPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(
    () => setPage((p) => Math.min(totalPages, p + 1)),
    [totalPages],
  );

  if (rows.length === 0) {
    return (
      <div className={styles.emptyState}>
        Không có quân nhân vắng mặt. Bấm nút "+ Thêm quân nhân vắng" để bắt đầu
        nhập liệu.
      </div>
    );
  }

  return (
    <>
      <div className={styles.searchBox}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Tìm theo họ tên, cấp bậc, chức vụ, đơn vị..."
          className={styles.absentSearch}
        />
      </div>

      {filteredRows.length === 0 ? (
        <div className={styles.emptyState}>
          Không tìm thấy quân nhân khớp với "{query}".
        </div>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "60px" }} className={styles.textCenter}>
                  STT
                </th>
                <th style={{ minWidth: "200px" }}>Họ và tên</th>
                <th style={{ width: "150px" }}>Cấp bậc</th>
                <th style={{ width: "180px" }}>Chức vụ</th>
                <th style={{ width: "240px" }}>Lý do vắng</th>
                <th style={{ minWidth: "200px" }}>Ghi chú chi tiết</th>
                <th style={{ width: "60px" }} className={styles.textCenter}>
                  Xóa
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <AbsentRowItem
                  key={row.id}
                  row={row}
                  index={startIndex + i + 1}
                  rankOptions={rankOptions}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={goPrev}
                disabled={safePage <= 1}
              >
                ← Trước
              </button>
              <span className={styles.pageInfo}>
                Trang {safePage}/{totalPages} · {filteredRows.length} quân nhân
                {query ? ` (lọc từ ${rows.length})` : ""}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={goNext}
                disabled={safePage >= totalPages}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
