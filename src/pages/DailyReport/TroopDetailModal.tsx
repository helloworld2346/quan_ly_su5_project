import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./TroopDetailModal.module.css";
import type { TroopMember } from "../../types/troopStats";

type Props = {
  unit: string;
  members: TroopMember[];
  onClose: () => void;
};

export default function TroopDetailModal({
  unit,
  members,
  onClose,
}: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>
              Chi tiết quân số vắng
            </h2>

            <div className={styles.subTitle}>
              {unit}
            </div>
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <span>Số quân nhân vắng</span>
              <strong>{members.length}</strong>
            </div>
          </div>

          {members.length === 0 ? (
            <p className={styles.empty}>
              Không có quân nhân vắng.
            </p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và tên</th>
                    <th>Cấp bậc</th>
                    <th>Chức vụ</th>
                    <th>Lý do vắng</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((m, i) => (
                    <tr key={m.id}>
                      <td>{i + 1}</td>
                      <td className={styles.nameCell}>
                        {m.name}
                      </td>
                      <td>{m.rank}</td>
                      <td>{m.position}</td>
                      <td>{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}