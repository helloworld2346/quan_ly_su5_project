import { useState } from "react";
import BarChart from "../../components/charts/BarChart/BarChart";
import LineChart from "../../components/charts/LineChart/LineChart";
import PieChart from "../../components/charts/PieChart/PieChart";
import styles from "./Trainningstatistical.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserMinus,
  faPersonRifle,
  faPersonMilitaryRifle,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

// ── Mock data ──────────────────────────────────────────────────
const MOCK_SUMMARY = {
  tongQuanSo: 80,
  thamGia: 70,
  vang: 10,
  tyLe: 87.5,
};

const MOCK_LOAI_QUAN = {
  labels: ["SQ", "QNCN", "HSQ-CS Năm 1", "HSQ-CS Năm 2"],
  hienDien: [5, 25, 101, 108],
  tongQS: [29, 30, 108, 101],
  thamGia: [25, 28, 99, 97],
  vang: [4, 2, 9, 14],
};

const MOCK_TY_LE_THEO_NGAY = {
  labels: ["14/05", "15/05", "16/05", "17/05", "18/05", "19/05", "20/05"],
  data: [82, 85, 84, 88, 86.7, 90, 87.5],
};

// ── Chi tiết đơn vị ───────────────────────────────────────────
type UnitLevel = "all" | "phong" | "trungdoan" | "tieudoan" | "daidi";

interface UnitDetail {
  ten: string;
  level: Exclude<UnitLevel, "all">;
  sq: number;
  qncn: number;
  hscNam1: number;
  hscNam2: number;
}

const MOCK_CHI_TIET: UnitDetail[] = [
  { ten: "Phòng Tham Mưu", level: "phong", sq: 8, qncn: 12, hscNam1: 20, hscNam2: 18 },
  { ten: "Phòng Chính Trị", level: "phong", sq: 6, qncn: 10, hscNam1: 18, hscNam2: 15 },
  { ten: "Phòng Hậu Cần Kỹ Thuật", level: "phong", sq: 5, qncn: 9, hscNam1: 22, hscNam2: 20 },
  { ten: "Trung đoàn 4", level: "trungdoan", sq: 10, qncn: 15, hscNam1: 40, hscNam2: 38 },
  { ten: "Trung đoàn 5", level: "trungdoan", sq: 9, qncn: 14, hscNam1: 38, hscNam2: 35 },
  { ten: "Trung đoàn 271", level: "trungdoan", sq: 11, qncn: 16, hscNam1: 42, hscNam2: 40 },
  { ten: "Tiển đoàn 23", level: "tieudoan", sq: 1, qncn: 2, hscNam1: 8, hscNam2: 7 },
  { ten: "Tiểu đoàn 14", level: "tieudoan", sq: 4, qncn: 6, hscNam1: 18, hscNam2: 16 },
  { ten: "Tiểu đoàn 15", level: "tieudoan", sq: 3, qncn: 5, hscNam1: 16, hscNam2: 14 },
  { ten: "Tiểu đoàn 16", level: "tieudoan", sq: 4, qncn: 6, hscNam1: 17, hscNam2: 15 },
  { ten: "Tiểu đoàn 17", level: "tieudoan", sq: 3, qncn: 5, hscNam1: 15, hscNam2: 13 },
  { ten: "Tiểu đoàn 18", level: "tieudoan", sq: 4, qncn: 6, hscNam1: 18, hscNam2: 16 },
  { ten: "Tiểu đoàn 24", level: "tieudoan", sq: 3, qncn: 5, hscNam1: 16, hscNam2: 14 },
  { ten: "Tiểu đoàn 25", level: "tieudoan", sq: 4, qncn: 7, hscNam1: 19, hscNam2: 17 },
  { ten: "Đại đội 19", level: "daidi", sq: 2, qncn: 3, hscNam1: 10, hscNam2: 9 },
  { ten: "Đại đội 20", level: "daidi", sq: 2, qncn: 3, hscNam1: 10, hscNam2: 9 },
  { ten: "Đại đội 23", level: "daidi", sq: 2, qncn: 3, hscNam1: 9, hscNam2: 8 },
  { ten: "Đại đội Kho", level: "daidi", sq: 2, qncn: 3, hscNam1: 9, hscNam2: 8 },
  { ten: "Đại đội Sữa Chữa", level: "daidi", sq: 1, qncn: 2, hscNam1: 8, hscNam2: 7 },

];

