import { useEffect, type Dispatch, type SetStateAction } from "react";
import styles from "../DailyTroopReport.module.css";
import NhiemVuAccordionItem from "./NhiemVuAccordionItem";
import type { NhiemVuEntry } from "../dailyTroopReportTypes";

type Props = {
  nhiemVuEntries: NhiemVuEntry[];
  openNhiemVuId: string | null;
  setOpenNhiemVuId: Dispatch<SetStateAction<string | null>>;
};

export default function DailyTroopNhiemVuSection({
  nhiemVuEntries,
  openNhiemVuId,
  setOpenNhiemVuId,
}: Props) {
  const isSingle = nhiemVuEntries.length === 1;
  const openItem =
    nhiemVuEntries.find((item) => item.id === openNhiemVuId) ?? null;

  useEffect(() => {
    if (!openItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenNhiemVuId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openItem, setOpenNhiemVuId]);

  return (
    <section className={styles.sectionBlock}>
      <div className={`${styles.sectionCard} ${styles.sectionCardSoft}`}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionKicker}>II</span>
            <div>
              <h2 className={styles.sectionTitle}>
                HOẠT ĐỘNG TRONG NGÀY
              </h2>
              <div className={styles.sectionSubTitle}>
                Nội dung nhiệm vụ, đột xuất, ưu điểm, khuyết điểm và việc cần
                giải quyết
              </div>
            </div>
          </div>
        </div>

        {nhiemVuEntries.length === 0 && (
          <div className={styles.emptyState}>
            <p>Chưa có dữ liệu báo cáo</p>
          </div>
        )}

        {isSingle && (
          <div className={styles.nhiemVuSingle}>
            <div className={styles.nhiemVuSingleHeader}>
              <span className={styles.nhiemVuSingleTitle}>
                {nhiemVuEntries[0].title}
              </span>
              <span
                className={`${styles.nhiemVuCardStatus} ${
                  nhiemVuEntries[0].reportStatusLabel === "Đã duyệt"
                    ? styles.nhiemVuCardStatusApproved
                    : styles.nhiemVuCardStatusPending
                }`}
              >
                {nhiemVuEntries[0].reportStatusLabel}
              </span>
            </div>
            <NhiemVuAccordionItem
              label={nhiemVuEntries[0].title}
              data={nhiemVuEntries[0].data}
            />
          </div>
        )}

        {nhiemVuEntries.length > 1 && (
          <div className={styles.nhiemVuGrid}>
            {nhiemVuEntries.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.nhiemVuCard}
                onClick={() => setOpenNhiemVuId(item.id)}
              >
                <span className={styles.nhiemVuCardTitle}>{item.title}</span>
                <span
                  className={`${styles.nhiemVuCardStatus} ${
                    item.reportStatusLabel === "Đã duyệt"
                      ? styles.nhiemVuCardStatusApproved
                      : styles.nhiemVuCardStatusPending
                  }`}
                >
                  {item.reportStatusLabel}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!isSingle && openItem && (
        <div
          className={styles.nhiemVuModalOverlay}
          onClick={() => setOpenNhiemVuId(null)}
        >
          <div
            className={styles.nhiemVuModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.nhiemVuModalHeader}>
              <h3 className={styles.nhiemVuModalTitle}>{openItem.title}</h3>
              <button
                type="button"
                className={styles.nhiemVuModalClose}
                onClick={() => setOpenNhiemVuId(null)}
              >
                &times;
              </button>
            </div>
            <div className={styles.nhiemVuModalBody}>
              <NhiemVuAccordionItem
                label={openItem.title}
                data={openItem.data}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
