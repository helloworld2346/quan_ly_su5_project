import type { Dispatch, SetStateAction } from "react";
import styles from "../DailyTroopReport.module.css";
import NhiemVuAccordionItem, {
  type NhiemVuSummary,
} from "./NhiemVuAccordionItem";

type NhiemVuEntry = {
  id: string;
  title: string;
  subtitle: string;
  data: NhiemVuSummary | null;
  reportStatusLabel: string;
};

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
  return (
    <section className={styles.sectionBlock}>
      <div className={`${styles.sectionCard} ${styles.sectionCardSoft}`}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionKicker}>II</span>
            <div>
              <h2 className={styles.sectionTitle}>
                TÌNH HÌNH HOẠT ĐỘNG NHIỆM VỤ NGÀY
              </h2>
              <div className={styles.sectionSubTitle}>
                Nội dung nhiệm vụ, đột xuất, ưu điểm, khuyết điểm và việc cần
                giải quyết
              </div>
            </div>
          </div>
        </div>

        <div className={styles.summaryList}>
          {nhiemVuEntries.length > 0 ? (
            nhiemVuEntries.map((item) => {
              const isOpen = openNhiemVuId === item.id;

              return (
                <div key={item.id} className={styles.nhiemVuAccordionItem}>
                  <button
                    type="button"
                    className={styles.nhiemVuAccordionHeader}
                    onClick={() =>
                      setOpenNhiemVuId((prev) =>
                        prev === item.id ? null : item.id,
                      )
                    }
                    aria-expanded={isOpen}
                  >
                    <div className={styles.nhiemVuAccordionHeaderLeft}>
                      <div className={styles.nhiemVuAccordionTitle}>
                        {item.title}
                      </div>
                    </div>

                    <div className={styles.nhiemVuAccordionHeaderRight}>
                      <span
                        className={`${styles.nhiemVuAccordionStatus} ${
                          item.reportStatusLabel === "Đã duyệt"
                            ? styles.nhiemVuAccordionStatusSuccess
                            : styles.nhiemVuAccordionStatusEmpty
                        }`}
                      >
                        {item.reportStatusLabel}
                      </span>
                      <span
                        className={`${styles.nhiemVuAccordionArrow} ${
                          isOpen ? styles.nhiemVuAccordionArrowOpen : ""
                        }`}
                      >
                        ▾
                      </span>
                    </div>
                  </button>

                  <div
                    className={`${styles.nhiemVuAccordionBody} ${
                      isOpen ? styles.nhiemVuAccordionBodyOpen : ""
                    }`}
                  >
                    <div className={styles.nhiemVuAccordionBodyInner}>
                      <NhiemVuAccordionItem
                        label={item.title}
                        data={item.data}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <p>Chưa có dữ liệu báo cáo</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
