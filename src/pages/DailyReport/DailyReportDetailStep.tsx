import styles from "./DailyReportDetailStep.module.css";
import { useState } from "react";

export default function DailyReportDetailStep() {
  const [securityStatus, setSecurityStatus] = useState("");

  const [incidentStatus, setIncidentStatus] = useState("");

  const [advantageStatus, setAdvantageStatus] = useState("");
  const [disadvantageStatus, setDisadvantageStatus] = useState("");

  const [pendingTaskStatus, setPendingTaskStatus] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Nhiệm vụ canh phòng */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            Nhiệm vụ các phân đội đóng quân canh phòng và các phân đội khác
          </h3>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="security"
                value="safe"
                checked={securityStatus === "safe"}
                onChange={(e) => setSecurityStatus(e.target.value)}
              />
              Đảm bảo an toàn
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="security"
                value="unsafe"
                checked={securityStatus === "unsafe"}
                onChange={(e) => setSecurityStatus(e.target.value)}
              />
              Không đảm bảo an toàn
            </label>
          </div>

          {securityStatus === "unsafe" && (
            <div className={styles.expandContent}>
              <label className={styles.label}>Lý do</label>

              <textarea
                rows={4}
                className={styles.textarea}
                placeholder="Nhập lý do..."
              />
            </div>
          )}
        </div>

        {/* Việc đột xuất */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            Những việc đột xuất xảy ra
          </h3>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="incident"
                value="yes"
                checked={incidentStatus === "yes"}
                onChange={(e) => setIncidentStatus(e.target.value)}
              />
              Có
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="incident"
                value="no"
                checked={incidentStatus === "no"}
                onChange={(e) => setIncidentStatus(e.target.value)}
              />
              Không
            </label>
          </div>

          {incidentStatus === "yes" && (
            <div className={styles.expandContent}>
              <label className={styles.label}>Chi tiết</label>

              <textarea
                rows={4}
                className={styles.textarea}
                placeholder="Nhập nội dung..."
              />
            </div>
          )}
        </div>

        {/* Nhận xét */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            Nhận xét ưu, khuyết điểm nội vụ, vệ sinh
          </h3>

          <div className={styles.section}>
            <label className={styles.label}>Ưu điểm</label>

            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="advantage"
                  value="yes"
                  checked={advantageStatus === "yes"}
                  onChange={(e) => setAdvantageStatus(e.target.value)}
                />
                Có
              </label>

              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="advantage"
                  value="no"
                  checked={advantageStatus === "no"}
                  onChange={(e) => setAdvantageStatus(e.target.value)}
                />
                Không
              </label>
            </div>

            {advantageStatus === "yes" && (
              <div className={styles.expandContent}>
                <textarea
                  rows={3}
                  className={styles.textarea}
                  placeholder="Nhập ưu điểm..."
                />
              </div>
            )}
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Khuyết điểm</label>

            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="disadvantage"
                  value="yes"
                  checked={disadvantageStatus === "yes"}
                  onChange={(e) => setDisadvantageStatus(e.target.value)}
                />
                Có
              </label>

              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="disadvantage"
                  value="no"
                  checked={disadvantageStatus === "no"}
                  onChange={(e) => setDisadvantageStatus(e.target.value)}
                />
                Không
              </label>
            </div>

            {disadvantageStatus === "yes" && (
              <div className={styles.expandContent}>
                <textarea
                  rows={3}
                  className={styles.textarea}
                  placeholder="Nhập khuyết điểm..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Việc cần giải quyết */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            Những việc cần tiếp tục giải quyết
          </h3>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="pending"
                value="yes"
                checked={pendingTaskStatus === "yes"}
                onChange={(e) => setPendingTaskStatus(e.target.value)}
              />
              Có
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="pending"
                value="no"
                checked={pendingTaskStatus === "no"}
                onChange={(e) => setPendingTaskStatus(e.target.value)}
              />
              Không
            </label>
          </div>

          {pendingTaskStatus === "yes" && (
            <div className={styles.expandContent}>
              <label className={styles.label}>Chi tiết</label>

              <textarea
                rows={4}
                className={styles.textarea}
                placeholder="Nhập nội dung..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}