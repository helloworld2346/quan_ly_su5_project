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

} from "@fortawesome/free-solid-svg-icons";

// ── Mock data ──────────────────────────────────────────────────
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
  hienDien: [5, 25, 101, 108],
  tongQS: [29, 30, 108, 101],
  thamGia: [25, 28, 99, 97],
  vang: [4, 2, 9, 14],
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

  return (
    <div className={styles.wrapper}>

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

      {/* ── Row 1: Donut + Bar theo đơn vị ── */}
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

        <ChartCard title="Tỷ lệ tham gia huấn luyện theo đơn vị">
          <BarChart
            labels={MOCK_DON_VI.map((d) => d.ten)}
            datasets={[{
              label: "Tỷ lệ tham gia (%)",
              color: "var(--chart-green)",
              data: MOCK_DON_VI.map((d) => d.thamGia),
            }]}
            orientation="vertical"
            height={380}
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
        <ChartCard
          title="Quân số hiện diện"
          total={MOCK_LOAI_QUAN.hienDien.reduce((a, b) => a + b, 0)}
        >
          <BarChart
            labels={MOCK_LOAI_QUAN.labels}
            datasets={[{
              label: "Hiện diện",
              color: "var(--chart-green)",
              data: MOCK_LOAI_QUAN.hienDien,
            }]}
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
            datasets={[{
              label: "Quân số",
              color: "var(--chart-blue)",
              data: MOCK_LOAI_QUAN.tongQS,
            }]}
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
            datasets={[{
              label: "Tham gia",
              color: "var(--chart-green)",
              data: MOCK_LOAI_QUAN.thamGia,
            }]}
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
            datasets={[{
              label: "Vắng",
              color: "var(--chart-red)",
              data: MOCK_LOAI_QUAN.vang,
            }]}
            orientation="vertical"
            height={260}
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
            datasets={[{
              label: "Tỷ lệ tham gia (%)",
              color: "var(--chart-purple)",
              data: MOCK_TY_LE_THEO_NGAY.data,
            }]}
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
