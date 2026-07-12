import { useState, useEffect, useMemo } from "react";

import styles from "./AuditLog.module.css";
import { auditLogService } from "../../services/auditLog/auditLogService";
import type { NhatKy, NhatKySearchPayload } from "../../types/auditLog";
import { useToast } from "../../context/useToast";
import { useMinLoading } from "../../hooks/useMinLoading";

import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import Pagination from "../../components/ui/Pagination/Pagination";
import { formatDatePart, formatTimePart } from "../../utils/date";

const PAGE_SIZE = 10;

const HANH_DONG_OPTIONS = [
  { value: "", label: "Tất cả hành động" },
  { value: "LOGIN", label: "Đăng nhập" },
  { value: "LOGOUT", label: "Đăng xuất" },
  { value: "CREATE", label: "Tạo mới" },
  { value: "UPDATE", label: "Cập nhật" },
  { value: "DELETE", label: "Xóa" },
  { value: "APPROVE", label: "Phê duyệt" },
  { value: "REJECT", label: "Từ chối" },
  { value: "LOCK", label: "Khóa" },
  { value: "UNLOCK", label: "Mở khóa" },
  { value: "UPDATE_FUNCTION", label: "Cập nhật chức năng" },
];

const TRANG_THAI_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "THANH_CONG", label: "Thành công" },
  { value: "THAT_BAI", label: "Thất bại" },
];

const HANH_DONG_LABEL: Record<string, string> = {
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  APPROVE: "Phê duyệt",
  REJECT: "Từ chối",
  LOCK: "Khóa",
  UNLOCK: "Mở khóa",
  UPDATE_FUNCTION: "Cập nhật chức năng",
};

const HANH_DONG_BADGE_CLASS: Record<string, string> = {
  LOGIN: styles.badgeLogin,
  LOGOUT: styles.badgeLogout,
  CREATE: styles.badgeCreate,
  UPDATE: styles.badgeUpdate,
  DELETE: styles.badgeDelete,
  APPROVE: styles.badgeApprove,
  REJECT: styles.badgeReject,
  LOCK: styles.badgeLock,
  UNLOCK: styles.badgeUnlock,
  UPDATE_FUNCTION: styles.badgeUpdateFunction,
};

const TRANG_THAI_LABEL: Record<string, string> = {
  THANH_CONG: "Thành công",
  THAT_BAI: "Thất bại",
};

function getTaiKhoanText(taiKhoan: NhatKy["taiKhoan"]): string {
  if (!taiKhoan) return "—";
  if (typeof taiKhoan === "string") return taiKhoan;
  return (
    taiKhoan.tenTaiKhoan ||
    taiKhoan.tenDangNhap ||
    taiKhoan.donVi?.tenDonvi ||
    "—"
  );
}

export default function AuditLog() {
  const { showError } = useToast();

  const [logs, setLogs] = useState<NhatKy[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [filterHanhDong, setFilterHanhDong] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");

  const showSkeleton = useMinLoading(loading);

  const payload: NhatKySearchPayload = useMemo(
    () => ({
      taiKhoan: search,
      hanhDong: filterHanhDong,
      trangThai: filterTrangThai,
    }),
    [search, filterHanhDong, filterTrangThai],
  );

  useEffect(() => {
    let ignore = false;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const result = await auditLogService.search(payload, {
          page: currentPage - 1,
          size: PAGE_SIZE,
          sortBy: "createdAt",
          direction: "DESC",
        });
        if (ignore) return;
        setLogs(result?.content ?? []);
        setTotalPages(result?.totalPages ?? 1);
      } catch {
        if (ignore) return;
        showError("Không thể tải nhật ký hệ thống");
        setLogs([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    void fetchLogs();
    return () => {
      ignore = true;
    };
  }, [payload, currentPage, showError]);

  const hasFilter = Boolean(search || filterHanhDong || filterTrangThai);

  const handleClearFilter = () => {
    setSearch("");
    setFilterHanhDong("");
    setFilterTrangThai("");
    setCurrentPage(1);
  };

  const renderSkeletonRows = (count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <tr key={`sk-${i}`}>
        <td className={styles.colStt}>
          <Skeleton width={24} />
        </td>
        <td className={styles.colAccount}>
          <Skeleton width={140} />
        </td>
        <td className={styles.colAction}>
          <Skeleton width={90} />
        </td>
        <td className={styles.colTime}>
          <Skeleton width={120} />
        </td>
        <td className={styles.colObject}>
          <Skeleton width={100} />
        </td>
        <td>
          <Skeleton width="90%" />
        </td>
        <td className={styles.colStatus}>
          <Skeleton width={80} />
        </td>
      </tr>
    ));

  const renderRow = (log: NhatKy, index: number) => (
    <tr key={log.idNhatKy}>
      <td className={styles.colStt}>
        {(currentPage - 1) * PAGE_SIZE + index + 1}
      </td>
      <td className={styles.colAccount}>{getTaiKhoanText(log.taiKhoan)}</td>
      <td className={styles.colAction}>
        <span
          className={`${styles.badge} ${
            HANH_DONG_BADGE_CLASS[log.hanhDong] ?? styles.badgeNeutral
          }`}
        >
          {HANH_DONG_LABEL[log.hanhDong] ?? log.hanhDong}
        </span>
      </td>
      <td className={styles.colTime}>
        <div className={styles.dateCell}>
          <span className={styles.dateMain}>
            {formatDatePart(log.createdAt)}
          </span>
          <span className={styles.dateSub}>
            {formatTimePart(log.createdAt)}
          </span>
        </div>
      </td>
      <td className={styles.colObject}>{log.doiTuong ?? "—"}</td>
      <td>{log.moTa ?? "—"}</td>
      <td className={styles.colStatus}>
        <span
          className={`${styles.badge} ${
            log.trangThai === "THANH_CONG"
              ? styles.badgeSuccess
              : styles.badgeDanger
          }`}
        >
          {TRANG_THAI_LABEL[log.trangThai] ?? log.trangThai}
        </span>
      </td>
    </tr>
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Nhật ký hệ thống</h1>
        </div>
      </div>

      <div className={styles.toolbar}>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo tài khoản…"
        />
        <div className={styles.filterGroup}>
          <CustomSelect
            options={HANH_DONG_OPTIONS}
            value={filterHanhDong}
            onChange={(v) => {
              setFilterHanhDong(v);
              setCurrentPage(1);
            }}
            variant="table"
          />
          <CustomSelect
            options={TRANG_THAI_OPTIONS}
            value={filterTrangThai}
            onChange={(v) => {
              setFilterTrangThai(v);
              setCurrentPage(1);
            }}
            variant="table"
          />
          {hasFilter && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClearFilter}
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colStt}>STT</th>
              <th className={styles.colAccount}>Tài khoản</th>
              <th className={styles.colAction}>Hành động</th>
              <th className={styles.colTime}>Thời gian</th>
              <th className={styles.colObject}>Đối tượng</th>
              <th>Mô tả</th>
              <th className={styles.colStatus}>Trạng thái</th>
            </tr>
          </thead>
          <tbody key={currentPage} className={styles.tbodyAnimate}>
            {showSkeleton ? (
              renderSkeletonRows(PAGE_SIZE)
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  {hasFilter ? "Không tìm thấy nhật ký" : "Chưa có nhật ký"}
                </td>
              </tr>
            ) : (
              logs.map(renderRow)
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
