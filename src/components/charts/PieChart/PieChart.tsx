import { useMemo, useState } from "react";

import styles from "./PieChart.module.css";

import { PRESENT_GRADIENTS } from "../../../constants/chartColors";

import type { AttendanceKey, TroopSegment } from "../../../types/troopStats";
import {
  getChartSegments,
  getPresentRate,
  type UnitTroopChart,
} from "../../../types/troopStats";

type Props = {
  chart: UnitTroopChart;
  size?: "large" | "small";
  badge?: string;
  unitType?: UnitTroopChart["unitType"];
};

function getSegmentOffsets(segments: TroopSegment[]) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let cumulative = 0;

  return segments.map((segment) => {
    const ratio = segment.value / total;
    const start = cumulative;
    cumulative += ratio;
    return { ...segment, ratio, start, total };
  });
}

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

export default function PieChart({
  chart,
  size = "small",
  badge,
  unitType = chart.unitType,
}: Props) {
  const presentGradientId = `present-${unitType}`;
  const [gStart, gEnd] = PRESENT_GRADIENTS[unitType];

  const segments = useMemo(() => getChartSegments(chart), [chart]);
  const sized = useMemo(() => getSegmentOffsets(segments), [segments]);
  const presentRate = getPresentRate(chart);

  const [hovered, setHovered] = useState<AttendanceKey | null>(null);

  const isLarge = size === "large";
  const radius = isLarge ? 92 : 62;
const stroke = isLarge ? 30 : 20;
  const viewSize = (radius + stroke) * 2;
  const center = viewSize / 2;
  const circumference = 2 * Math.PI * radius;

  const activeSegment = hovered ? sized.find((s) => s.key === hovered) : null;

  const centerValue = activeSegment ? activeSegment.value : chart.total;
  const centerCaption = activeSegment ? activeSegment.label : "Tổng quân số";

  const centerPercent =
    activeSegment && chart.total > 0
      ? ((activeSegment.value / chart.total) * 100).toFixed(1)
      : null;

  return (
    <article
      className={isLarge ? `${styles.card} ${styles.large}` : styles.card}
    >
      <div
        className={
          isLarge ? `${styles.header} ${styles.headerCompact}` : styles.header
        }
      >
        <div className={styles.titleContainer}>
          {!isLarge && <h3 className={styles.title}>{chart.name}</h3>}
          {badge && (
            <div className={styles.headerMeta}>
              <span className={styles.badge}>{badge}</span>
              <span className={styles.rateBadge}>
                {presentRate.toFixed(1)}% hiện diện
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.chartWrap}>
          <svg
            viewBox={`0 0 ${viewSize} ${viewSize}`}
            className={styles.chart}
            role="img"
            aria-label={`Biểu đồ ${chart.name}: tổng ${chart.total}, hiện diện ${chart.present}, vắng ${chart.absent}`}
          >
            <defs>
              <linearGradient
                id={presentGradientId}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={gStart} />
                <stop offset="100%" stopColor={gEnd} />
              </linearGradient>
            </defs>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e8eeeb"
              strokeWidth={stroke}
            />
            {sized.map((segment) => {
              const isActive = !hovered || hovered === segment.key;
              const isFocused = hovered === segment.key;

              return (
                <circle
                  key={segment.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={
                    segment.key === "present"
                      ? `url(#${presentGradientId})`
                      : segment.color
                  }
                  strokeWidth={isFocused ? stroke + 4 : stroke}
                  strokeDasharray={`${segment.ratio * circumference} ${circumference}`}
                  strokeDashoffset={-segment.start * circumference}
                  transform={`rotate(-90 ${center} ${center})`}
                  className={styles.segment}
                  style={{ opacity: isActive ? 1 : 0.28 }}
                  onMouseEnter={() => setHovered(segment.key)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(segment.key)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${segment.label}: ${segment.value}`}
                />
              );
            })}
          </svg>

          <div
            className={`${styles.centerLabel} ${hovered ? styles.centerActive : ""}`}
          >
            <span className={styles.centerValue}>
              {formatNumber(centerValue)}
            </span>
            <span className={styles.centerCaption}>{centerCaption}</span>
            {centerPercent && (
              <span className={styles.centerPercent}>{centerPercent}%</span>
            )}
          </div>

          {hovered && activeSegment && (
            <div className={styles.tooltip} role="tooltip">
              <strong>{activeSegment.label}</strong>
              <span>{formatNumber(activeSegment.value)} người</span>
              <span>
                {((activeSegment.value / chart.total) * 100).toFixed(1)}% / tổng
              </span>
            </div>
          )}
        </div>

        <ul className={styles.legend}>
          {segments.map((segment) => (
            <li key={segment.key}>
              <button
                type="button"
                className={
                  hovered === segment.key
                    ? `${styles.legendBtn} ${styles.legendBtnActive}`
                    : styles.legendBtn
                }
                onMouseEnter={() => setHovered(segment.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(segment.key)}
                onBlur={() => setHovered(null)}
              >
                <span
                  className={styles.swatch}
                  style={
                    segment.key === "present"
                      ? {
                          background: `linear-gradient(135deg, ${gStart}, ${gEnd})`,
                        }
                      : { background: segment.color }
                  }
                />
                <span className={styles.legendLabel}>{segment.label}</span>
                <span className={styles.legendValue}>
                  {formatNumber(segment.value)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
