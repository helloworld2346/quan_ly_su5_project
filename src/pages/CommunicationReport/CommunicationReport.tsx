import { useMemo, useState } from "react";

import styles from "./CommunicationReport.module.css";

import ReportToolbar from "../../components/report/ReportToolbar";
import { COMMUNICATION_REPORT_ROWS } from "../../data/communicationData";

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

const formatDate = (date: string) => {
  const parts = date.split("/");
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
  }
  return date;
};

export default function CommunicationReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMUNICATION_REPORT_ROWS;

    return COMMUNICATION_REPORT_ROWS.filter((row) => {
      const rowText = [
        row.date,
        row.unit,
        row.dutyOfficer,
        row.shortWaveReport.objectCount,
        row.shortWaveReport.totalSessions,
        row.shortWavePhone.objectCount,
        row.shortWavePhone.totalSessions,
        row.shortWaveTbbd.monitorTbbd,
        row.ultraShortWave.objectCount,
        row.ultraShortWave.totalSessions,
        row.ultraShortWaveTbbd.monitorTbbd,
        row.telephone.ensureMachines,
        row.telephone.goodMachines,
        row.militaryPost.speed.go,
        row.militaryPost.speed.come,
        row.militaryPost.documents.go,
        row.militaryPost.documents.come,
        row.militaryPost.documents.stay,
        row.militaryPost.documents2.go,
        row.militaryPost.documents2.come,
        row.militaryPost.vehicles.bicycle,
        row.militaryPost.vehicles.motorcycle,
        row.militaryPost.vehicles.trips,
        row.militaryPost.vehicles.weight,
        row.note,
      ]
        .join(" ")
        .toLowerCase();

      return rowText.includes(q);
    });
  }, [query]);

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
      />

      <div className={styles.tableShell}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th rowSpan={3}>Ngày trực</th>
              <th rowSpan={3}>Đơn vị</th>
              <th rowSpan={3}>Trực ban TT</th>
              <th colSpan={5} rowSpan={2}>
                Sóng ngắn (báo)
              </th>
              <th colSpan={5} rowSpan={2}>
                Sóng ngắn (Thoại ĐB)
              </th>
              <th colSpan={3} rowSpan={2}>
                Sóng ngắn TBBĐ
              </th>
              <th colSpan={5} rowSpan={2}>
                Sóng cực ngắn
              </th>
              <th colSpan={3} rowSpan={2}>
                Sóng cực ngắn TBBĐ
              </th>
              <th colSpan={3} rowSpan={2}>
                Tổng đài, máy điện thoại
              </th>
              <th colSpan={11}>Quân bưu - Vận động</th>
              <th rowSpan={3}>Nhận xét</th>
            </tr>

            <tr>
              <th colSpan={2}>H.tốc</th>
              <th colSpan={3}>C.văn (T, M, TM)</th>
              <th colSpan={2}>Văn kiện</th>
              <th colSpan={4}>Phương tiện</th>
            </tr>

            <tr>
              <th>
                Số <br />
                đối tượng LL
              </th>
              <th>
                Σ <br /> Số phiên
              </th>
              <th>Phiên tốt</th>
              <th>Phiên đứt</th>
              <th>Điện phát/ thu</th>

              <th>
                Số <br />
                đối tượng LL
              </th>
              <th>
                Σ <br />
                Số phiên
              </th>
              <th>Phiên tốt</th>
              <th>Phiên đứt</th>
              <th>Điện phát/ thu</th>

              <th>Thu canh TBBĐ</th>
              <th>Tín hiệu phát/ thu</th>
              <th>Tín hiệu đứt</th>

              <th>
                Số <br />
                đối tượng LL
              </th>
              <th>
                Σ <br />
                Số phiên
              </th>
              <th>Phiên tốt</th>
              <th>Phiên đứt</th>
              <th>Điện phát/ thu</th>

              <th>Thu canh TBBĐ</th>
              <th>Tín hiệu phát/ thu</th>
              <th>Tín hiệu đứt</th>

              <th>Máy bảo đảm</th>
              <th>Số máy tốt</th>
              <th>
                Σ <br />
                T.K/
                <br />
                Đứt
              </th>

              <th>Về</th>
              <th>Đi</th>

              <th>Về</th>
              <th>Đi</th>
              <th>Đọng</th>

              <th>Về</th>
              <th>Đi</th>

              <th>Xe đạp</th>
              <th>Mô tô</th>
              <th>Số chuyến</th>
              <th>Trọng lượng (kg)</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={index}>
                <td className={styles.dateCell}>{formatDate(row.date)}</td>
                <td className={styles.unitCell}>{row.unit}</td>
                <td>{row.dutyOfficer}</td>

                <td>{row.shortWaveReport.objectCount}</td>
                <td>{row.shortWaveReport.totalSessions}</td>
                <td>{row.shortWaveReport.goodSessions}</td>
                <td>{row.shortWaveReport.brokenSessions}</td>
                <td>{row.shortWaveReport.transmitReceive}</td>

                <td>{row.shortWavePhone.objectCount}</td>
                <td>{row.shortWavePhone.totalSessions}</td>
                <td>{row.shortWavePhone.goodSessions}</td>
                <td>{row.shortWavePhone.brokenSessions}</td>
                <td>{row.shortWavePhone.transmitReceive}</td>

                <td>{row.shortWaveTbbd.monitorTbbd}</td>
                <td>{row.shortWaveTbbd.signalTransmitReceive}</td>
                <td>{row.shortWaveTbbd.signalBroken}</td>

                <td>{row.ultraShortWave.objectCount}</td>
                <td>{row.ultraShortWave.totalSessions}</td>
                <td>{row.ultraShortWave.goodSessions}</td>
                <td>{row.ultraShortWave.brokenSessions}</td>
                <td>{row.ultraShortWave.transmitReceive}</td>

                <td>{row.ultraShortWaveTbbd.monitorTbbd}</td>
                <td>{row.ultraShortWaveTbbd.signalTransmitReceive}</td>
                <td>{row.ultraShortWaveTbbd.signalBroken}</td>

                <td>{row.telephone.ensureMachines}</td>
                <td>{row.telephone.goodMachines}</td>
                <td>{row.telephone.totalBroken}</td>

                <td>{row.militaryPost.speed.go}</td>
                <td>{row.militaryPost.speed.come}</td>

                <td>{row.militaryPost.documents.go}</td>
                <td>{row.militaryPost.documents.come}</td>
                <td>{row.militaryPost.documents.stay}</td>

                <td>{row.militaryPost.documents2.go}</td>
                <td>{row.militaryPost.documents2.come}</td>

                <td>{row.militaryPost.vehicles.bicycle}</td>
                <td>{row.militaryPost.vehicles.motorcycle}</td>
                <td>{row.militaryPost.vehicles.trips}</td>
                <td>{row.militaryPost.vehicles.weight}</td>

                <td className={styles.noteCell}>{row.note}</td>
              </tr>
            ))}

            <tr className={styles.totalRow}>
              <td colSpan={3}>Tổng</td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWaveReport.objectCount,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWaveReport.totalSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWaveReport.goodSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWaveReport.brokenSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWaveReport.transmitReceive,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWavePhone.objectCount,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWavePhone.totalSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWavePhone.goodSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWavePhone.brokenSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWavePhone.transmitReceive,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWaveTbbd.monitorTbbd,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWaveTbbd.signalTransmitReceive,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.shortWaveTbbd.signalBroken,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.ultraShortWave.objectCount,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.ultraShortWave.totalSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.ultraShortWave.goodSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.ultraShortWave.brokenSessions,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.ultraShortWave.transmitReceive,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.ultraShortWaveTbbd.monitorTbbd,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.ultraShortWaveTbbd.signalTransmitReceive,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.ultraShortWaveTbbd.signalBroken,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.telephone.ensureMachines,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.telephone.goodMachines,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.telephone.totalBroken,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.speed.go,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.speed.come,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.documents.go,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.documents.come,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.documents.stay,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.documents2.go,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.documents2.come,
                  0,
                )}
              </td>

              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.vehicles.bicycle,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.vehicles.motorcycle,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.vehicles.trips,
                  0,
                )}
              </td>
              <td>
                {filteredRows.reduce(
                  (sum, r) => sum + r.militaryPost.vehicles.weight,
                  0,
                )}
              </td>
              <td className={styles.noteCell}>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
