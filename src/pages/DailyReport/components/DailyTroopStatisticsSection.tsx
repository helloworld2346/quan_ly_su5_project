import type { MouseEvent, RefObject } from "react";
import styles from "../DailyTroopReport.module.css";
import type { ReportRow } from "../../../types/dailyReport";
import type { DisplayTotals } from "../utils/dailyTroopReportHelpers";
import ReportTableHeader from "./ReportTableHeader";
import ReportTableRow from "./ReportTableRow";
import ReportTotalRow from "./ReportTotalRow";
import Skeleton from "../../../components/ui/Skeleton/Skeleton";  


type SharedRowProps = {
  isParentUnit: boolean;
  isReporter: boolean;
  isTacChien: boolean;
  isChiHuyLeaf: boolean;
  maDonViCurrent: string | undefined;
  activeMenuUnit: string | null;
  menuPosition: { top?: number; bottom?: number; left: number };
  dropdownRef: RefObject<HTMLDivElement | null>;
  onToggleMenu: (e: MouseEvent<HTMLButtonElement>, key: string) => void;
  onViewDetail: (row: ReportRow) => void;
  onEditReport: (row: ReportRow) => void;
};

type ConsolidatedData = {
  submittedCount: number;
};

type Props = {
  loading: boolean;
  displayRows: ReportRow[];
  displayTotals: DisplayTotals;
  parentReportData: ReportRow | null;
  consolidatedData: ConsolidatedData | null;
  canConsolidateUnit: boolean;
  shouldHideConsolidatedSections: boolean;
  showTotalRow: boolean;
  sharedRowProps: SharedRowProps;
  activeMenuUnit: string | null;
  menuPosition: { top?: number; bottom?: number; left: number };
  dropdownRef: RefObject<HTMLDivElement | null>;
  onViewConsolidatedDetail: () => void;
};

export default function DailyTroopStatisticsSection({
  loading,
  displayRows,
  displayTotals,
  parentReportData,
  consolidatedData,
  canConsolidateUnit,
  shouldHideConsolidatedSections,
  showTotalRow,
  sharedRowProps,
  activeMenuUnit,
  menuPosition,
  dropdownRef,
  onViewConsolidatedDetail,
}: Props) {
  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionKicker}>I</span>
            <div>
              <h2 className={styles.sectionTitle}>THỐNG KÊ QUÂN SỐ</h2>
              <div className={styles.sectionSubTitle}>
                Tổng hợp biên chế, quân số và trạng thái báo cáo trong ngày
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tableShell}>
          {loading ? (
            <div className={styles.tableSkeleton}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={40} radius={8} />
              ))}
            </div>
          ) : (
            <table className={styles.reportTable}>
              <colgroup>
                <col style={{ width: "9%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "4%" }} />
              </colgroup>

              <ReportTableHeader />

              <tbody>
                {displayRows.length === 0 && !parentReportData ? (
                  <tr className={styles.noReportRow}>
                    <td colSpan={22}>Chưa có dữ liệu báo cáo</td>
                  </tr>
                ) : (
                  <>
                    {!shouldHideConsolidatedSections &&
                      canConsolidateUnit &&
                      displayRows.length > 0 && (
                        <tr className={styles.separatorRow}>
                          <td colSpan={22}>Báo cáo các đơn vị</td>
                        </tr>
                      )}

                    {displayRows.map((row) => (
                      <ReportTableRow
                        key={row.idDonBaoCao}
                        row={row}
                        isConsolidatedRow={false}
                        {...sharedRowProps}
                      />
                    ))}

                    {showTotalRow &&
                      displayRows.some((r) => !r.notSubmitted) && (
                        <ReportTotalRow
                          displayTotals={displayTotals}
                          isParentUnit={sharedRowProps.isParentUnit}
                          hasConsolidatedData={Boolean(consolidatedData)}
                          activeMenuUnit={activeMenuUnit}
                          menuPosition={menuPosition}
                          dropdownRef={dropdownRef}
                          onToggleMenu={sharedRowProps.onToggleMenu}
                          onViewConsolidatedDetail={onViewConsolidatedDetail}
                        />
                      )}

                    {!shouldHideConsolidatedSections && canConsolidateUnit && (
                      <tr className={styles.separatorRow}>
                        <td colSpan={22}>Báo cáo tổng hợp</td>
                      </tr>
                    )}

                    {!shouldHideConsolidatedSections &&
                    canConsolidateUnit &&
                    parentReportData ? (
                      <ReportTableRow
                        key={`parent-${parentReportData.idDonBaoCao}`}
                        row={parentReportData}
                        isConsolidatedRow={true}
                        {...sharedRowProps}
                      />
                    ) : (
                      !shouldHideConsolidatedSections &&
                      canConsolidateUnit && (
                        <tr className={styles.noConsolidatedRow}>
                          <td colSpan={22}>Chưa có báo cáo tổng hợp</td>
                        </tr>
                      )
                    )}
                  </>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
