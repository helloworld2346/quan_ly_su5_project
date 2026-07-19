import { useState, useMemo } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faTriangleExclamation,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

import { donviService } from "../../../services/unit/unitService";
import { useToast } from "../../../context/useToast";
import { useAuth } from "../../../context/useAuth";
import { normalizeRoleName, formatNum } from "../../../utils/reportUtils";
import type { DonVi } from "../../../types/account";

import NumberStepper from "../../../components/ui/NumberStepper/NumberStepper";
import ConfirmDialog from "../../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../../components/ui/ConfirmDialog/useConfirmDialog";

import styles from "../Settings.module.css";

type Props = {
  donVi: DonVi;
  childUnits?: DonVi[];
  onUpdated: (unit: DonVi) => void;
};

export default function QuanSoForm({
  donVi,
  childUnits = [],
  onUpdated,
}: Props) {
  const { showError, showSuccess } = useToast();
  const { refreshAccount, account } = useAuth();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const normalizedRole = normalizeRoleName(
    account?.vaiTro?.tenVaiTro ?? undefined,
  );
  const isDivisionTacChien =
    normalizedRole === "Trực ban tác chiến" && donVi.capDonVi === "SU_DOAN";
  const hasChildren = childUnits.length > 0;

  const isAggregatedOnly = hasChildren && !isDivisionTacChien;

  // Tổng biên chế CHỈ của các đơn vị con (seed = 0, KHÔNG cộng CH/f ở đây)
  const childAgg = useMemo(() => {
    return childUnits.reduce(
      (acc, c) => ({
        siQuan: acc.siQuan + c.quanSoSiQuan,
        qncn: acc.qncn + c.quanSoQncn,
        hsqBs: acc.hsqBs + c.quanSoHsqBs,
      }),
      { siQuan: 0, qncn: 0, hsqBs: 0 },
    );
  }, [childUnits]);

  const initSiQuan = isAggregatedOnly ? childAgg.siQuan : donVi.quanSoSiQuan;
  const initQncn = isAggregatedOnly ? childAgg.qncn : donVi.quanSoQncn;
  const initHsqBs = isAggregatedOnly ? childAgg.hsqBs : donVi.quanSoHsqBs;

  const [quanSoSiQuan, setQuanSoSiQuan] = useState(initSiQuan);
  const [quanSoQncn, setQuanSoQncn] = useState(initQncn);
  const [quanSoHsqBs, setQuanSoHsqBs] = useState(initHsqBs);
  const [saving, setSaving] = useState(false);

  const quanSoTong = useMemo(
    () => quanSoSiQuan + quanSoHsqBs + quanSoQncn,
    [quanSoSiQuan, quanSoHsqBs, quanSoQncn],
  );

  // Tổng toàn Sư đoàn = biên chế CH/f (đang chỉnh) + tổng các đơn vị con
  const suDoanSiQuan = quanSoSiQuan + childAgg.siQuan;
  const suDoanQncn = quanSoQncn + childAgg.qncn;
  const suDoanHsqBs = quanSoHsqBs + childAgg.hsqBs;
  const suDoanTong = suDoanSiQuan + suDoanQncn + suDoanHsqBs;

  const hasUnsavedChanges =
    quanSoSiQuan !== donVi.quanSoSiQuan ||
    quanSoQncn !== donVi.quanSoQncn ||
    quanSoHsqBs !== donVi.quanSoHsqBs;

  const resetChanges = () => {
    setQuanSoSiQuan(initSiQuan);
    setQuanSoQncn(initQncn);
    setQuanSoHsqBs(initHsqBs);
  };

  const handleUpdateDonVi = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmed = await confirm({
      title: "Xác nhận lưu quân số",
      message: "Bạn có chắc chắn muốn lưu thay đổi quân số biên chế?",
      confirmText: "Lưu",
      cancelText: "Hủy",
      type: "info",
    });
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await donviService.updateDonVi(donVi.maDonVi, {
        quanSoTong,
        quanSoHsqBs,
        quanSoSiQuan,
        quanSoQncn,
        tenDonvi: donVi.tenDonvi,
        kyhieuDonvi: donVi.kyhieuDonvi,
        capDonVi: donVi.capDonVi ?? "",
        donViCha: donVi.donViCha,
        createdAt: donVi.createdAt,
        updatedAt: new Date().toISOString(),
        isDeleted: donVi.isDeleted,
        deletedAt: donVi.deletedAt,
      });

      if (response.success) {
        onUpdated(response.Result);
        setQuanSoSiQuan(response.Result.quanSoSiQuan);
        setQuanSoQncn(response.Result.quanSoQncn);
        setQuanSoHsqBs(response.Result.quanSoHsqBs);
        await refreshAccount();
        showSuccess("Cập nhật quân số biên chế thành công");
      } else {
        showError(response.message || "Cập nhật thất bại");
      }
    } catch (err) {
      showError("Có lỗi xảy ra khi cập nhật đơn vị");
      if (import.meta.env.DEV) {
        console.error("Failed to update unit:", err);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputsDisabled = isAggregatedOnly;

  return (
    <>
      <div className={styles.cardSection}>
        <div className={styles.cardHeader}>
          <FontAwesomeIcon icon={faUsers} className={styles.cardHeaderIcon} />
          <h2 className={styles.cardTitle}>
            {isDivisionTacChien
              ? `Quân số biên chế CH/f — ${donVi.tenDonvi}`
              : `Quân số biên chế — ${donVi.tenDonvi}`}
          </h2>
        </div>

        {quanSoTong === 0 && !isAggregatedOnly && (
          <div className={styles.warningBanner}>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className={styles.warningIcon}
            />
            <div>
              <strong>Chưa nhập quân số biên chế.</strong> Vui lòng nhập quân số
              bên dưới để có thể sử dụng các tính năng báo cáo.
            </div>
          </div>
        )}

        <form className={styles.form} onSubmit={handleUpdateDonVi}>
          <div className={styles.statGrid}>
            <NumberStepper
              label="Quân số Sĩ quan"
              value={quanSoSiQuan}
              onChange={setQuanSoSiQuan}
              disabled={inputsDisabled}
              required
            />
            <NumberStepper
              label="Quân số QNCN"
              value={quanSoQncn}
              onChange={setQuanSoQncn}
              disabled={inputsDisabled}
              required
            />
            <NumberStepper
              label="Quân số HSQ-BS"
              value={quanSoHsqBs}
              onChange={setQuanSoHsqBs}
              disabled={inputsDisabled}
              required
            />

            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>Tổng quân số biên chế</span>
              <span className={styles.totalValue}>{formatNum(quanSoTong)}</span>
            </div>
          </div>

          {!isAggregatedOnly && (
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={resetChanges}
                disabled={!hasUnsavedChanges || saving}
              >
                Hoàn tác
              </button>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </form>
      </div>

      {isDivisionTacChien && hasChildren && (
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <FontAwesomeIcon
              icon={faLayerGroup}
              className={styles.cardHeaderIcon}
            />
            <h2 className={styles.cardTitle}>
              Quân số cộng dồn toàn Sư đoàn (gồm CH/f)
            </h2>
          </div>

          <div className={styles.statGrid}>
            <NumberStepper
              label="Quân số Sĩ quan"
              value={suDoanSiQuan}
              onChange={() => {}}
              disabled
            />
            <NumberStepper
              label="Quân số QNCN"
              value={suDoanQncn}
              onChange={() => {}}
              disabled
            />
            <NumberStepper
              label="Quân số HSQ-BS"
              value={suDoanHsqBs}
              onChange={() => {}}
              disabled
            />

            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>
                Tổng quân số toàn Sư đoàn
              </span>
              <span className={styles.totalValue}>{formatNum(suDoanTong)}</span>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
}