const UNIT_LEVELS: { key: UnitLevel; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "phong", label: "Phòng" },
  { key: "trungdoan", label: "Trung đoàn" },
  { key: "tieudoan", label: "Tiểu đoàn" },
  { key: "daidi", label: "Đại đội" },
];

const UNIT_GROUPS: { key: Exclude<UnitLevel, "all">; label: string }[] = [
  { key: "phong", label: "Theo Phòng" },
  { key: "trungdoan", label: "Theo Trung đoàn" },
  { key: "tieudoan", label: "Theo Tiểu đoàn" },
  { key: "daidi", label: "Theo Đại đội" },
];

// ── Helpers ────────────────────────────────────────────────────
function formatNum(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatRate(rate: number) {
  return Number.isInteger(rate) ? `${rate}%` : `${rate.toFixed(1)}%`;
}

// ── Metric Card ────────────────────────────────────────────────
function MetricCard({
  title, value, sub, color, icon,
}: {
  title: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon} style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className={styles.metricBody}>
        <div className={styles.metricTitle}>{title}</div>
        <div className={styles.metricValue} style={{ color }}>{value}</div>
        <div className={styles.metricSub}>{sub}</div>
      </div>
    </div>
  );
}

// ── Chart Card ─────────────────────────────────────────────────
function ChartCard({
  title, total, children,
}: {
  title: string;
  total?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartCardTitle}>{title}</h4>
      {total !== undefined && (
        <p className={styles.chartCardTotal}>Tổng cộng: {formatNum(total)}</p>
      )}
      {children}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function TrainingDashboard() {
  const { tongQuanSo, thamGia, vang, tyLe } = MOCK_SUMMARY;
  const [activeLevel, setActiveLevel] = useState<UnitLevel>("all");

  const visibleGroups = UNIT_GROUPS.filter(
    (g) => activeLevel === "all" || activeLevel === g.key
  ).map((g) => ({
    ...g,
    units: MOCK_CHI_TIET.filter((u) => u.level === g.key),
  })).filter((g) => g.units.length > 0);

  return (
    <div className={styles.wrapper}>

      {/* ── Metrics ── */}
      <div className={styles.metricsBar}>
        <MetricCard
          title="Quân số hiện diện"
          value={formatNum(58)}
          sub="72.5% tổng quân số phải huấn luyện"
          color="var(--chart-green)"
          icon={<FontAwesomeIcon icon={faUsers} />}
        />
        <MetricCard
          title="Tổng quân số phải huấn luyện"
          value={formatNum(tongQuanSo)}
          sub="100% tổng quân số"
          color="var(--chart-blue)"
          icon={<FontAwesomeIcon icon={faPersonRifle} />}
        />
        <MetricCard
          title="Tham gia huấn luyện"
          value={formatNum(thamGia)}
          sub={`${formatRate(tyLe)} tổng quân số phải huấn luyện`}
          color="var(--chart-green)"
          icon={<FontAwesomeIcon icon={faPersonMilitaryRifle} />}
        />
        <MetricCard
          title="Vắng huấn luyện"
          value={formatNum(vang)}
          sub={`${formatRate((vang / tongQuanSo) * 100)} tổng quân số phải huấn luyện`}
          color="var(--chart-red)"
          icon={<FontAwesomeIcon icon={faUserMinus} />}
        />
      </div>

      {/* ── Row 1: Donut + LineChart theo ngày ── */}
      <div className={styles.row2col}>
        <ChartCard title="Tỷ lệ tham gia huấn luyện">
          <div className={styles.donutWrapper}>
            <PieChart
              chart={{
                id: "training-overview",
                name: "Huấn luyện",
                unitType: "division",
                total: tongQuanSo,
                present: thamGia,
                absent: vang,
              }}
              size="large"
              variant="compact"
            />
            <div className={styles.donutTotal}>
              Tổng quân số: <strong>{formatNum(tongQuanSo)}</strong>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Tỷ lệ tham gia huấn luyện theo ngày">
          <LineChart
            labels={MOCK_TY_LE_THEO_NGAY.labels}
            datasets={[{
              label: "Tỷ lệ tham gia (%)",
              color: "var(--chart-purple)",
              data: MOCK_TY_LE_THEO_NGAY.data,
            }]}
            height={450}
            showLegend={false}
            unit="%"
            maxValue={100}
            minValue={70}
          />
        </ChartCard>
      </div>

      {/* ── Row 2: Tổng hợp theo loại quân ── */}
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>Tổng hợp quân số toàn đơn vị</h3>
      </div>

      <div className={styles.row4col}>
        <ChartCard
          title="Quân số hiện diện"
          total={MOCK_LOAI_QUAN.hienDien.reduce((a, b) => a + b, 0)}
        >
          <BarChart
            labels={MOCK_LOAI_QUAN.labels}
            datasets={[{ label: "Hiện diện", color: "var(--chart-green)", data: MOCK_LOAI_QUAN.hienDien }]}
            orientation="vertical"
            height={260}
            showLegend={false}
            showValues
          />
        </ChartCard>

        <ChartCard
          title="Quân số phải huấn luyện"
          total={MOCK_LOAI_QUAN.tongQS.reduce((a, b) => a + b, 0)}
        >
          <BarChart
            labels={MOCK_LOAI_QUAN.labels}
            datasets={[{ label: "Quân số", color: "var(--chart-blue)", data: MOCK_LOAI_QUAN.tongQS }]}
            orientation="vertical"
            height={260}
            showLegend={false}
            showValues
          />
        </ChartCard>

        <ChartCard
          title="Quân số tham gia huấn luyện"
          total={MOCK_LOAI_QUAN.thamGia.reduce((a, b) => a + b, 0)}
        >
          <BarChart
            labels={MOCK_LOAI_QUAN.labels}
            datasets={[{ label: "Tham gia", color: "var(--chart-green)", data: MOCK_LOAI_QUAN.thamGia }]}
            orientation="vertical"
            height={260}
            showLegend={false}
            showValues
          />
        </ChartCard>

        <ChartCard
          title="Quân số vắng huấn luyện"
          total={MOCK_LOAI_QUAN.vang.reduce((a, b) => a + b, 0)}
        >
          <BarChart
            labels={MOCK_LOAI_QUAN.labels}
            datasets={[{ label: "Vắng", color: "var(--chart-red)", data: MOCK_LOAI_QUAN.vang }]}
            orientation="vertical"
            height={260}
            showLegend={false}
            showValues
          />
        </ChartCard>
      </div>

      {/* ── Row 3: Chi tiết theo đơn vị ── */}
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>Chi tiết quân số theo đơn vị</h3>
      </div>

      {/* Toolbar filter — giống ExecutiveDashboard */}
      <div className={styles.toolbar}>
        <span className={styles.toolbarIcon}>
          <FontAwesomeIcon icon={faFilter} />
        </span>
        <div className={styles.filters}>
          {UNIT_LEVELS.map((lv) => (
            <button
              key={lv.key}
              type="button"
              className={`${styles.filterBtn} ${activeLevel === lv.key ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveLevel(lv.key)}
            >
              {lv.label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups — giống ExecutiveDashboard */}
      <div className={styles.groups}>
        {visibleGroups.map((group) => (
          <section key={group.key}>
            <div className={styles.groupHead}>
              <h4 className={styles.groupTitle}>{group.label}</h4>
              <span className={styles.groupCount}>{group.units.length} đơn vị</span>
            </div>
            <div className={styles.groupGrid}>
              {group.units.map((unit) => (
                <ChartCard key={unit.ten} title={unit.ten}>
                  <BarChart
                    labels={["SQ", "QNCN", "HSQ-CS Năm 1", "HSQ-CS Năm 2"]}
                    datasets={[{
                      label: "Quân số tham gia",
                      color: "var(--chart-green)",
                      data: [unit.sq, unit.qncn, unit.hscNam1, unit.hscNam2],
                    }]}
                    orientation="vertical"
                    height={220}
                    showLegend={false}
                    showValues
                  />
                </ChartCard>
              ))}
            </div>
          </section>
        ))}
      </div>

    </div>
  );
}
