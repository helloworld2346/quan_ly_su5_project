import styles from "./DailyReportDetailStep.module.css";
import { useState, useCallback } from "react";

export interface DetailStepData {
  securityStatus: string;
  incidentStatus: string;
  incidentDetail: string;
  advantageStatus: string;
  advantageDetail: string;
  disadvantageStatus: string;
  disadvantageDetail: string;
  pendingTaskStatus: string;
  pendingDetail: string;
}

interface Props {
  onChange?: (data: DetailStepData) => void;
}

export default function DailyReportDetailStep({ onChange }: Props) {
  const [securityStatus, setSecurityStatus] = useState("");
  const [incidentStatus, setIncidentStatus] = useState("");
  const [incidentDetail, setIncidentDetail] = useState("");
  const [advantageStatus, setAdvantageStatus] = useState("");
  const [advantageDetail, setAdvantageDetail] = useState("");
  const [disadvantageStatus, setDisadvantageStatus] = useState("");
  const [disadvantageDetail, setDisadvantageDetail] = useState("");
  const [pendingTaskStatus, setPendingTaskStatus] = useState("");
  const [pendingDetail, setPendingDetail] = useState("");

  const notify = useCallback(
    (patch: Partial<DetailStepData>) => {
      onChange?.({
        securityStatus,
        incidentStatus,
        incidentDetail,
        advantageStatus,
        advantageDetail,
        disadvantageStatus,
        disadvantageDetail,
        pendingTaskStatus,
        pendingDetail,
        ...patch,
      });
    },
    [
      onChange,
      securityStatus,
      incidentStatus,
      incidentDetail,
      advantageStatus,
      advantageDetail,
      disadvantageStatus,
      disadvantageDetail,
      pendingTaskStatus,
      pendingDetail,
    ],
  );

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            I. Nhiệm vụ các phân đội đóng quân canh phòng và các phân đội khác
          </h3>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="security"
                value="safe"
                checked={securityStatus === "safe"}
                onChange={(e) => {
                  setSecurityStatus(e.target.value);
                  notify({ securityStatus: e.target.value });
                }}
              />
              Đảm bảo an toàn
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="security"
                value="unsafe"
                checked={securityStatus === "unsafe"}
                onChange={(e) => {
                  setSecurityStatus(e.target.value);
                  notify({ securityStatus: e.target.value });
                }}
              />
              Không đảm bảo an toàn
            </label>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>II. Những việc đột xuất xảy ra</h3>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="incident"
                value="yes"
                checked={incidentStatus === "yes"}
                onChange={(e) => {
                  setIncidentStatus(e.target.value);
                  notify({ incidentStatus: e.target.value });
                }}
              />
              Có
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="incident"
                value="no"
                checked={incidentStatus === "no"}
                onChange={(e) => {
                  setIncidentStatus(e.target.value);
                  setIncidentDetail("");
                  notify({
                    incidentStatus: e.target.value,
                    incidentDetail: "",
                  });
                }}
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
                value={incidentDetail}
                onChange={(e) => {
                  setIncidentDetail(e.target.value);
                  notify({ incidentDetail: e.target.value });
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            III. Nhận xét ưu, khuyết điểm nội vụ, vệ sinh
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
                  onChange={(e) => {
                    setAdvantageStatus(e.target.value);
                    notify({ advantageStatus: e.target.value });
                  }}
                />
                Có
              </label>

              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="advantage"
                  value="no"
                  checked={advantageStatus === "no"}
                  onChange={(e) => {
                    setAdvantageStatus(e.target.value);
                    notify({ advantageStatus: e.target.value });
                  }}
                />
                Không
              </label>
            </div>

            {advantageStatus !== "" && (
              <div className={styles.expandContent}>
                <textarea
                  rows={3}
                  className={styles.textarea}
                  placeholder="Nhập ưu điểm..."
                  value={advantageDetail}
                  onChange={(e) => {
                    setAdvantageDetail(e.target.value);
                    notify({ advantageDetail: e.target.value });
                  }}
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
                  onChange={(e) => {
                    setDisadvantageStatus(e.target.value);
                    notify({ disadvantageStatus: e.target.value });
                  }}
                />
                Có
              </label>

              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="disadvantage"
                  value="no"
                  checked={disadvantageStatus === "no"}
                  onChange={(e) => {
                    setDisadvantageStatus(e.target.value);
                    notify({ disadvantageStatus: e.target.value });
                  }}
                />
                Không
              </label>
            </div>

            {disadvantageStatus !== "" && (
              <div className={styles.expandContent}>
                <textarea
                  rows={3}
                  className={styles.textarea}
                  placeholder="Nhập khuyết điểm..."
                  value={disadvantageDetail}
                  onChange={(e) => {
                    setDisadvantageDetail(e.target.value);
                    notify({ disadvantageDetail: e.target.value });
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            IV. Những việc cần tiếp tục giải quyết
          </h3>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="pending"
                value="yes"
                checked={pendingTaskStatus === "yes"}
                onChange={(e) => {
                  setPendingTaskStatus(e.target.value);
                  notify({ pendingTaskStatus: e.target.value });
                }}
              />
              Có
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="pending"
                value="no"
                checked={pendingTaskStatus === "no"}
                onChange={(e) => {
                  setPendingTaskStatus(e.target.value);
                  setPendingDetail("");
                  notify({
                    pendingTaskStatus: e.target.value,
                    pendingDetail: "",
                  });
                }}
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
                value={pendingDetail}
                onChange={(e) => {
                  setPendingDetail(e.target.value);
                  notify({ pendingDetail: e.target.value });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
