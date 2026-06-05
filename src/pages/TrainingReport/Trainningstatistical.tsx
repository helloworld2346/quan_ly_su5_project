import PieChart from "../../components/charts/PieChart/PieChart";
import BarChart from "../../components/charts/BarChart/BarChart";
import LineChart from "../../components/charts/LineChart/LineChart";
import styles from "./Trainningstatistical.module.css";

// ── Mock data (thay bằng API sau) ──────────────────────────────
const MOCK_SUMMARY = {
  tongQuanSo: 80,
  thamGia: 70,
  vang: 10,
  tyLe: 87.5,
};

const MOCK_DON_VI = [
  { ten: "Đại đội 1", thamGia: 100 },
  { ten: "Đại đội 2", thamGia: 100 },
  { ten: "Đại đội 3", thamGia: 95 },
  { ten: "Đại đội 4", thamGia: 90 },
  { ten: "Đại đội 5", thamGia: 85 },
  { ten: "Đại đội 6", thamGia: 75 },
];

const MOCK_LOAI_QUAN = {
  labels: ["SQ", "QNCN", "HSQ-CS Năm 1", "HSQ-CS Năm 2"],
  tongQS:    [29,  30,  108, 101],
  thamGia:   [25,  28,   99,  97],
  vang:      [ 4,   2,    9,  14],
};

const MOCK_TY_LE_THEO_NGAY = {
  labels: ["14/05", "15/05", "16/05", "17/05", "18/05", "19/05", "20/05"],
  data: [82, 85, 84, 88, 86.7, 90, 87.5],
};

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
  icon: string;
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

// ── Chart Section Wrapper ──────────────────────────────────────
function ChartCard({
  title, children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartCardTitle}>{title}</h4>
      {children}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function TrainingDashboard() {
  const { tongQuanSo, thamGia, vang, tyLe } = MOCK_SUMMARY;

  return (
    <div className={styles.wrapper}>

      {/* ── Metrics Bar ── */}
      <div className={styles.metricsBar}>
        <MetricCard
          title="Tổng quân số phân huấn luyện"
          value={formatNum(tongQuanSo)}
          sub="100% tổng quân số"
          color="var(--chart-blue)"
          icon="👥"
        />
        <MetricCard
          title="Tham gia huấn luyện"
          value={formatNum(thamGia)}
          sub={`${formatRate(tyLe)} tổng quân số`}
          color="var(--chart-green)"
          icon="👤"
        />
        <MetricCard
          title="Vắng huấn luyện"
          value={formatNum(vang)}
          sub={`${formatRate((vang / tongQuanSo) * 100)} tổng quân số`}
          color="var(--chart-red)"
          icon="🚫"
        />
        <MetricCard
          title="Tỷ lệ tham gia"
          value={formatRate(tyLe)}
          sub="Tỷ lệ tham gia huấn luyện"
          color="var(--chart-purple)"
          icon="%"
        />
      </div>

      {/* ── Row 1: Donut + Bar theo đơn vị ── */}
      <div className={styles.row2col}>
        <ChartCard title="Tỷ lệ tham gia huấn luyện">
          <div className={styles.donutRow}>
            <PieChart
              chart={{
                id: "training-overview",
                name: "Huấn luyện",
                unitType: "battalion",
                total: tongQuanSo,
                present: thamGia,
                absent: vang,
              }}
              size="large"
            />
          </div>
        </ChartCard>

        <ChartCard title="Tỷ lệ tham gia huấn luyện theo đơn vị">
          <BarChart
            labels={MOCK_DON_VI.map((d) => d.ten)}
            datasets={[
              {
                label: "Tỷ lệ tham gia (%)",
                color: "var(--chart-green)",
                data: MOCK_DON_VI.map((d) => d.thamGia),
              },
            ]}
            orientation="vertical"
            height={240}
            showLegend={false}
            unit="%"
            maxValue={100}
          />
        </ChartCard>
      </div>

      {/* ── Row 2: Tổng hợp theo loại quân ── */}
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>Tổng hợp quân số toàn đơn vị</h3>
      </div>

      <div className={styles.row4col}>
        <ChartCard title="Phân bố quân số theo loại quân">
          <PieChart
            chart={{
              id: "loai-quan-dist",
              name: "Phân bố",
              unitType: "battalion",
              total: MOCK_LOAI_QUAN.tongQS.reduce((a, b) => a + b, 0),
              present: MOCK_LOAI_QUAN.thamGia.reduce((a, b) => a + b, 0),
              absent: MOCK_LOAI_QUAN.vang.reduce((a, b) => a + b, 0),
            }}
            size="small"
          />
        </ChartCard>

        <ChartCard title="Quân số phân huấn luyện">
          <BarChart
            labels={MOCK_LOAI_QUAN.labels}
            datasets={[
              {
                label: "Quân số",
                color: "var(--chart-blue)",
                data: MOCK_LOAI_QUAN.tongQS,
              },
            ]}
            orientation="vertical"
            height={230}
            showLegend={false}
            showValues
          />
        </ChartCard>

        <ChartCard title="Quân số tham gia huấn luyện">
          <BarChart
            labels={MOCK_LOAI_QUAN.labels}
            datasets={[
              {
                label: "Tham gia",
                color: "var(--chart-green)",
                data: MOCK_LOAI_QUAN.thamGia,
              },
            ]}
            orientation="vertical"
            height={230}
            showLegend={false}
            showValues
          />
        </ChartCard>

        <ChartCard title="Quân số vắng huấn luyện">
          <BarChart
            labels={MOCK_LOAI_QUAN.labels}
            datasets={[
              {
                label: "Vắng",
                color: "var(--chart-red)",
                data: MOCK_LOAI_QUAN.vang,
              },
            ]}
            orientation="vertical"
            height={230}
            showLegend={false}
            showValues
          />
        </ChartCard>
      </div>

      {/* ── Row 3: Line chart + tỷ lệ chung ── */}
      <div className={styles.rowLineChart}>
        <ChartCard title="Tỷ lệ tham gia huấn luyện theo ngày">
          <LineChart
            labels={MOCK_TY_LE_THEO_NGAY.labels}
            datasets={[
              {
                label: "Tỷ lệ tham gia (%)",
                color: "var(--chart-purple)",
                data: MOCK_TY_LE_THEO_NGAY.data,
              },
            ]}
            height={200}
            showLegend={false}
            unit="%"
            maxValue={100}
            minValue={70}
          />
        </ChartCard>

        <div className={styles.overallRate}>
          <div className={styles.overallRateLabel}>TỶ LỆ THAM GIA CHUNG</div>
          <div className={styles.overallRateValue} style={{ color: "var(--chart-purple)" }}>
            {formatRate(tyLe)}
          </div>
          <div className={styles.overallRateSub}>tổng quân số</div>
        </div>
      </div>

    </div>
  );
}
