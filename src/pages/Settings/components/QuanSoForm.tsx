import { useState, useMemo } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { donviService } from "../../../services/unit/unitService";
import { useToast } from "../../../context/useToast";
import { useAuth } from "../../../context/useAuth";
import type { DonVi } from "../../../types/account";

import NumberStepper from "../../../components/ui/NumberStepper/NumberStepper";
import ConfirmDialog from "../../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../../components/ui/ConfirmDialog/useConfirmDialog";

import styles from "../Settings.module.css";

type Props = {
  donVi: DonVi;
  onUpdated: (unit: DonVi) => void;
};

export default function QuanSoForm({ donVi, onUpdated }: Props) {
  const { showError, showSuccess } = useToast();
  const { refreshAccount } = useAuth();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const [quanSoSiQuan, setQuanSoSiQuan] = useState(donVi.quanSoSiQuan);
  const [quanSoQncn, setQuanSoQncn] = useState(donVi.quanSoQncn);
  const [quanSoHsqBs, setQuanSoHsqBs] = useState(donVi.quanSoHsqBs);
  const [saving, setSaving] = useState(false);

  const quanSoTong = useMemo(
    () => quanSoSiQuan + quanSoHsqBs + quanSoQncn,
    [quanSoSiQuan, quanSoHsqBs, quanSoQncn],
  );

  const hasUnsavedChanges =
    quanSoSiQuan !== donVi.quanSoSiQuan ||
    quanSoQncn !== donVi.quanSoQncn ||
    quanSoHsqBs !== donVi.quanSoHsqBs;

  const resetChanges = () => {
    setQuanSoSiQuan(donVi.quanSoSiQuan);
    setQuanSoQncn(donVi.quanSoQncn);
    setQuanSoHsqBs(donVi.quanSoHsqBs);
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

  return (
    <div className={styles.cardSection}>
      <div className={styles.cardHeader}>
        <FontAwesomeIcon icon={faUsers} className={styles.cardHeaderIcon} />
        <h2 className={styles.cardTitle}>
          Quân số biên chế — {donVi.tenDonvi}
        </h2>
      </div>

      {quanSoTong === 0 && (
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
            required
          />
          <NumberStepper
            label="Quân số QNCN"
            value={quanSoQncn}
            onChange={setQuanSoQncn}
            required
          />
          <NumberStepper
            label="Quân số HSQ-BS"
            value={quanSoHsqBs}
            onChange={setQuanSoHsqBs}
            required
          />

          <div className={styles.totalCard}>
            <span className={styles.totalLabel}>Tổng quân số biên chế</span>
            <span className={styles.totalValue}>{quanSoTong}</span>
          </div>
        </div>

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
      </form>

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
    </div>
  );
}
